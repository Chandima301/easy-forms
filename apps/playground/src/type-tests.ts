// Negative-type tests (Phase 1 verification gate).
//
// These declarations should NOT compile. The `@ts-expect-error` lines are the
// proof that the type system enforces the rules we promised in the plan:
//   - validators conditional on TValue (no minLength on a boolean checkbox)
//   - control discriminator narrows per-control props
//   - dependency aggregator receives only the picked fields
//
// Running `pnpm typecheck` in the playground verifies these still error.

import type { CheckboxQuestion, NumberQuestion, TextQuestion } from '@easy-forms/core';

interface Form extends Record<string, unknown> {
	name: string;
	agreed: boolean;
	count: number;
}

// (a) minLength is allowed on a string control...
const _ok1: TextQuestion<Form> = {
	key: 'name',
	label: 'Name',
	control: 'text',
	validators: { minLength: 2 },
};

// ...but NOT on a boolean control.
const _bad1: CheckboxQuestion<Form> = {
	key: 'agreed',
	label: 'Agreed',
	control: 'checkbox',
	// @ts-expect-error minLength is not valid for a checkbox (TValue = boolean)
	validators: { minLength: 2 },
};

// (b) min/max allowed on number; not on string.
const _ok2: NumberQuestion<Form> = {
	key: 'count',
	label: 'Count',
	control: 'number',
	validators: { min: 0, max: 100 },
};

const _bad2: TextQuestion<Form> = {
	key: 'name',
	label: 'Name',
	control: 'text',
	// @ts-expect-error min is not valid for a text input (TValue = string)
	validators: { min: 0 },
};

// (c) Wrong control discriminator → wrong shape rejected.
const _bad3: TextQuestion<Form> = {
	key: 'name',
	label: 'Name',
	// @ts-expect-error control must be 'text' for TextQuestion
	control: 'number',
};

export {};
