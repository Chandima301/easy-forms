// Group — recursive container. Improvement over older form abstractions
// that cap at one or two nesting levels.

import type { Question } from './controls';
import type { Dependency } from './dependencies';

export interface Group<TFormData extends Record<string, unknown> = Record<string, unknown>> {
	/**
	 * Stable identifier. Effectively REQUIRED when `dependents` is set — the
	 * engine uses it as the group's address in the dependency graph and as the
	 * topic key for `subscribeGroup`. The type stays optional so schemas
	 * without group-level deps don't need to declare ids; a runtime check in
	 * dev mode throws if a group with `dependents` is missing one.
	 */
	id?: string;
	title?: string;
	description?: string;
	className?: string;
	layout?: 'stack' | 'grid';
	gridCols?: 1 | 2 | 3 | 4 | 6 | 12;
	dependents?: Dependency<TFormData>;
	/**
	 * Reset every descendant field when the group's effective `hidden` flips
	 * false → true. Mirrors the field-level option.
	 */
	clearWhenHidden?: boolean;
	/** Exactly one of `questions` / `groups` is expected; both allowed for ergonomics. */
	questions?: Question<TFormData>[];
	groups?: Group<TFormData>[];
}
