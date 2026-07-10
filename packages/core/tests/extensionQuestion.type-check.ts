// Type-level fixture (checked by `tsc`, not run by vitest): augmenting
// `ControlTypeExtensions` must make a custom control a first-class `Question`
// — placeable in a schema and narrowable by its `control` discriminant with
// its own value type + config props. This is the seam `@easy-forms/pro`'s
// `repeatingGroup` control relies on.

import type { Question } from '../src/types/controls';

declare module '../src/types/controls' {
	interface ControlTypeExtensions {
		stars: { value: number; max: number };
	}
}

// Augmented control is assignable to Question (so it typechecks inside a schema).
export const starsQuestion: Question = {
	key: 'rating',
	label: 'Rating',
	control: 'stars',
	max: 5,
	defaultValue: 3,
};

// Narrowing by the control discriminant exposes the extension's config (`max`)
// and resolves the value type (`defaultValue: number`).
type StarsQuestion = Extract<Question, { control: 'stars' }>;

export function readStars(q: StarsQuestion): number {
	const max: number = q.max;
	const value: number = q.defaultValue ?? 0;
	return max + value;
}
