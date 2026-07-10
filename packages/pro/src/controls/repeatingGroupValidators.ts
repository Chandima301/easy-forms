import type { Validators } from '@easy-forms/core';

export interface RepeatingGroupBounds {
	minItems?: number;
	maxItems?: number;
}

/**
 * Translate a repeating group's `minItems` / `maxItems` into validators on the
 * container field. The container's value is the active-index array, so the
 * count is its length — reusing core's array `minLength` / `maxLength` built-ins
 * with item-aware messages.
 */
const items = (n: number): string => `${n} item${n === 1 ? '' : 's'}`;

export function repeatingGroupValidators(
	bounds: RepeatingGroupBounds
): Validators<unknown[], Record<string, unknown>> {
	const validators: Validators<unknown[], Record<string, unknown>> = {};
	if (bounds.minItems !== undefined) {
		validators.minLength = {
			value: bounds.minItems,
			message: `Add at least ${items(bounds.minItems)}`,
		};
	}
	if (bounds.maxItems !== undefined) {
		validators.maxLength = {
			value: bounds.maxItems,
			message: `Add at most ${items(bounds.maxItems)}`,
		};
	}
	return validators;
}
