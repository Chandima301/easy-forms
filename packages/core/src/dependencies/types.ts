// Dependency engine types.
//
// A `DependencyHandler` knows two things about its dependency kind:
//   1. Which source field keys this dep config reads (`getDependencies`) —
//      used to build the source → targets graph.
//   2. What to do when any source changes (`apply`) — typically mutate the
//      target's state via the store.
//
// Handlers are stored in a `DependencyHandlerRegistry` keyed by dep kind.
// The three built-ins (`propsDependsOn`, `valueDependsOn`, `resetDependsOn`)
// ship with the package; consumers register more on <Form>.

import type { FormStore } from '../store/types';
import type { Question } from '../types/controls';
import type { Group } from '../types/group';

/**
 * A dependency may target either a field (by key) or a group (by id). The
 * discriminated union lets handlers branch on what they're writing to without
 * losing type information.
 */
export type DependencyTarget =
	| { kind: 'field'; key: string; question: Question }
	| {
			kind: 'group';
			id: string;
			// biome-ignore lint/suspicious/noExplicitAny: Group is generic in TFormData; engine doesn't read the typed shape.
			group: Group<any>;
		};

export interface DependencyContext {
	store: FormStore;
	getValues: () => Record<string, unknown>;
	target: DependencyTarget;
}

export interface DependencyHandler<TConfig = unknown> {
	/** Field keys this dep config reads. Used to build the dependency graph. */
	getDependencies(config: TConfig): string[];
	/** Effect applied when any dependency changes — or on initial form mount. */
	apply(config: TConfig, ctx: DependencyContext): void | Promise<void>;
}

export type DependencyHandlerRegistry = Record<string, DependencyHandler<never>>;
