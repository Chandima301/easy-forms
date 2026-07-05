// Walks a FormSchema and produces:
//   - `edges`: a flat list of every (target × depKind × config) tuple
//   - `sourceGraph`: a Map from source field key → list of edges that
//     read it. Used by the engine to wake the right handlers on a value change.
//   - `groupFieldKeysIndex`: a Map from group id → its descendant field keys
//     (used by the store to cascade group-level hidden to fields).
//
// Groups participate uniformly with questions. A group's edges target the
// group's id; the engine dispatches by `target.kind` to the right store mutator.

import type { Question } from '../types/controls';
import type { Group } from '../types/group';
import type { FormSchema } from '../types/schema';
import { isContainerControl } from './containerControls';
import type { DependencyHandlerRegistry, DependencyTarget } from './types';

export interface DependencyEdge {
	depKind: string;
	config: unknown;
	target: DependencyTarget;
}

export interface DependencyGraph {
	edges: DependencyEdge[];
	/** key → edges that read `key` as a source. */
	sourceGraph: Map<string, DependencyEdge[]>;
	/** group id → descendant field keys (for hidden cascade). */
	groupFieldKeysIndex: Map<string, string[]>;
	/** All group ids encountered. Used by the engine to register groups + verify ids. */
	groupIds: string[];
	/**
	 * Keys of questions whose `control` is a registered container type. The
	 * engine subtree-subscribes these sources and handlers read their *nested*
	 * value. See `containerControls.ts`.
	 */
	containerKeys: Set<string>;
}

// biome-ignore lint/suspicious/noExplicitAny: group iteration ignores TFormData.
function collectGroupFieldKeys(group: Group<any>, out: string[]): void {
	for (const q of group.questions ?? []) out.push(q.key);
	for (const child of group.groups ?? []) collectGroupFieldKeys(child, out);
}

function walkGroup(
	// biome-ignore lint/suspicious/noExplicitAny: see above.
	group: Group<any>,
	edges: DependencyEdge[],
	groupFieldKeysIndex: Map<string, string[]>,
	groupIds: string[],
	containerKeys: Set<string>,
	path: string
): void {
	// Group-level deps.
	if (group.dependents) {
		if (!group.id) {
			throw new Error(
				`easy-forms: group at "${path}" declares \`dependents\` but is missing \`id\`. ` +
					'Add a stable `id` so the dependency engine can address it.'
			);
		}
		const target: DependencyTarget = { kind: 'group', id: group.id, group };
		for (const [depKind, config] of Object.entries(group.dependents)) {
			if (config == null) continue;
			edges.push({ depKind, config, target });
		}
	}
	// Index descendant field keys for every group that has an id (groups without
	// deps may still be referenced by group-aware tooling later).
	if (group.id) {
		groupIds.push(group.id);
		const descendants: string[] = [];
		collectGroupFieldKeys(group, descendants);
		groupFieldKeysIndex.set(group.id, descendants);
	}
	// Record container questions (scanned for every question, independent of deps).
	for (const question of group.questions ?? []) {
		if (isContainerControl(question.control)) containerKeys.add(question.key);
	}
	// Field-level deps.
	for (const question of group.questions ?? []) {
		const deps = question.dependents;
		if (!deps) continue;
		const target: DependencyTarget = {
			kind: 'field',
			key: question.key,
			question: question as Question,
		};
		for (const [depKind, config] of Object.entries(deps)) {
			if (config == null) continue;
			edges.push({ depKind, config, target });
		}
	}
	// Recurse.
	(group.groups ?? []).forEach((child, idx) => {
		walkGroup(
			child,
			edges,
			groupFieldKeysIndex,
			groupIds,
			containerKeys,
			`${path}/${child.id ?? `[${idx}]`}`
		);
	});
}

export function buildDependencyGraph(
	// biome-ignore lint/suspicious/noExplicitAny: schema generic erased at runtime.
	schema: FormSchema<any>,
	handlers: DependencyHandlerRegistry
): DependencyGraph {
	const edges: DependencyEdge[] = [];
	const groupFieldKeysIndex = new Map<string, string[]>();
	const groupIds: string[] = [];
	const containerKeys = new Set<string>();

	schema.groups.forEach((group, idx) => {
		walkGroup(
			group,
			edges,
			groupFieldKeysIndex,
			groupIds,
			containerKeys,
			group.id ?? `root[${idx}]`
		);
	});
	if (schema.wizard) {
		schema.wizard.steps.forEach((step) => {
			step.groups.forEach((group, idx) => {
				walkGroup(
					group,
					edges,
					groupFieldKeysIndex,
					groupIds,
					containerKeys,
					`step:${step.id}/${group.id ?? `[${idx}]`}`
				);
			});
		});
	}

	const sourceGraph = new Map<string, DependencyEdge[]>();
	for (const edge of edges) {
		const handler = handlers[edge.depKind];
		if (!handler) continue;
		const sources = handler.getDependencies(edge.config as never);
		for (const source of sources) {
			let entries = sourceGraph.get(source);
			if (!entries) {
				entries = [];
				sourceGraph.set(source, entries);
			}
			entries.push(edge);
		}
	}

	return { edges, sourceGraph, groupFieldKeysIndex, groupIds, containerKeys };
}
