import type { ExtensionQuestion, Group } from '@easy-forms/core';

// NOTE: this control is marked a cross-boundary *container* (so a form-level
// dependent reads it as an array of row objects) via `registerContainerControl`
// — but that call lives in `hooks/useRepeatingGroup` (a runtime-retained path),
// NOT here: a top-level side-effect in this types-only module is tree-shaken away
// under the package's `sideEffects: false`.

/**
 * Config for the Pro `repeatingGroup` control — a sub-form the end user repeats
 * N times (add / remove). `TItem` is the shape of a single repeated row (its
 * columns); `groups` and `defaultItem` are typed against it.
 *
 * The item is described with the same `Group` structure as the rest of the
 * schema — so you get the same layout (`layout`, `gridCols`, titles) and can
 * nest groups inside an item. Per-item field keys register in the parent store
 * under `${key}.${index}.${childKey}` and assemble into a nested `TItem[]`
 * array at output.
 *
 * A form author declares one as a plain schema object — no factory function:
 *
 * ```ts
 * { key: 'bankAccounts', label: 'Bank accounts', control: 'repeatingGroup',
 *   minItems: 1, maxItems: 4,
 *   groups: [{ layout: 'grid', gridCols: 2, questions: [ ... ] }] }
 * ```
 *
 * Row fields may declare `dependents` that read other fields in the *same* row
 * by their item-relative key. To read a form-level field from inside a row,
 * prefix the source name with `$root.` (e.g. `fieldNames: ['$root.accountType']`)
 * — `compute` still receives the clean name (`accountType`).
 */
export interface RepeatingGroupConfig<
	TItem extends Record<string, unknown> = Record<string, unknown>,
> {
	/** The repeated item's content, as group(s) — same structure as the form
	 *  schema. Item field `key`s are item-relative (e.g. `currency`). */
	groups: Group<TItem>[];
	minItems?: number;
	maxItems?: number;
	/** Add-button label. Default: "Add". */
	addLabel?: string;
	/** Remove-button label. Default: "Remove". */
	removeLabel?: string;
	/** Initial values seeded into a newly added item's fields. */
	defaultItem?: Partial<TItem>;
	/** Optional per-row heading, e.g. `(i) => \`Account ${i + 1}\``. */
	itemLabel?: (index: number) => string;
}

declare module '@easy-forms/core' {
	interface ControlTypeExtensions {
		repeatingGroup: { value: unknown[] } & RepeatingGroupConfig;
	}
}

/** A first-class `Question` for the `repeatingGroup` control. */
export type RepeatingGroupQuestion<
	TFormData extends Record<string, unknown> = Record<string, unknown>,
> = ExtensionQuestion<'repeatingGroup', TFormData>;
