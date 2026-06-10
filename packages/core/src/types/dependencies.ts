// Dependencies — typed aggregation (no `any`) + module-augmentable registry
// for custom dependency types beyond the three built-ins.
//
// The taxonomy splits deps into two categories:
//
//   Category 1: dynamic question/group props (`propsDependsOn`)
//     Anything that changes how a field/group is displayed or behaves —
//     `hidden`, `required`, `readOnly`, `disabled`, `options`, `min`/`max`,
//     `minDate`/`maxDate`, `placeholder`, `prefix`/`suffix`, `description`,
//     `label`, `className` — flows through ONE generic dep. Adding a new
//     dynamic prop later costs zero new handler code: just include it in the
//     `compute()` return value.
//
//   Category 2: form-data mutations (`valueDependsOn`, `resetDependsOn`)
//     `valueDependsOn` derives a target's value from sources.
//     `resetDependsOn` resets a field when a predicate becomes true (rising edge).

export type FieldName<TFormData> = Extract<keyof TFormData, string>;

// Typed aggregation: receives a Pick<> of just the depended-on fields.
export type Aggregator<TFormData, TFields extends readonly FieldName<TFormData>[], TResult> = (
	values: Pick<TFormData, TFields[number]>
) => TResult;

// ---------------------------------------------------------------------------
// RuntimeProps — the shape of dynamic-prop overrides written by `propsDependsOn`
//
// Field-level handlers may write any of these. Group-level handlers only
// meaningfully use `hidden`, `title`, `description`, `className`; other keys
// on a group target are silently ignored by GroupRenderer.
// ---------------------------------------------------------------------------

export interface RuntimeOption {
	value: string | number | boolean;
	label: string;
	disabled?: boolean;
}

export interface RuntimeProps {
	// Universal
	hidden?: boolean;
	required?: boolean;
	readOnly?: boolean;
	disabled?: boolean;
	description?: string;
	label?: string;
	className?: string;
	// Selectable controls
	options?: readonly RuntimeOption[];
	// Number / range
	min?: number;
	max?: number;
	// Date
	minDate?: string;
	maxDate?: string;
	// Text-ish
	placeholder?: string;
	prefix?: string;
	suffix?: string;
	// Group-only convenience
	title?: string;
}

// ---------------------------------------------------------------------------
// The three built-in dependency kinds
// ---------------------------------------------------------------------------

/**
 * A single rule inside the `propsDependsOn` array. Multiple rules may declare
 * disjoint source field sets; the engine subscribes to each rule's sources
 * independently. When multiple rules write the same prop, later rules in the
 * array win (last-write semantics).
 */
export interface PropsDependencyRule<
	TFormData,
	TFields extends readonly FieldName<TFormData>[] = readonly FieldName<TFormData>[],
> {
	fieldNames: TFields;
	compute: Aggregator<TFormData, TFields, Partial<RuntimeProps>>;
}

export interface ValueDependency<
	TFormData,
	TFields extends readonly FieldName<TFormData>[] = readonly FieldName<TFormData>[],
	TValue = unknown,
> {
	fieldNames: TFields;
	compute: Aggregator<TFormData, TFields, TValue>;
}

export interface ResetDependency<
	TFormData,
	TFields extends readonly FieldName<TFormData>[] = readonly FieldName<TFormData>[],
> {
	fieldNames: TFields;
	/** Resets the target when this transitions from false to true. */
	when: Aggregator<TFormData, TFields, boolean>;
}

export interface BuiltInDependencies<TFormData = Record<string, unknown>> {
	/** Category 1 — array of dynamic-prop rules. */
	propsDependsOn?: PropsDependencyRule<TFormData>[];
	/** Category 2 — derive the target's value from source values. */
	valueDependsOn?: ValueDependency<TFormData>;
	/** Category 2 — reset the target on rising edge of a predicate. */
	resetDependsOn?: ResetDependency<TFormData>;
}

// ---------------------------------------------------------------------------
// Module-augmentable extension point for custom dep kinds.
//
//   declare module '@easy-forms/core' {
//     interface DependencyRegistry<TFormData> {
//       myCustomDep?: { fieldNames: FieldName<TFormData>[]; ... };
//     }
//   }
// ---------------------------------------------------------------------------

// biome-ignore lint/correctness/noUnusedVariables: TFormData reserved for augmentation.
export interface DependencyRegistry<TFormData = Record<string, unknown>> {}

export type ExtraDependencyKey<TFormData = Record<string, unknown>> = Extract<
	keyof DependencyRegistry<TFormData>,
	string
>;

export type Dependency<
	TFormData = Record<string, unknown>,
	TExtra extends ExtraDependencyKey<TFormData> = never,
> = BuiltInDependencies<TFormData> & Pick<DependencyRegistry<TFormData>, TExtra>;
