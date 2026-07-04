import {
	type FormSchema,
	type Group,
	GroupRenderer,
	attachDependencyEngine,
	defaultDependencyHandlers,
	useFormStoreContext,
} from '@easy-forms/core';
import { useEffect, useMemo } from 'react';
import { prefixItemGroups } from '../controls/prefixItemGroups';

export interface RepeatingGroupRowProps {
	groupKey: string;
	index: number;
	groups: Group[];
	defaultItem?: Record<string, unknown>;
	heading?: string;
	removeLabel: string;
	onRemove?: () => void;
}

/**
 * One repeated item. Renders the configured item `groups` through core's
 * `GroupRenderer` (so layout + nesting match the rest of the schema), with all
 * keys/ids prefixed for this row. The prefixed tree is memoised on the row's
 * stable inputs, so adding/removing *other* rows never changes this row's field
 * identities — preserving their state.
 *
 * A per-row dependency engine is attached over the prefixed groups so within-row
 * `propsDependsOn` / `valueDependsOn` / `resetDependsOn` fire (the parent form's
 * engine only sees the static schema, not the dynamic item fields). Each row's
 * engine subscribes only to its own prefixed keys, so rows stay isolated.
 */
export function RepeatingGroupRow({
	groupKey,
	index,
	groups,
	defaultItem,
	heading,
	removeLabel,
	onRemove,
}: RepeatingGroupRowProps) {
	const store = useFormStoreContext();

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
		<div className="easy-forms-repeat__item" data-index={index}>
			{heading ? <div className="easy-forms-repeat__item-header">{heading}</div> : null}
			{prefixed.map((group, position) => (
				<GroupRenderer key={group.id ?? group.title ?? `item-group-${position}`} group={group} />
			))}
			{onRemove ? (
				<button type="button" className="easy-forms-repeat__remove" onClick={onRemove}>
					{removeLabel}
				</button>
			) : null}
		</div>
	);
}
