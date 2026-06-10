// GroupRenderer — walks a group tree recursively. A group may contain either
// `questions` (leaves) or `groups` (subtrees) or both. Layout is either a
// simple stack or a CSS grid with N columns.
//
// Group-level dynamic props (hidden, title, description, className) come from
// `propsDependsOn` rules declared on the group's `dependents`, applied by the
// dependency engine into the store's group runtime overrides. When the group is
// hidden, the subtree is CSS-hidden (not unmounted) so descendant field state
// is preserved across hide/show.

import { useMemo } from 'react';
import { useGroup } from '../hooks/useGroup';
import type { Group } from '../types/group';
import { Field } from './Field';

export interface GroupRendererProps {
	// Group is generic in TFormData (the form-wide values shape), but the
	// renderer doesn't read field values from the shape — it just iterates.
	// Accepting `Group<any>` avoids invariance friction with generic callers.
	// biome-ignore lint/suspicious/noExplicitAny: see comment above.
	group: Group<any>;
	depth?: number;
}

export function GroupRenderer({ group, depth = 0 }: GroupRendererProps) {
	const overrides = useGroup(group.id);
	const effective = useMemo(() => {
		if (Object.keys(overrides).length === 0) return group;
		return { ...group, ...overrides };
	}, [group, overrides]);

	// The layout (grid / stack) applies to the group's CONTENT — the questions
	// and nested groups — NOT to the header. If the grid class were on the
	// <section> itself, the title would become the first grid cell and push
	// every field out of alignment. So the section stays a flex column and the
	// content lives in an inner wrapper that carries the layout class.
	const layoutClass =
		effective.layout === 'grid'
			? `easy-forms-grid easy-forms-grid-${effective.gridCols ?? 2}`
			: 'easy-forms-stack';
	const sectionClassName = ['easy-forms-group', effective.className].filter(Boolean).join(' ');

	const hidden = overrides.hidden === true;
	const style = hidden ? { display: 'none' as const } : undefined;

	return (
		<section
			className={sectionClassName}
			data-depth={depth}
			style={style}
			aria-hidden={hidden || undefined}
		>
			{effective.title ? (
				<header className="easy-forms-group__header">
					<h3 className="easy-forms-group__title">{effective.title}</h3>
					{effective.description ? (
						<p className="easy-forms-group__description">{effective.description}</p>
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
