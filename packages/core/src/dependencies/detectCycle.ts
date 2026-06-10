// Cycle detection for the dependency graph.
//
// Two targets with reciprocal mutating deps (A reads B, B reads A) can
// oscillate indefinitely. We detect that at graph-build time via DFS
// colouring, and throw with a path so the developer can fix the schema.
//
// Targets are either fields (keyed by field name) or groups (keyed by group
// id). To avoid name collisions when a field and a group happen to share a
// string, the cycle detector uses composite node keys: `field:foo`, `group:bar`.
//
// Dev-only: this check is bypassed in production builds for cold-start perf.

import type { DependencyEdge, DependencyGraph } from './buildGraph';
import type { DependencyTarget } from './types';

const WHITE = 0;
const GRAY = 1;
const BLACK = 2;

function nodeId(target: DependencyTarget): string {
	return target.kind === 'field' ? `field:${target.key}` : `group:${target.id}`;
}

/** Strips the composite prefix from a node id for human-readable error paths. */
function displayName(id: string): string {
	return id.replace(/^(field|group):/, (_, kind) => (kind === 'group' ? '[group] ' : ''));
}

function buildAdjacency(graph: DependencyGraph): Map<string, Set<string>> {
	const adj = new Map<string, Set<string>>();
	// Source field key → target node ids.
	for (const [source, edges] of graph.sourceGraph) {
		const sourceNode = `field:${source}`;
		let targets = adj.get(sourceNode);
		if (!targets) {
			targets = new Set<string>();
			adj.set(sourceNode, targets);
		}
		for (const edge of edges as DependencyEdge[]) {
			targets.add(nodeId(edge.target));
		}
	}
	return adj;
}

export function detectDependencyCycle(graph: DependencyGraph): string[] | null {
	const adj = buildAdjacency(graph);
	const color = new Map<string, number>();

	function dfs(node: string, path: string[]): string[] | null {
		color.set(node, GRAY);
		const nextPath = [...path, node];
		for (const next of adj.get(node) ?? []) {
			const c = color.get(next) ?? WHITE;
			if (c === GRAY) {
				const startIdx = nextPath.indexOf(next);
				return (startIdx >= 0 ? [...nextPath.slice(startIdx), next] : [...nextPath, next]).map(
					displayName
				);
			}
			if (c === WHITE) {
				const result = dfs(next, nextPath);
				if (result) return result;
			}
		}
		color.set(node, BLACK);
		return null;
	}

	for (const node of adj.keys()) {
		if ((color.get(node) ?? WHITE) === WHITE) {
			const cycle = dfs(node, []);
			if (cycle) return cycle;
		}
	}
	return null;
}

export function assertNoDependencyCycle(graph: DependencyGraph): void {
	const cycle = detectDependencyCycle(graph);
	if (cycle) {
		throw new Error(
			`easy-forms: dependency cycle detected — ${cycle.join(' → ')}. ` +
				'Two or more targets reference each other; the schema would oscillate. ' +
				'Break the cycle by removing one of the dependents.'
		);
	}
}
