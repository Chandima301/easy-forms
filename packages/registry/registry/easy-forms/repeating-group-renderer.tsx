// RepeatingGroupRenderer — renderer for the Pro `repeatingGroup` control.
//
// This owns ALL the markup + styling for a repeating section: the container,
// header, per-row card, and Add / Remove buttons. Styled the shadcn way — Tailwind
// theme-token utilities + `cn()` + the shadcn `Button` primitive — so it themes with
// the rest of your form. Edit freely to restyle. The `easy-forms-repeat*` classes are
// unstyled semantic hooks (like `easy-forms-field`) for targeting, not styling.
//
// The engine (sparse row indices, seeding, min/max gating, the per-row scoped
// dependency engine) lives behind `useRepeatingGroup` + `<RepeatingGroupItem>` in
// @easy-forms/pro. Requires @easy-forms/pro. Wire it into your renderer registry:
//   import { RepeatingGroupRenderer } from '@/components/easy-forms/repeating-group-renderer';
//   export const easyFormsRegistry = { ...existing, repeatingGroup: RepeatingGroupRenderer };

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RendererProps } from '@easy-forms/core';
import {
	RepeatingGroupItem,
	type RepeatingGroupQuestion,
	useRepeatingGroup,
} from '@easy-forms/pro';

export function RepeatingGroupRenderer(props: RendererProps<RepeatingGroupQuestion>) {
	const { question } = props;
	const { indices, add, remove, atMax, canRemove } = useRepeatingGroup(props);

	const addLabel = question.addLabel ?? 'Add';
	const removeLabel = question.removeLabel ?? 'Remove';
	const itemLabel = question.itemLabel;

	return (
		<div className={cn('easy-forms-repeat', 'flex flex-col gap-4')} data-control="repeatingGroup">
			{question.label ? (
				<div className={cn('easy-forms-repeat__header', 'text-sm font-medium text-foreground')}>
					{question.label}
				</div>
			) : null}
			{indices.map((index, position) => (
				<div
					className={cn(
						'easy-forms-repeat__item',
						'relative flex flex-col gap-4 rounded-lg border border-border bg-card/40 p-4'
					)}
					data-index={index}
					key={index}
				>
					{itemLabel ? (
						<div
							className={cn(
								'easy-forms-repeat__item-header',
								'text-sm font-medium text-muted-foreground'
							)}
						>
							{itemLabel(position)}
						</div>
					) : null}
					<RepeatingGroupItem
						groupKey={question.key}
						index={index}
						groups={question.groups}
						defaultItem={question.defaultItem}
					/>
					{canRemove ? (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className={cn(
								'easy-forms-repeat__remove',
								'self-end text-destructive hover:text-destructive'
							)}
							onClick={() => remove(index)}
						>
							{removeLabel}
						</Button>
					) : null}
				</div>
			))}
			<Button
				type="button"
				variant="outline"
				size="sm"
				className={cn('easy-forms-repeat__add', 'self-start')}
				onClick={add}
				disabled={atMax}
			>
				{addLabel}
			</Button>
		</div>
	);
}
