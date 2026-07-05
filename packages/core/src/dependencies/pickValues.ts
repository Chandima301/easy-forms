// Shared value-picking for dependency handlers. Builds the `picked` record a
// rule's `compute` / `when` receives: a plain field reads its flat scalar; a
// container source (a `repeatingGroup`) reads its *nested* value — an array of
// row objects — from `getNestedValues()`, defaulting to `[]` for an empty group.

import type { DependencyContext } from './types';

export function pickValues(
	ctx: DependencyContext,
	fieldNames: readonly string[]
): Record<string, unknown> {
	const flat = ctx.getValues();
	let nested: Record<string, unknown> | undefined;
	const picked: Record<string, unknown> = {};
	for (const name of fieldNames) {
		if (ctx.containerKeys.has(name)) {
			nested ??= ctx.getNestedValues();
			picked[name] = nested[name] ?? [];
		} else {
			picked[name] = flat[name];
		}
	}
	return picked;
}
