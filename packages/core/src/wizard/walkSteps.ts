// Helpers for walking wizard steps to collect their field keys (used by
// per-step validation gating) and to derive step visibility.

import type { PropsDependencyRule } from '../types/dependencies';
import type { Group } from '../types/group';
import type { WizardStep } from '../types/schema';

function walkGroup(group: Group, keys: string[]): void {
	for (const q of group.questions ?? []) keys.push(q.key);
	for (const child of group.groups ?? []) walkGroup(child, keys);
}

/** All field keys reachable inside a single step's groups (recursive). */
export function collectStepFieldKeys(step: WizardStep): string[] {
	const keys: string[] = [];
	for (const group of step.groups) walkGroup(group, keys);
	return keys;
}

/**
 * Evaluates a step's `propsDependsOn` rules to derive `hidden`. A step is
 * visible unless one of its rules returns `{ hidden: true }`. Other runtime
 * props in the rule output are ignored at the step level (steps have only
 * navigation-level state, not the broader Question prop surface).
 */
export function isStepVisible(step: WizardStep, values: Record<string, unknown>): boolean {
	const rules = step.dependents?.propsDependsOn as
		| PropsDependencyRule<Record<string, unknown>>[]
		| undefined;
	if (!rules || rules.length === 0) return true;
	let hidden: boolean | undefined;
	for (const rule of rules) {
		const picked: Record<string, unknown> = {};
		for (const name of rule.fieldNames) picked[name] = values[name];
		const result = rule.compute(picked);
		if (result && typeof result.hidden === 'boolean') hidden = result.hidden;
	}
	return hidden !== true;
}
