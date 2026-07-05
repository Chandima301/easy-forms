// Pure routing resolution for the branching wizard. No React, no store — just the
// graph-walk semantics, so it can be unit-tested in isolation and reused by the hook.

import type { AdvancedWizardConfig, AdvancedWizardStep } from './types';

function pick(fieldNames: string[], values: Record<string, unknown>): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const name of fieldNames) out[name] = values[name];
	return out;
}

/**
 * Resolves the successor step id for `step` given the current `values`, or `null`
 * when the step is terminal (no route matches / last in order / `terminal` flag).
 *
 *   - `terminal: true`     → null
 *   - `next` omitted       → the next step in `config.steps` order (null if last)
 *   - `next` string        → that step id verbatim
 *   - `next` Route[]       → first route whose `when(pick)` is true → `to`; else null
 */
export function resolveNext(
	config: AdvancedWizardConfig,
	step: AdvancedWizardStep,
	values: Record<string, unknown>
): string | null {
	if (step.terminal) return null;

	const { next } = step;
	if (next === undefined) {
		const idx = config.steps.findIndex((s) => s.id === step.id);
		const following = config.steps[idx + 1];
		return following ? following.id : null;
	}
	if (typeof next === 'string') return next;

	for (const route of next) {
		if (route.when(pick(route.fieldNames, values))) return route.to;
	}
	return null;
}

/**
 * The ordered path the UI should treat as "reachable": the actually-visited
 * `backStack` (start → current) followed by the greedily-resolved forward path
 * from the current step on the current answers. A repeat guard stops the walk if a
 * cyclic route revisits a step already on the path.
 */
export function projectPath(
	config: AdvancedWizardConfig,
	backStack: string[],
	values: Record<string, unknown>
): string[] {
	const byId = new Map(config.steps.map((s) => [s.id, s]));
	const path = [...backStack];
	const seen = new Set(path);

	let currentId = path[path.length - 1] ?? config.start ?? config.steps[0]?.id;
	while (currentId) {
		const current = byId.get(currentId);
		if (!current) break;
		const nextId = resolveNext(config, current, values);
		if (nextId === null || seen.has(nextId)) break;
		path.push(nextId);
		seen.add(nextId);
		currentId = nextId;
	}
	return path;
}
