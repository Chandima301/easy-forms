// Validators — typed built-ins + module-augmentable extension point.
//
// The shape of BuiltInValidators is *conditional on TValue*: validators that
// only make sense for strings (minLength, pattern, email) are only present
// in the type when TValue is a string; validators that only make sense for
// numbers (min, max) are only present when TValue is a number; etc.
//
// This means: putting `validators: { minLength: 3 }` on a CheckboxQuestion
// (TValue = boolean) is a TS error — exactly the Phase 1 verification gate.

export type ValidationResult = string | null;

export type CustomValidator<TValue, TFormData> = (
	value: TValue,
	allValues: TFormData
) => ValidationResult | Promise<ValidationResult>;

export type ValidatorRule<T> = T | { value: T; message: string };

interface CommonValidators<TValue, TFormData> {
	required?: ValidatorRule<boolean>;
	custom?:
		| CustomValidator<TValue, TFormData>
		| Record<string, CustomValidator<TValue, TFormData>>;
}

interface StringValidators {
	minLength?: ValidatorRule<number>;
	maxLength?: ValidatorRule<number>;
	pattern?: ValidatorRule<RegExp>;
	email?: ValidatorRule<boolean>;
}

interface NumberValidators {
	min?: ValidatorRule<number>;
	max?: ValidatorRule<number>;
}

interface ArrayValidators {
	minLength?: ValidatorRule<number>;
	maxLength?: ValidatorRule<number>;
}

// Augmentable: consumers add their own named validator rules.
// Example:
//   declare module '@easy-forms/core' {
//     interface ValidatorRegistry { creditCard?: boolean; }
//   }
export interface ValidatorRegistry {}

type ValueValidators<TValue> = NonNullable<TValue> extends string
	? StringValidators
	: NonNullable<TValue> extends number
		? NumberValidators
		: NonNullable<TValue> extends readonly unknown[]
			? ArrayValidators
			: // biome-ignore lint/complexity/noBannedTypes: empty intersection collapses additional keys.
				{};

export type BuiltInValidators<TValue, TFormData> = CommonValidators<TValue, TFormData> &
	ValueValidators<TValue>;

export type Validators<TValue, TFormData> = BuiltInValidators<TValue, TFormData> &
	Partial<ValidatorRegistry>;
