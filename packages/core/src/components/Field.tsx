// Field — registers itself with the store and dispatches to the matching
// renderer in the registry. The dispatch cast is the only place we drop type
// safety internally; the public renderer API stays narrowed per-control.

import { useEffect, useMemo } from 'react';
import { useFormStoreContext } from '../context/useFormStoreContext';
import { useField } from '../hooks/useField';
import type { Question } from '../types/controls';
import { useRendererRegistry } from './RegistryContext';

export interface FieldProps {
	question: Question;
}

export function Field({ question }: FieldProps) {
	const store = useFormStoreContext();
	const registry = useRendererRegistry();

	// Register on mount, unregister on unmount.
	useEffect(() => {
		const unregister = store.registerField({
			key: question.key,
			initialValue: question.defaultValue,
			validators: question.validators,
			staticRequired: !!(question.validators as { required?: unknown } | undefined)?.required,
			ignoreDirtyState: question.ignoreDirtyState,
			clearWhenHidden: question.clearWhenHidden,
		});
		return unregister;
	}, [store, question]);

	const field = useField(question.key);

	// Merge static question with dynamic runtime overrides. Renderers read
	// everything from `effectiveQuestion` — no separate `computed` map, no
	// `required` / `readOnly` props on the side.
	//
	// We also surface the *static* `validators.required` flag as
	// `effectiveQuestion.required` (unless the runtime override already set
	// one) so renderers can read a single property regardless of whether
	// requiredness comes from validators or from a dep.
	const effectiveQuestion = useMemo(() => {
		const overrides = field.runtimeOverrides;
		const staticRequired = !!(question.validators as { required?: unknown } | undefined)?.required;
		const overrideKeys = Object.keys(overrides);
		if (overrideKeys.length === 0 && !staticRequired) return question;
		const merged: Question = { ...question, ...overrides } as Question;
		if (staticRequired && merged.required === undefined) {
			merged.required = true;
		}
		return merged;
	}, [question, field.runtimeOverrides]);

	if (field.hidden) return null;

	// biome-ignore lint/suspicious/noExplicitAny: dispatch boundary — registry is keyed by control type, renderer types are validated at registration.
	const Renderer = registry[effectiveQuestion.control] as any;
	if (!Renderer) {
		throw new Error(
			`No renderer registered for control "${effectiveQuestion.control}". ` +
				'Pass a registry via <Form registry={...} /> that includes this control.'
		);
	}

	return (
		<Renderer
			question={effectiveQuestion}
			value={field.value}
			onChange={(v: unknown) => store.setValue(question.key, v, { touch: true })}
			onBlur={() => {
				store.setTouched(question.key, true);
				void store.validateField(question.key);
			}}
			error={field.error}
			errors={field.errors}
			touched={field.touched}
			dirty={field.dirty}
		/>
	);
}
