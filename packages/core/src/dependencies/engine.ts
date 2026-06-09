// The runtime engine: attaches a built dependency graph to a store.
//
// Lifecycle:
//   1. Build graph from schema + handler registry.
//   2. (Dev) assert no cycles.
//   3. Register every group with the store; populate groupFieldKeys.
//   4. Apply every edge once (initial state — visibility/required/etc. need
//      to evaluate *before* the user touches anything).
//   5. Subscribe to each source field; on change, re-run the dependent edges.
//   6. After every edge run, check for `clearWhenHidden` rising-edge transitions
//      and reset the corresponding targets.
//   7. Return a teardown that unsubscribes everything.

import type { FormStore } from '../store/types';
import type { FormSchema } from '../types/schema';
import { buildDependencyGraph, type DependencyEdge, type DependencyGraph } from './buildGraph';
import { assertNoDependencyCycle } from './detectCycle';
import type { DependencyContext, DependencyHandlerRegistry, DependencyTarget } from './types';

declare const process: { env: { NODE_ENV?: string } } | undefined;
function isDev(): boolean {
	try {
		return typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';
	} catch {
		return true;
	}
}

function targetKey(target: DependencyTarget): string {
	return target.kind === 'field' ? `field:${target.key}` : `group:${target.id}`;
}

function effectiveHidden(store: FormStore, target: DependencyTarget): boolean {
	if (target.kind === 'field') {
		const state = store.getFieldState(target.key);
		return state.runtimeOverrides.hidden === true || state.hiddenByAncestor;
	}
	return store.getGroupRuntimeProps(target.id).hidden === true;
}

function clearWhenHiddenEnabled(target: DependencyTarget): boolean {
	if (target.kind === 'field') {
		return (target.question as { clearWhenHidden?: boolean }).clearWhenHidden === true;
	}
	return target.group.clearWhenHidden === true;
}

function resetTarget(store: FormStore, target: DependencyTarget, graph: DependencyGraph): void {
	if (target.kind === 'field') {
		store.resetField(target.key);
		return;
	}
	const descendants = graph.groupFieldKeysIndex.get(target.id) ?? [];
	for (const key of descendants) store.resetField(key);
}

function runEdge(
	edge: DependencyEdge,
	store: FormStore,
	handlers: DependencyHandlerRegistry,
	graph: DependencyGraph,
	hiddenCache: Map<string, boolean>
): void {
	const handler = handlers[edge.depKind];
	if (!handler) return;
	const ctx: DependencyContext = {
		store,
		getValues: () => store.getValues(),
		target: edge.target,
	};
	const beforeHidden = effectiveHidden(store, edge.target);
	let result: void | Promise<void>;
	try {
		result = handler.apply(edge.config as never, ctx);
	} catch (err) {
		if (isDev()) {
			// eslint-disable-next-line no-console
			console.error(
				`[easy-forms] handler "${edge.depKind}" threw while applying to "${targetKey(edge.target)}":`,
				err
			);
		} else {
			throw err;
		}
		return;
	}
	const checkHiddenEdge = () => {
		const now = effectiveHidden(store, edge.target);
		const key = targetKey(edge.target);
		const previous = hiddenCache.get(key);
		// Track the rising edge: false → true.
		if (previous !== undefined && !previous && now && clearWhenHiddenEnabled(edge.target)) {
			resetTarget(store, edge.target, graph);
		}
		hiddenCache.set(key, now);
		// Also catch the case where this is the very first observation AND
		// the handler just turned the target hidden (initial mount).
		if (previous === undefined) {
			if (!beforeHidden && now && clearWhenHiddenEnabled(edge.target)) {
				resetTarget(store, edge.target, graph);
			}
		}
	};
	if (result instanceof Promise) {
		void result.then(checkHiddenEdge).catch((err) => {
			if (isDev()) {
				// eslint-disable-next-line no-console
				console.error(
					`[easy-forms] async handler "${edge.depKind}" rejected for "${targetKey(edge.target)}":`,
					err
				);
			}
		});
	} else {
		checkHiddenEdge();
	}
}

export interface AttachedEngine {
	graph: DependencyGraph;
	detach: () => void;
}

export function attachDependencyEngine(
	store: FormStore,
	// biome-ignore lint/suspicious/noExplicitAny: schema generic erased at runtime.
	schema: FormSchema<any>,
	handlers: DependencyHandlerRegistry
): AttachedEngine {
	const graph = buildDependencyGraph(schema, handlers);

	if (isDev()) {
		assertNoDependencyCycle(graph);
	}

	// Per-target rising-edge cache for clearWhenHidden.
	const hiddenCache = new Map<string, boolean>();

	// Register every group with the store and hand it the descendant key list.
	const groupCleanups: Array<() => void> = [];
	// biome-ignore lint/suspicious/noExplicitAny: descriptor lookup helper.
	const groupById = new Map<string, any>();
	for (const groupId of graph.groupIds) {
		// Find the group object via the edges (any edge targeting this group
		// carries the reference). If the group has no edges, walk schema once.
		const edge = graph.edges.find(
			(e) => e.target.kind === 'group' && e.target.id === groupId
		);
		const group = edge?.target.kind === 'group' ? edge.target.group : undefined;
		groupById.set(groupId, group);
		const cleanup = store.registerGroup({
			id: groupId,
			clearWhenHidden: group?.clearWhenHidden,
		});
		groupCleanups.push(cleanup);
		store.setGroupFieldKeys(groupId, graph.groupFieldKeysIndex.get(groupId) ?? []);
	}

	// Initial application — run every edge once so visibility/value derivations
	// settle before the first render reads field state.
	for (const edge of graph.edges) {
		runEdge(edge, store, handlers, graph, hiddenCache);
	}

	// Subscribe each source field key. When a source field changes, run all
	// edges that depend on it.
	const unsubs: Array<() => void> = [];
	for (const [source, edges] of graph.sourceGraph) {
		const unsub = store.subscribeField(source, () => {
			for (const edge of edges) {
				runEdge(edge, store, handlers, graph, hiddenCache);
			}
		});
		unsubs.push(unsub);
	}

	return {
		graph,
		detach() {
			for (const u of unsubs) u();
			for (const c of groupCleanups) c();
		},
	};
}
