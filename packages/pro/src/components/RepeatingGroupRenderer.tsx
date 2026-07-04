import { type RendererProps, useFormStoreContext } from '@easy-forms/core';
import { useEffect, useRef } from 'react';
import type { RepeatingGroupQuestion } from '../controls/repeatingGroup';
import { useProLicense } from '../hooks/useProLicense';
import { ProWatermark } from './ProWatermark';
import { RepeatingGroupRow } from './RepeatingGroupRow';

const toIndices = (value: unknown): number[] =>
	Array.isArray(value) ? (value.filter((n) => typeof n === 'number') as number[]) : [];

/**
 * Pro `repeatingGroup` control. The container field's value is the ordered list
 * of active item indices (sparse + monotonic — never reindexed). Item fields are
 * ordinary parent-store fields keyed `${groupKey}.${index}.${childKey}`, so they
 * reuse the engine's validation / dirty / nested `getValues()`.
 */
export function RepeatingGroupRenderer({
	question,
	value,
	onChange,
}: RendererProps<RepeatingGroupQuestion>) {
	const store = useFormStoreContext();
	const { licensed } = useProLicense('repeatingGroup');

	const groupKey = question.key;
	const groups = question.groups;
	const minItems = question.minItems ?? 0;
	const maxItems = question.maxItems;
	const addLabel = question.addLabel ?? 'Add';
	const removeLabel = question.removeLabel ?? 'Remove';
	const defaultItem = question.defaultItem;
	const itemLabel = question.itemLabel;

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

	return (
		<div className="easy-forms-repeat" data-control="repeatingGroup">
			{itemLabel || question.label ? (
				<div className="easy-forms-repeat__header">{question.label}</div>
			) : null}
			{indices.map((index, position) => (
				<RepeatingGroupRow
					key={index}
					groupKey={groupKey}
					index={index}
					groups={groups}
					defaultItem={defaultItem}
					heading={itemLabel?.(position)}
					removeLabel={removeLabel}
					onRemove={canRemove ? () => remove(index) : undefined}
				/>
			))}
			<button type="button" className="easy-forms-repeat__add" onClick={add} disabled={atMax}>
				{addLabel}
			</button>
			{licensed ? null : <ProWatermark />}
		</div>
	);
}
