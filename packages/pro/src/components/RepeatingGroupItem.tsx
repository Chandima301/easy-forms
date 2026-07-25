import {
	type FormSchema,
	type Group,
	attachDependencyEngine,
	defaultDependencyHandlers,
	useChromeRegistry,
	useFormStoreContext,
} from '@easy-forms/core';
import { useEffect, useMemo } from 'react';
import { prefixItemGroups } from '../controls/prefixItemGroups';

export interface RepeatingGroupItemProps {
	groupKey: string;
	index: number;
	groups: Group[];
	defaultItem?: Record<string, unknown>;
}

/**
 * One repeated item's engine + fields. Renders the configured item `groups`
 * through core's `GroupRenderer` (so layout + nesting match the rest of the
 * schema), with all keys/ids prefixed for this row. The prefixed tree is memoised
 * on the row's stable inputs, so adding/removing *other* rows never changes this
 * row's field identities — preserving their state.
 *
 * A per-row dependency engine is attached over the prefixed groups so within-row
 * `propsDependsOn` / `valueDependsOn` / `resetDependsOn` fire (the parent form's
 * engine only sees the static schema, not the dynamic item fields). Each row's
 * engine subscribes only to its own prefixed keys, so rows stay isolated.
 *
 * This is Pro-owned (the moat): the ejectable registry renderer owns all the
 * surrounding markup, but the consumer must render this to get any fields. The
 * row's fields are rendered through the injected `GroupRenderer`; the
 * unlicensed-dev watermark is centralized in the license layer (`useProLicense`
 * / `registerProUsage`), not rendered by this component.
 */
export function RepeatingGroupItem({
	groupKey,
	index,
	groups,
	defaultItem,
}: RepeatingGroupItemProps) {
	const store = useFormStoreContext();
	const { GroupRenderer } = useChromeRegistry();

	const prefixed = useMemo(
		() => prefixItemGroups(groups, `${groupKey}.${index}.`, defaultItem),
		[groups, groupKey, index, defaultItem]
	);

	// Runs after the row's <Field>s have registered (descendant effects first),
	// so the engine's initial pass sees this row's fields. Re-attaches only if the
	// prefixed tree changes; detaches on unmount.
	useEffect(() => {
		const schema = { groups: prefixed } as FormSchema;
		const attached = attachDependencyEngine(store, schema, defaultDependencyHandlers);
		return attached.detach;
	}, [store, prefixed]);

	return (
		<>
			{prefixed.map((group, position) => (
				<GroupRenderer key={group.id ?? group.title ?? `item-group-${position}`} group={group} />
			))}
		</>
	);
}
