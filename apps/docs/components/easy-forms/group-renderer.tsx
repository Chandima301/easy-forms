// GroupRenderer — ejectable group/section chrome. Walks a group tree, renders
// questions through core's Field dispatch, recurses into subgroups. Utility-styled.
// Two invariants preserved: hidden groups are CSS-hidden (display:none, not
// unmounted); the grid/stack layout class goes on the INNER content div, not the
// <section> (else the title becomes the first grid cell and misaligns fields).
import { cn } from '@/lib/utils';
import { Field, type GroupRendererProps, useGroup } from '@easy-forms/core';
import { useMemo } from 'react';

const GRID_COLS: Record<number, string> = {
	1: 'grid-cols-1',
	2: 'grid-cols-1 md:grid-cols-2',
	3: 'grid-cols-1 md:grid-cols-3',
	4: 'grid-cols-1 md:grid-cols-4',
	6: 'grid-cols-2 md:grid-cols-6',
	12: 'grid-cols-6 md:grid-cols-12',
};

export function GroupRenderer({ group, depth = 0 }: GroupRendererProps) {
	const overrides = useGroup(group.id);
	const effective = useMemo(
		() => (Object.keys(overrides).length === 0 ? group : { ...group, ...overrides }),
		[group, overrides]
	);

	const layoutClass =
		effective.layout === 'grid'
			? cn('easy-forms-grid', 'grid gap-4', GRID_COLS[effective.gridCols ?? 2] ?? GRID_COLS[2])
			: cn('easy-forms-stack', 'flex flex-col gap-4');

	const hidden = overrides.hidden === true;

	return (
		<section
			className={cn('easy-forms-group', 'flex flex-col gap-4', effective.className)}
			data-depth={depth}
			style={hidden ? { display: 'none' } : undefined}
			aria-hidden={hidden || undefined}
		>
			{effective.title ? (
				<header className={cn('easy-forms-group__header', 'flex flex-col gap-0.5')}>
					<h3
						className={cn(
							'easy-forms-group__title',
							'text-sm font-semibold uppercase tracking-wide text-foreground'
						)}
					>
						{effective.title}
					</h3>
					{effective.description ? (
						<p className={cn('easy-forms-group__description', 'text-xs text-muted-foreground')}>
							{effective.description}
						</p>
					) : null}
				</header>
			) : null}
			<div className={layoutClass}>
				{group.questions?.map((question) => (
					<Field key={question.key} question={question} />
				))}
				{group.groups?.map((child, index) => (
					<GroupRenderer
						key={child.id ?? child.title ?? `group-${depth}-${index}`}
						group={child}
						depth={depth + 1}
					/>
				))}
			</div>
		</section>
	);
}
