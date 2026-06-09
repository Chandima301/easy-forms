// `propsDependsOn` — the single dependency that mutates dynamic question/group props.
//
// Config: an ARRAY of rules. Each rule has its own `fieldNames` and `compute`.
// The engine spreads each rule's source field names into the source graph, so a
// rule subscribes only to its declared sources.
//
// Each rule's compute returns a `Partial<RuntimeProps>`; the store merges it
// into the target's `runtimeOverrides`. Order matters: later rules overwrite
// earlier ones for the same prop.

import type { PropsDependencyRule, RuntimeProps } from '../../types/dependencies';
import type { DependencyHandler } from '../types';

type PropsConfig = PropsDependencyRule<Record<string, unknown>>[];

export const propsDependsOnHandler: DependencyHandler<PropsConfig> = {
	getDependencies(config) {
		// Union of every rule's `fieldNames`. The graph builder then subscribes
		// the engine to each source key once; the engine runs the WHOLE config
		// on any source change (cheap because each rule short-circuits on
		// shallow-equal `picked`).
		const all: string[] = [];
		for (const rule of config) {
			for (const name of rule.fieldNames) all.push(name);
		}
		return all;
	},
	apply(config, ctx) {
		const values = ctx.getValues();
		// Accumulate overrides across all rules so we hit the store once.
		const merged: Partial<RuntimeProps> = {};
		for (const rule of config) {
			const picked: Record<string, unknown> = {};
			for (const name of rule.fieldNames) picked[name] = values[name];
			const result = rule.compute(picked);
			if (!result) continue;
			Object.assign(merged, result);
		}
		if (ctx.target.kind === 'field') {
			ctx.store.setRuntimeProps(ctx.target.key, merged);
		} else {
			ctx.store.setGroupRuntimeProps(ctx.target.id, merged);
		}
	},
};
