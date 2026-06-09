// Built-in validators. Each takes the rule value + the field value + the form
// values, and returns a string error or null.
//
// Rules accept either a raw value (`required: true`, `minLength: 3`) or a
// `{ value, message }` object for a custom error message.

import type { ValidatorRule } from '../types/validators';

interface BuiltInValidator {
	(rule: unknown, value: unknown, allValues: Record<string, unknown>): string | null;
}

function unwrap<T>(rule: ValidatorRule<T>): { value: T; message: string | undefined } {
	if (rule !== null && typeof rule === 'object' && 'value' in rule) {
		const r = rule as { value: T; message?: string };
		return { value: r.value, message: r.message };
	}
	return { value: rule as T, message: undefined };
}

function isEmpty(value: unknown): boolean {
	if (value === null || value === undefined) return true;
	if (typeof value === 'string') return value.length === 0;
	if (Array.isArray(value)) return value.length === 0;
	return false;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const required: BuiltInValidator = (rule, value) => {
	const { value: required, message } = unwrap(rule as ValidatorRule<boolean>);
	if (!required) return null;
	if (isEmpty(value) || value === false) return message ?? 'This field is required';
	return null;
};

export const minLength: BuiltInValidator = (rule, value) => {
	const { value: min, message } = unwrap(rule as ValidatorRule<number>);
	if (value === null || value === undefined) return null;
	const length = typeof value === 'string' || Array.isArray(value) ? value.length : null;
	if (length === null) return null;
	return length < min ? (message ?? `Must be at least ${min} characters`) : null;
};

export const maxLength: BuiltInValidator = (rule, value) => {
	const { value: max, message } = unwrap(rule as ValidatorRule<number>);
	if (value === null || value === undefined) return null;
	const length = typeof value === 'string' || Array.isArray(value) ? value.length : null;
	if (length === null) return null;
	return length > max ? (message ?? `Must be at most ${max} characters`) : null;
};

export const min: BuiltInValidator = (rule, value) => {
	const { value: minimum, message } = unwrap(rule as ValidatorRule<number>);
	if (typeof value !== 'number') return null;
	return value < minimum ? (message ?? `Must be at least ${minimum}`) : null;
};

export const max: BuiltInValidator = (rule, value) => {
	const { value: maximum, message } = unwrap(rule as ValidatorRule<number>);
	if (typeof value !== 'number') return null;
	return value > maximum ? (message ?? `Must be at most ${maximum}`) : null;
};

export const pattern: BuiltInValidator = (rule, value) => {
	const { value: regex, message } = unwrap(rule as ValidatorRule<RegExp>);
	if (typeof value !== 'string' || value.length === 0) return null;
	return regex.test(value) ? null : (message ?? 'Invalid format');
};

export const email: BuiltInValidator = (rule, value) => {
	const { value: enabled, message } = unwrap(rule as ValidatorRule<boolean>);
	if (!enabled) return null;
	if (typeof value !== 'string' || value.length === 0) return null;
	return EMAIL_PATTERN.test(value) ? null : (message ?? 'Invalid email address');
};

/**
 * Built-in validator order. `custom` is handled separately by `runValidators`
 * so async customs can be queued only after sync built-ins pass.
 */
export const BUILT_IN_VALIDATORS: ReadonlyArray<readonly [string, BuiltInValidator]> = [
	['required', required],
	['minLength', minLength],
	['maxLength', maxLength],
	['min', min],
	['max', max],
	['pattern', pattern],
	['email', email],
];
