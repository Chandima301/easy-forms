// Store types. The store mutates state immutably at the *FieldState* level:
// when any property of a field changes, the field object is replaced with a
// new reference so `useSyncExternalStore` can detect the change via Object.is.

import type { RuntimeProps } from '../types/dependencies';
import type { ValidationMode } from '../types/schema';

export interface FieldState {
	value: unknown;
	initialValue: unknown;
	error: string | null;
	errors: Record<string, string>;
	touched: boolean;
	dirty: boolean;
	validating: boolean;
	/**
	 * Dynamic question prop overrides written by `propsDependsOn`.
	 * Examples: `{ hidden: true }`, `{ options: [...] }`, `{ required: true }`.
	 * Merged with the static question by <Field> before passing to the renderer.
	 */
	runtimeOverrides: Partial<RuntimeProps>;
	/**
	 * True when an ancestor group's effective `hidden` is true. Maintained by
	 * the store's group cascade; lets `useField` compute effective hidden
	 * without consulting `hiddenByGroup` externally.
	 */
	hiddenByAncestor: boolean;
}

export interface FormDerivedState {
	isDirty: boolean;
	isValid: boolean;
	isSubmitting: boolean;
	submitCount: number;
	values: Record<string, unknown>;
	dirtyFields: Record<string, true>;
	touchedFields: Record<string, true>;
	errors: Record<string, string>;
}

export interface FieldDescriptor {
	key: string;
	initialValue?: unknown;
	validators?: unknown;
	/** Static `validators.required` flag mirrored here so the store can short-circuit. */
	staticRequired?: boolean;
	ignoreDirtyState?: boolean;
	/** Reset on the false→true hide edge (per-field). */
	clearWhenHidden?: boolean;
}

export interface SetValueOptions {
	/** Default true. */
	validate?: boolean;
	/** Default false. */
	touch?: boolean;
	/** Default true. When false, dirty flag is not updated (used by dep-engine writes). */
	markDirty?: boolean;
}

export interface FormStoreOptions {
	validationMode?: ValidationMode;
	/** Optional global form-data type — only used for typing in TS, not at runtime. */
	initialValues?: Record<string, unknown>;
}

export interface FormStore {
	// --- read ---
	getFieldState(key: string): FieldState;
	getValues(): Record<string, unknown>;
	/**
	 * Output-only nested view of `getValues()`: dotted keys
	 * (`bankAccounts.0.currency`) assemble into nested arrays/objects. Passed to
	 * the submit handler; the flat `getValues()` is unchanged for internal use.
	 */
	getNestedValues(): Record<string, unknown>;
	getValue(key: string): unknown;
	getDerived(): FormDerivedState;
	getGroupRuntimeProps(groupId: string): Partial<RuntimeProps>;

	// --- write (field) ---
	registerField(descriptor: FieldDescriptor): () => void;
	unregisterField(key: string): void;
	setValue(key: string, value: unknown, options?: SetValueOptions): void;
	setError(key: string, error: string | null): void;
	setTouched(key: string, touched: boolean): void;
	/** Merges patch into the field's `runtimeOverrides`. */
	setRuntimeProps(key: string, patch: Partial<RuntimeProps>): void;
	/** Restore field to `initialValue` and clear error/touched/dirty. */
	resetField(key: string): void;
	reset(values?: Record<string, unknown>): void;

	// --- write (group) ---
	registerGroup(descriptor: GroupDescriptor): () => void;
	unregisterGroup(id: string): void;
	setGroupRuntimeProps(id: string, patch: Partial<RuntimeProps>): void;
	/** Engine tells the store which field keys belong to each group (for hiddenByGroup cascade). */
	setGroupFieldKeys(id: string, fieldKeys: readonly string[]): void;

	// --- validate ---
	validateField(key: string): Promise<boolean>;
	validateAll(keys?: string[]): Promise<boolean>;

	// --- submit ---
	submit(handler: (values: Record<string, unknown>) => void | Promise<void>): Promise<void>;

	// --- subscribe ---
	subscribeField(key: string, listener: () => void): () => void;
	subscribeGroup(id: string, listener: () => void): () => void;
	subscribeForm(listener: () => void): () => void;
}

export interface GroupDescriptor {
	id: string;
	/** Reset every descendant field on the false→true hide edge. */
	clearWhenHidden?: boolean;
}
