// Registry of "container" control types — controls whose value is a nested
// collection (a `repeatingGroup`'s array of row objects), addressed in the flat
// store as `key.<index>.<field>`.
//
// Core stays generic: it never names `repeatingGroup`. A package that ships a
// container control (`@easy-forms/pro`) calls `registerContainerControl` as an
// import side-effect. The dependency graph then knows which source keys are
// containers so a form-level dependent can (a) read the *nested* value of the
// container (row objects, not the raw index list) and (b) subscribe to the whole
// subtree so it wakes on row-field edits, not just add/remove.

const containerControls = new Set<string>();

/** Mark a control type as a nested container (called by the control's package). */
export function registerContainerControl(controlType: string): void {
	containerControls.add(controlType);
}

/** True when `controlType` was registered as a container. */
export function isContainerControl(controlType: string): boolean {
	return containerControls.has(controlType);
}
