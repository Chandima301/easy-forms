// One repeated row's engine. Owns the row's real logic — prefixing every key/id for
// this row index, and attaching a per-row dependency engine so within-row
// `propsDependsOn` / `valueDependsOn` / `resetDependsOn` fire (the parent form's
// engine only sees the static schema, not the dynamic item fields). Returns the
// prefixed groups for an ejectable renderer to draw.
//
// The prefixed tree is memoised on the row's stable inputs, so adding/removing
// *other* rows never changes this row's field identities — preserving their state.
// Usage is registered by the container hook (`useRepeatingGroup`), so this does not
// call `useProLicense` itself.
import {
	type FormSchema,
	type Group,
	attachDependencyEngine,
	defaultDependencyHandlers,
	useFormStoreContext,
} from '@easy-forms/core';
import { useEffect, useMemo } from 'react';
import { prefixItemGroups } from '../controls/prefixItemGroups';

export interface UseRepeatingGroupItemOptions {
	groupKey: string;
	index: number;
	groups: Group[];
	defaultItem?: Record<string, unknown>;
}

export interface UseRepeatingGroupItemResult {
	/** The row's groups with every key/id prefixed as `${groupKey}.${index}.`. */
	groups: Group[];
}

export function useRepeatingGroupItem({
	groupKey,
	index,
	groups,
	defaultItem,
}: UseRepeatingGroupItemOptions): UseRepeatingGroupItemResult {
	const store = useFormStoreContext();

	const prefixed = useMemo(
		() => prefixItemGroups(groups, `${groupKey}.${index}.`, defaultItem),
		[groups, groupKey, index, defaultItem]
	);

	// Runs after the row's <Field>s have registered (descendant effects first), so
	// the engine's initial pass sees this row's fields. Detaches on unmount.
	useEffect(() => {
		const schema = { groups: prefixed } as FormSchema;
		const attached = attachDependencyEngine(store, schema, defaultDependencyHandlers);
		return attached.detach;
	}, [store, prefixed]);

	return { groups: prefixed };
}
