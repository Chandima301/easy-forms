import {
	type RendererProps,
	registerContainerControl,
	useFormStoreContext,
} from '@easy-forms/core';
import { useEffect, useRef } from 'react';
import type { RepeatingGroupQuestion } from '../controls/repeatingGroup';
import { useProLicense } from './useProLicense';

const toIndices = (value: unknown): number[] =>
	Array.isArray(value) ? (value.filter((n) => typeof n === 'number') as number[]) : [];

// Mark `repeatingGroup` as a cross-boundary container so a form-level dependent
// reads it as an array of row objects (outside → inside deps). This must run from
// a runtime-retained code path: a bare top-level side-effect in the types-only
// `controls/repeatingGroup` module gets tree-shaken away under the package's
// `sideEffects: false`, so we register from inside this hook — which the renderer
// always calls, during render, before <Form> attaches its engine.
let containerRegistered = false;
function ensureContainerRegistered(): void {
	if (containerRegistered) return;
	registerContainerControl('repeatingGroup');
	containerRegistered = true;
}

export interface UseRepeatingGroupResult {
	/** Active row indices — sparse + monotonic, never reindexed. */
	indices: number[];
	/** Append a row (no-op at `maxItems`). */
	add: () => void;
	/** Remove a row by index (no-op at `minItems`). */
	remove: (index: number) => void;
	/** True when another row cannot be added. */
	atMax: boolean;
	/** True when rows may currently be removed (count > `minItems`). */
	canRemove: boolean;
	minItems: number;
	maxItems: number | undefined;
}

/**
 * Headless engine for the Pro `repeatingGroup` control. Owns the container-level
 * orchestration — the sparse monotonic index list (the field-array remove-bug
 * dodge), `minItems` seeding, add/remove, and `min`/`max` gating — so an ejectable
 * renderer can own all the markup while the moat stays in `@easy-forms/pro`.
 *
 * The container field's value is the ordered list of active item indices. Item
 * fields are ordinary parent-store fields keyed `${key}.${index}.${childKey}`
 * (rendered by `RepeatingGroupItem`), so they reuse the engine's validation /
 * dirty / nested `getValues()`.
 */
export function useRepeatingGroup({
	question,
	value,
	onChange,
}: RendererProps<RepeatingGroupQuestion>): UseRepeatingGroupResult {
	const store = useFormStoreContext();
	ensureContainerRegistered();
	// Side effect only: fire the one-time dev `assertLicensed` warning once per
	// control. Enforcement is soft/honor-based (prod never blocks), so the return
	// value is intentionally ignored and nothing license-related is exposed.
	useProLicense('repeatingGroup');

	const groupKey = question.key;
	const minItems = question.minItems ?? 0;
	const maxItems = question.maxItems;

	const indices = toIndices(value);

	// Seed `minItems` rows (and normalise an undefined container value to `[]`)
	// once the container field has registered. The parent <Field> registers it
	// *after* this child effect runs, and a declaratively-authored question has
	// no `defaultValue`, so the value stays `undefined` until we set it here.
	// `setValue` no-ops before registration, so this no-dependency effect retries
	// on the re-render that registration triggers, then latches. Done silently so
	// an untouched form is not marked dirty.
	const seeded = useRef(false);
	useEffect(() => {
		if (seeded.current) return;
		const current = store.getValue(groupKey);
		if (Array.isArray(current) && current.length > 0) {
			seeded.current = true; // declared / persisted rows — leave them
			return;
		}
		const seed = minItems > 0 ? Array.from({ length: minItems }, (_, i) => i) : [];
		store.setValue(groupKey, seed, { markDirty: false, validate: false });
		if (Array.isArray(store.getValue(groupKey))) seeded.current = true;
	});

	const atMax = maxItems !== undefined && indices.length >= maxItems;
	const canRemove = indices.length > minItems;

	const add = () => {
		if (atMax) return;
		const next = indices.length > 0 ? Math.max(...indices) + 1 : 0;
		onChange([...indices, next]);
	};

	const remove = (index: number) => {
		if (!canRemove) return;
		onChange(indices.filter((i) => i !== index));
	};

	return { indices, add, remove, atMax, canRemove, minItems, maxItems };
}
