import type { ValueDependency } from '../../types/dependencies';
import type { DependencyContext, DependencyHandler } from '../types';

/**
 * `valueDependsOn` — derives the target field's value from a subset of source
 * field values. Recomputation is deferred via `queueMicrotask` so the write
 * doesn't happen inside the source field's setValue stack — avoids surprising
 * setState-during-render and lets all listeners settle first.
 *
 * Group targets don't carry a value, so this handler is field-only — a group
 * target would be a schema author error (cycle detection would catch a sensible
 * one; otherwise this is a silent no-op).
 *
 * `markDirty: false` keeps the form's overall isDirty status accurate (derived
 * writes don't count as user edits).
 */
export const valueDependsOnHandler: DependencyHandler<
	ValueDependency<Record<string, unknown>>
> = {
	getDependencies(config) {
		return [...config.fieldNames];
	},
	apply(config, ctx: DependencyContext) {
		if (ctx.target.kind !== 'field') return;
		const targetKey = ctx.target.key;
		const values = ctx.getValues();
		const picked: Record<string, unknown> = {};
		for (const name of config.fieldNames) {
			picked[name] = values[name];
		}
		const next = config.compute(picked);
		const current = ctx.store.getFieldState(targetKey).value;
		if (Object.is(current, next)) return;
		queueMicrotask(() => {
			const fresh = ctx.store.getFieldState(targetKey).value;
			if (Object.is(fresh, next)) return;
			ctx.store.setValue(targetKey, next, {
				validate: true,
				touch: false,
				markDirty: false,
			});
		});
	},
};
