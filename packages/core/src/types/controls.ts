// Controls — the discriminated `Question` union.
//
// The discriminator is the `control` string literal. Each per-control config
// interface specifies its `TValue` so validators narrow correctly (e.g. a
// CheckboxQuestion has TValue=boolean, so `validators.minLength` is a TS error).

import type { ComponentType, ReactNode } from 'react';
import type { Dependency, ExtraDependencyKey } from './dependencies';
import type { Validators } from './validators';

export type BuiltInControlType =
	| 'text'
	| 'textarea'
	| 'number'
	| 'email'
	| 'dropdown'
	| 'multiselect'
	| 'checkbox'
	| 'checkboxList'
	| 'radioGroup'
	| 'date'
	| 'file'
	| 'custom';

// Augmentable: consumers (and `@easy-forms/pro`) add their own control
// identifiers + config/value types. An extension entry may carry a `value`
// member to declare the control's value type; the remaining members become
// the question's config props.
//   declare module '@easy-forms/core' {
//     interface ControlTypeExtensions {
//       signature: { value: string; canvasSize: { w: number; h: number } };
//     }
//   }
export interface ControlTypeExtensions {}

export type ControlExtensionKey = Extract<keyof ControlTypeExtensions, string>;

export type ControlType = BuiltInControlType | ControlExtensionKey;

export interface BaseQuestion<
	TControl extends ControlType,
	TValue,
	TFormData extends Record<string, unknown> = Record<string, unknown>,
	TDeps extends ExtraDependencyKey<TFormData> = never,
> {
	key: string;
	label: string;
	control: TControl;
	defaultValue?: TValue;
	className?: string;
	description?: string;
	readOnly?: boolean;
	disabled?: boolean;
	hidden?: boolean;
	/**
	 * Runtime-derived required flag. Typically left unset by authors who
	 * declare requiredness via `validators.required`. <Field> populates this
	 * field on the *effective* question (the merged object passed to
	 * renderers) when `propsDependsOn` emits `{ required: true }`.
	 */
	required?: boolean;
	ignoreDirtyState?: boolean;
	/** Default true. When false, a field's value survives going hidden via visibilityDependsOn. */
	clearWhenHidden?: boolean;
	validators?: Validators<TValue, TFormData>;
	dependents?: Dependency<TFormData, TDeps>;
	formatter?: (value: TValue) => TValue;
	/** Renderer escape hatch — not interpreted by the core. */
	meta?: Record<string, unknown>;
}

export interface Option<V extends OptionValue = OptionValue> {
	value: V;
	label: string;
	disabled?: boolean;
}

export type OptionValue = string | number | boolean;

// ---------- Per-control configs ----------

export interface TextQuestion<TFormData extends Record<string, unknown> = Record<string, unknown>>
	extends BaseQuestion<'text', string, TFormData> {
	placeholder?: string;
	maxLength?: number;
	capitalize?: 'upper' | 'lower' | 'title';
	prefix?: string;
	suffix?: string;
	inputType?: 'text' | 'password' | 'tel' | 'url';
}

export interface TextAreaQuestion<
	TFormData extends Record<string, unknown> = Record<string, unknown>,
> extends BaseQuestion<'textarea', string, TFormData> {
	rows?: number;
	placeholder?: string;
	maxLength?: number;
}

export interface NumberQuestion<TFormData extends Record<string, unknown> = Record<string, unknown>>
	extends BaseQuestion<'number', number | null, TFormData> {
	min?: number;
	max?: number;
	decimalScale?: number;
	allowThousandSeparator?: boolean;
	prefix?: string;
	suffix?: string;
	placeholder?: string;
}

export interface EmailQuestion<TFormData extends Record<string, unknown> = Record<string, unknown>>
	extends BaseQuestion<'email', string, TFormData> {
	placeholder?: string;
}

export interface DropdownQuestion<
	TFormData extends Record<string, unknown> = Record<string, unknown>,
	V extends OptionValue = string,
> extends BaseQuestion<'dropdown', V | null, TFormData> {
	options?: Option<V>[];
	loadOptions?: (formValues: TFormData) => Option<V>[] | Promise<Option<V>[]>;
	placeholder?: string;
	clearable?: boolean;
}

export interface MultiSelectQuestion<
	TFormData extends Record<string, unknown> = Record<string, unknown>,
	V extends OptionValue = string,
> extends BaseQuestion<'multiselect', V[], TFormData> {
	options?: Option<V>[];
	loadOptions?: (formValues: TFormData) => Option<V>[] | Promise<Option<V>[]>;
	enableSelectAll?: boolean;
	placeholder?: string;
}

export interface CheckboxQuestion<
	TFormData extends Record<string, unknown> = Record<string, unknown>,
> extends BaseQuestion<'checkbox', boolean, TFormData> {
	checkboxLabel?: string;
}

export interface CheckboxListQuestion<
	TFormData extends Record<string, unknown> = Record<string, unknown>,
	V extends OptionValue = string,
> extends BaseQuestion<'checkboxList', V[], TFormData> {
	options: Option<V>[];
	vertical?: boolean;
	showSelectAll?: boolean;
	selectAllLabel?: string;
}

export interface RadioGroupQuestion<
	TFormData extends Record<string, unknown> = Record<string, unknown>,
	V extends OptionValue = string,
> extends BaseQuestion<'radioGroup', V | null, TFormData> {
	options: Option<V>[];
	vertical?: boolean;
}

export interface DateQuestion<TFormData extends Record<string, unknown> = Record<string, unknown>>
	extends BaseQuestion<'date', string | null, TFormData> {
	/** ISO yyyy-mm-dd string or a derive function. */
	minDate?: string | ((values: TFormData) => string);
	maxDate?: string | ((values: TFormData) => string);
	view?: 'date' | 'month' | 'year';
	placeholder?: string;
}

export interface FileQuestion<TFormData extends Record<string, unknown> = Record<string, unknown>>
	extends BaseQuestion<'file', File[] | null, TFormData> {
	accept?: Record<string, string[]>;
	multiple?: boolean;
	maxFiles?: number;
	maxSizeMB?: number;
	minSizeMB?: number;
}

export interface CustomRendererProps<TValue = unknown> {
	value: TValue;
	onChange: (value: TValue) => void;
	onBlur: () => void;
	disabled: boolean;
	readOnly: boolean;
	error: string | null;
	[extra: string]: unknown;
}

export interface CustomQuestion<
	TFormData extends Record<string, unknown> = Record<string, unknown>,
	TValue = unknown,
> extends BaseQuestion<'custom', TValue, TFormData> {
	// `component` accepts any CustomRendererProps<V> — the variance friction is
	// unavoidable since the form schema can't statically know each custom value
	// type. The component receives the actual value at runtime via the renderer.
	// biome-ignore lint/suspicious/noExplicitAny: see comment above.
	component?: ComponentType<CustomRendererProps<any>>;
	componentProps?: Record<string, unknown>;
	// biome-ignore lint/suspicious/noExplicitAny: see comment above.
	render?: (props: CustomRendererProps<any>) => ReactNode;
}

// ---------- Augmentable extension questions ----------

// The value type an extension entry declares via its `value` member.
type ExtensionValue<T> = T extends { value: infer V } ? V : unknown;

/**
 * A first-class `Question` synthesized from a `ControlTypeExtensions` entry:
 * `BaseQuestion` for control `K` (with the declared value type) plus the
 * entry's remaining members as config props. This is what makes a custom
 * `control` (e.g. `repeatingGroup`) placeable in a schema and narrowable by
 * its discriminant — with no `as never` casts at the renderer.
 */
export type ExtensionQuestion<
	K extends ControlExtensionKey,
	TFormData extends Record<string, unknown> = Record<string, unknown>,
> = BaseQuestion<K, ExtensionValue<ControlTypeExtensions[K]>, TFormData> &
	Omit<ControlTypeExtensions[K], 'value'>;

// Distributes over every augmented control. Resolves to `never` when
// `ControlTypeExtensions` is empty, leaving the built-in union untouched.
type ExtensionQuestions<TFormData extends Record<string, unknown>> = {
	[K in ControlExtensionKey]: ExtensionQuestion<K, TFormData>;
}[ControlExtensionKey];

// ---------- Discriminated union ----------

export type Question<TFormData extends Record<string, unknown> = Record<string, unknown>> =
	| TextQuestion<TFormData>
	| TextAreaQuestion<TFormData>
	| NumberQuestion<TFormData>
	| EmailQuestion<TFormData>
	| DropdownQuestion<TFormData>
	| MultiSelectQuestion<TFormData>
	| CheckboxQuestion<TFormData>
	| CheckboxListQuestion<TFormData>
	| RadioGroupQuestion<TFormData>
	| DateQuestion<TFormData>
	| FileQuestion<TFormData>
	| CustomQuestion<TFormData>
	| ExtensionQuestions<TFormData>;
