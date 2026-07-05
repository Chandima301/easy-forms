// createFormStore — the heart of the state engine.
//
// Design contract:
// - Field state objects are replaced (not mutated in place) on every change,
//   so `useSyncExternalStore`'s getSnapshot stays correct via Object.is.
// - Listeners are topic-based: subscribing to a field key only wakes when
//   that field's object identity changes; subscribing to FORM_TOPIC wakes on
//   any change (used by useFormState).
// - Group runtime overrides live in a separate map keyed by group id; group
//   topics are subscribed via a prefixed key on the same hub.
// - Validation runs synchronously first, then queues async customs with a
//   per-field token. Stale async results are dropped if the value changed
//   again before they resolved.

import type { RuntimeProps } from '../types/dependencies';
import { firstError, runAsyncCustoms, runSyncValidators } from '../validation/runValidators';
import { assembleNestedValues } from './assembleNested';
import { FORM_TOPIC, createListenerHub } from './listeners';
import type {
	FieldDescriptor,
	FieldState,
	FormDerivedState,
	FormStore,
	FormStoreOptions,
	GroupDescriptor,
	SetValueOptions,
} from './types';

const GROUP_TOPIC_PREFIX = '__group__:';

function emptyFieldState(initialValue: unknown): FieldState {
	return {
		value: initialValue,
		initialValue,
		error: null,
		errors: {},
		touched: false,
		dirty: false,
		validating: false,
		runtimeOverrides: {},
		hiddenByAncestor: false,
	};
}

interface InternalFieldDescriptor extends FieldDescriptor {
	ignoreDirtyState: boolean;
}

interface InternalGroupDescriptor extends GroupDescriptor {}

export function createFormStore(options: FormStoreOptions = {}): FormStore {
	const hub = createListenerHub();
	const fields = new Map<string, FieldState>();
	const fieldDescriptors = new Map<string, InternalFieldDescriptor>();
	const validationTokens = new Map<string, number>();
	// Stable placeholder per key so `useField` against an unregistered key has
	// snapshot identity until the descriptor lands.
	const placeholders = new Map<string, FieldState>();

	// --- Group state ---
	const groupDescriptors = new Map<string, InternalGroupDescriptor>();
	const groupRuntimeOverrides = new Map<string, Partial<RuntimeProps>>();
	const groupFieldKeys = new Map<string, readonly string[]>();
	const emptyGroupOverrides: Partial<RuntimeProps> = Object.freeze({});
	/** Field keys whose ancestor group is currently hidden — excluded from getValues. */
	const hiddenByGroup = new Set<string>();

	let submitting = false;
	let submitCount = 0;

	function patchField(key: string, patch: Partial<FieldState>): void {
		const current = fields.get(key);
		if (!current) return;
		const next: FieldState = { ...current, ...patch };
		fields.set(key, next);
		hub.emit(key);
		hub.emit(FORM_TOPIC);
	}

	function isFieldHidden(_key: string, state: FieldState): boolean {
		return state.runtimeOverrides.hidden === true || state.hiddenByAncestor;
	}

	function getValues(): Record<string, unknown> {
		const out: Record<string, unknown> = {};
		for (const [key, state] of fields) {
			if (!isFieldHidden(key, state)) out[key] = state.value;
		}
		return out;
	}

	// Output-only nested view: dotted keys (`bankAccounts.0.currency`) assemble
	// into nested arrays/objects. Internal consumers (validators, dependency
	// engine, derived state) keep using the flat `getValues()`.
	function getNestedValues(): Record<string, unknown> {
		return assembleNestedValues(getValues());
	}

	function registerField(descriptor: FieldDescriptor): () => void {
		const initial =
			descriptor.initialValue !== undefined
				? descriptor.initialValue
				: options.initialValues?.[descriptor.key];
		const existing = fields.get(descriptor.key);
		const next = existing ?? emptyFieldState(initial);
		fields.set(descriptor.key, next);
		placeholders.delete(descriptor.key);
		fieldDescriptors.set(descriptor.key, {
			...descriptor,
			ignoreDirtyState: descriptor.ignoreDirtyState ?? false,
		});
		hub.emit(descriptor.key);
		hub.emit(FORM_TOPIC);
		return () => unregisterField(descriptor.key);
	}

	function unregisterField(key: string): void {
		fields.delete(key);
		fieldDescriptors.delete(key);
		validationTokens.delete(key);
		hiddenByGroup.delete(key);
		hub.emit(key);
		hub.emit(FORM_TOPIC);
	}

	function setValue(key: string, value: unknown, opts: SetValueOptions = {}): void {
		const current = fields.get(key);
		if (!current) return;
		const dirty =
			opts.markDirty === false ? current.dirty : !Object.is(value, current.initialValue);
		patchField(key, { value, dirty });
		const shouldValidate = opts.validate ?? true;
		const shouldTouch = opts.touch ?? false;
		if (shouldTouch) patchField(key, { touched: true });
		if (shouldValidate) {
			void validateField(key);
		}
	}

	function setError(key: string, error: string | null): void {
		const current = fields.get(key);
		if (!current) return;
		const errors = { ...current.errors };
		if (error) errors._manual = error;
		else delete errors._manual;
		patchField(key, { error: error ?? firstError(errors), errors });
	}

	function setTouched(key: string, touched: boolean): void {
		patchField(key, { touched });
	}

	function setRuntimeProps(key: string, patch: Partial<RuntimeProps>): void {
		const current = fields.get(key);
		if (!current) return;
		// Shallow-equality bail-out: if every key in patch matches the existing
		// override value, no work to do (avoids waking subscribers for a no-op).
		let changed = false;
		for (const k of Object.keys(patch) as (keyof RuntimeProps)[]) {
			if (!Object.is(current.runtimeOverrides[k], patch[k])) {
				changed = true;
				break;
			}
		}
		if (!changed) return;
		const runtimeOverrides = { ...current.runtimeOverrides, ...patch };
		patchField(key, { runtimeOverrides });
	}

	function resetField(key: string): void {
		const current = fields.get(key);
		if (!current) return;
		const next: FieldState = {
			...current,
			value: current.initialValue,
			error: null,
			errors: {},
			touched: false,
			dirty: false,
			validating: false,
		};
		fields.set(key, next);
		validationTokens.delete(key);
		hub.emit(key);
		hub.emit(FORM_TOPIC);
	}

	// --- Groups ---

	function registerGroup(descriptor: GroupDescriptor): () => void {
		groupDescriptors.set(descriptor.id, descriptor);
		if (!groupRuntimeOverrides.has(descriptor.id)) {
			groupRuntimeOverrides.set(descriptor.id, {});
		}
		hub.emit(GROUP_TOPIC_PREFIX + descriptor.id);
		hub.emit(FORM_TOPIC);
		return () => unregisterGroup(descriptor.id);
	}

	function unregisterGroup(id: string): void {
		groupDescriptors.delete(id);
		groupRuntimeOverrides.delete(id);
		groupFieldKeys.delete(id);
		// Clean up any cascaded hidden entries owned by this group.
		hub.emit(GROUP_TOPIC_PREFIX + id);
		hub.emit(FORM_TOPIC);
	}

	function setGroupRuntimeProps(id: string, patch: Partial<RuntimeProps>): void {
		const current = groupRuntimeOverrides.get(id) ?? {};
		let changed = false;
		for (const k of Object.keys(patch) as (keyof RuntimeProps)[]) {
			if (!Object.is(current[k], patch[k])) {
				changed = true;
				break;
			}
		}
		if (!changed) return;
		const next = { ...current, ...patch };
		groupRuntimeOverrides.set(id, next);
		// If `hidden` is in the patch, cascade to descendant fields'
		// `hiddenByAncestor` flag via patchField so subscribers wake correctly.
		if ('hidden' in patch) {
			const descendants = groupFieldKeys.get(id) ?? [];
			const hidden = !!next.hidden;
			for (const key of descendants) {
				if (hidden) hiddenByGroup.add(key);
				else hiddenByGroup.delete(key);
				const fieldState = fields.get(key);
				if (fieldState && fieldState.hiddenByAncestor !== hidden) {
					patchField(key, { hiddenByAncestor: hidden });
				}
			}
		}
		hub.emit(GROUP_TOPIC_PREFIX + id);
		hub.emit(FORM_TOPIC);
	}

	function setGroupFieldKeys(id: string, fieldKeys: readonly string[]): void {
		const previous = groupFieldKeys.get(id) ?? [];
		groupFieldKeys.set(id, fieldKeys);
		// If the group is currently hidden, sync the cascade for the new key set.
		const overrides = groupRuntimeOverrides.get(id);
		if (overrides?.hidden) {
			for (const key of previous) {
				hiddenByGroup.delete(key);
				const fieldState = fields.get(key);
				if (fieldState && fieldState.hiddenByAncestor) {
					patchField(key, { hiddenByAncestor: false });
				}
			}
			for (const key of fieldKeys) {
				hiddenByGroup.add(key);
				const fieldState = fields.get(key);
				if (fieldState && !fieldState.hiddenByAncestor) {
					patchField(key, { hiddenByAncestor: true });
				}
			}
		}
	}

	function getGroupRuntimeProps(id: string): Partial<RuntimeProps> {
		return groupRuntimeOverrides.get(id) ?? emptyGroupOverrides;
	}

	// --- Validation / submit / read ---

	async function validateField(key: string): Promise<boolean> {
		const descriptor = fieldDescriptors.get(key);
		const current = fields.get(key);
		if (!descriptor || !current) return true;
		const validators = descriptor.validators as Record<string, unknown> | undefined;
		// Short-circuit hidden fields — no validation errors while hidden (own or via group).
		if (isFieldHidden(key, current)) {
			patchField(key, { error: null, errors: {}, validating: false });
			return true;
		}

		const token = (validationTokens.get(key) ?? 0) + 1;
		validationTokens.set(key, token);
		const allValues = getValues();
		// Dynamic required from `propsDependsOn` lives in runtimeOverrides.
		const dynamicRequired = current.runtimeOverrides.required === true;
		const effectiveValidators =
			dynamicRequired && !validators?.required
				? { ...(validators ?? {}), required: true }
				: validators;
		const { errors: syncErrors, pendingCustoms } = runSyncValidators(
			effectiveValidators,
			current.value,
			allValues
		);

		const syncFailed = Object.keys(syncErrors).length > 0;
		patchField(key, {
			errors: syncErrors,
			error: firstError(syncErrors),
			validating: pendingCustoms.length > 0 && !syncFailed,
		});

		if (syncFailed) {
			void Promise.allSettled(pendingCustoms.map((p) => p.promise));
			return false;
		}
		if (pendingCustoms.length === 0) return true;

		const asyncErrors = await runAsyncCustoms(
			pendingCustoms,
			() => validationTokens.get(key) !== token
		);
		if (validationTokens.get(key) !== token) return false;
		const merged = { ...syncErrors, ...asyncErrors };
		patchField(key, {
			errors: merged,
			error: firstError(merged),
			validating: false,
		});
		return Object.keys(merged).length === 0;
	}

	async function validateAll(keys?: string[]): Promise<boolean> {
		const targets = keys ?? Array.from(fields.keys());
		const results = await Promise.all(targets.map((k) => validateField(k)));
		return results.every(Boolean);
	}

	async function submit(
		handler: (values: Record<string, unknown>) => void | Promise<void>
	): Promise<void> {
		submitting = true;
		submitCount += 1;
		hub.emit(FORM_TOPIC);
		try {
			const ok = await validateAll();
			if (!ok) return;
			await handler(getNestedValues());
		} finally {
			submitting = false;
			hub.emit(FORM_TOPIC);
		}
	}

	function reset(values?: Record<string, unknown>): void {
		for (const [key, state] of fields) {
			const next = values?.[key] ?? state.initialValue;
			fields.set(key, {
				...state,
				value: next,
				initialValue: next,
				error: null,
				errors: {},
				touched: false,
				dirty: false,
				validating: false,
			});
			hub.emit(key);
		}
		validationTokens.clear();
		hub.emit(FORM_TOPIC);
	}

	function getFieldState(key: string): FieldState {
		const current = fields.get(key);
		if (current) return current;
		let placeholder = placeholders.get(key);
		if (!placeholder) {
			placeholder = emptyFieldState(undefined);
			placeholders.set(key, placeholder);
		}
		return placeholder;
	}

	function getValue(key: string): unknown {
		return fields.get(key)?.value;
	}

	function getDerived(): FormDerivedState {
		let isDirty = false;
		let isValid = true;
		const values: Record<string, unknown> = {};
		const dirtyFields: Record<string, true> = {};
		const touchedFields: Record<string, true> = {};
		const errors: Record<string, string> = {};
		for (const [key, state] of fields) {
			const hidden = isFieldHidden(key, state);
			if (!hidden) values[key] = state.value;
			const ignore = fieldDescriptors.get(key)?.ignoreDirtyState ?? false;
			if (state.dirty) {
				dirtyFields[key] = true;
				if (!ignore) isDirty = true;
			}
			if (state.touched) touchedFields[key] = true;
			if (state.error && !hidden) {
				errors[key] = state.error;
				isValid = false;
			}
		}
		return {
			isDirty,
			isValid,
			isSubmitting: submitting,
			submitCount,
			values,
			dirtyFields,
			touchedFields,
			errors,
		};
	}

	return {
		getFieldState,
		getValues,
		getNestedValues,
		getValue,
		getDerived,
		getGroupRuntimeProps,
		registerField,
		unregisterField,
		setValue,
		setError,
		setTouched,
		setRuntimeProps,
		resetField,
		reset,
		registerGroup,
		unregisterGroup,
		setGroupRuntimeProps,
		setGroupFieldKeys,
		validateField,
		validateAll,
		submit,
		subscribeField: (key, listener) => hub.on(key, listener),
		subscribeKeyAndDescendants: (key, listener) => hub.onSubtree(key, listener),
		subscribeGroup: (id, listener) => hub.on(GROUP_TOPIC_PREFIX + id, listener),
		subscribeForm: (listener) => hub.on(FORM_TOPIC, listener),
	};
}
