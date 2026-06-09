// `resetDependsOn` — resets the target's value(s) when `when()` flips
// from false to true. The handler tracks the previous predicate result per
// target so it only resets on the rising edge; a stable-true never re-fires.
//
// For a field target, calls `store.resetField(key)`.
// For a group target, the engine itself doesn't directly support cascading a
// group reset via this handler — group reset is currently a manual operation.
// Group authors who want a group-wide reset should compose individual field
// `resetDependsOn` rules. (We can lift this if the use case becomes common.)

import type { ResetDependency } from '../../types/dependencies';
import type { DependencyHandler } from '../types';

const previousWhen = new WeakMap<object, boolean>();

export const resetDependsOnHandler: DependencyHandler<
	ResetDependency<Record<string, unknown>>
> = {
	getDependencies(config) {
		return [...config.fieldNames];
	},
	apply(config, ctx) {
		const values = ctx.getValues();
		const picked: Record<string, unknown> = {};
		for (const name of config.fieldNames) picked[name] = values[name];
		const now = !!config.when(picked);
		const prev = previousWhen.get(config as unknown as object);
		previousWhen.set(config as unknown as object, now);
		// Rising edge only.
		if (prev === false && now === true) {
			if (ctx.target.kind === 'field') {
				ctx.store.resetField(ctx.target.key);
			}
		}
	},
};
