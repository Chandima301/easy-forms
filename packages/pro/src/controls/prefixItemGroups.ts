import type { Dependency, Group, Question } from '@easy-forms/core';

// Strip the row prefix from a picked-values map so a within-row dependent's
// `compute` / `when` sees item-relative keys (`bankAccounts.0.country` → `country`).
function stripPrefix(values: Record<string, unknown>, prefix: string): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const key of Object.keys(values)) {
		out[key.startsWith(prefix) ? key.slice(prefix.length) : key] = values[key];
	}
	return out;
}

// The three built-in dep kinds share this loose rule shape (the originals are
// cast to it; their computes accept a superset of `Record<string, unknown>`).
type LooseRule = {
	fieldNames: string[];
	compute?: (v: Record<string, unknown>) => unknown;
	when?: (v: Record<string, unknown>) => unknown;
};

// Rewrite a dependent so it works against prefixed store keys: source `fieldNames`
// are prefixed (so the per-row engine subscribes to this row's fields), while the
// author's `compute` / `when` still receives item-relative keys.
function prefixDependents(dependents: Dependency, prefix: string): Dependency {
	const src = dependents as unknown as Record<string, unknown>;
	const out: Record<string, unknown> = {};

	const props = src.propsDependsOn as LooseRule[] | undefined;
	if (props) {
		out.propsDependsOn = props.map((rule) => ({
			fieldNames: rule.fieldNames.map((name) => `${prefix}${name}`),
			compute: (values: Record<string, unknown>) => rule.compute?.(stripPrefix(values, prefix)),
		}));
	}

	const value = src.valueDependsOn as LooseRule | undefined;
	if (value) {
		out.valueDependsOn = {
			fieldNames: value.fieldNames.map((name) => `${prefix}${name}`),
			compute: (values: Record<string, unknown>) => value.compute?.(stripPrefix(values, prefix)),
		};
	}

	const reset = src.resetDependsOn as LooseRule | undefined;
	if (reset) {
		out.resetDependsOn = {
			fieldNames: reset.fieldNames.map((name) => `${prefix}${name}`),
			when: (values: Record<string, unknown>) => reset.when?.(stripPrefix(values, prefix)),
		};
	}

	// Pass through any unrecognised (custom) dep kinds untouched — best effort.
	for (const key of Object.keys(src)) {
		if (key !== 'propsDependsOn' && key !== 'valueDependsOn' && key !== 'resetDependsOn') {
			out[key] = src[key];
		}
	}
	return out as unknown as Dependency;
}

function prefixQuestion(
	question: Question,
	prefix: string,
	defaultItem?: Record<string, unknown>
): Question {
	const q = question as Question & { dependents?: Dependency; defaultValue?: unknown };
	return {
		...q,
		key: `${prefix}${q.key}`,
		defaultValue: defaultItem && q.key in defaultItem ? defaultItem[q.key] : q.defaultValue,
		...(q.dependents ? { dependents: prefixDependents(q.dependents, prefix) } : {}),
	} as Question;
}

function prefixGroup(group: Group, prefix: string, defaultItem?: Record<string, unknown>): Group {
	return {
		...group,
		id: group.id ? `${prefix}${group.id}` : group.id,
		...(group.dependents ? { dependents: prefixDependents(group.dependents, prefix) } : {}),
		questions: group.questions?.map((question) => prefixQuestion(question, prefix, defaultItem)),
		groups: group.groups?.map((child) => prefixGroup(child, prefix, defaultItem)),
	};
}

/**
 * Deep-clone a repeating item's `groups` for one row, prefixing every descendant
 * question `key` and nested group `id` with `prefix` (`${groupKey}.${index}.`),
 * seeding `defaultItem` values, and rewriting `dependents` so within-row
 * `propsDependsOn` / `valueDependsOn` / `resetDependsOn` fire against this row's
 * fields while the author's `compute` / `when` still reads item-relative keys.
 */
export function prefixItemGroups(
	groups: Group[],
	prefix: string,
	defaultItem?: Record<string, unknown>
): Group[] {
	return groups.map((group) => prefixGroup(group, prefix, defaultItem));
}
