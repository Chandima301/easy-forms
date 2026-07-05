// @easy-forms/pro — public entrypoint.

export { ProWatermark } from './components/ProWatermark';
export {
	RepeatingGroupItem,
	type RepeatingGroupItemProps,
} from './components/RepeatingGroupItem';
export type {
	RepeatingGroupConfig,
	RepeatingGroupQuestion,
} from './controls/repeatingGroup';
// `$root.` escape marker: use it in a row field's `dependents` `fieldNames` to
// read a form-level field from inside a repeating row (e.g. `$root.accountType`).
export { ROOT_FIELD_PREFIX } from './controls/prefixItemGroups';
export {
	useRepeatingGroup,
	type UseRepeatingGroupResult,
} from './hooks/useRepeatingGroup';
// Optional helper: wire `minItems` / `maxItems` into submit-time validators on a
// declarative question (`validators: repeatingGroupValidators({ minItems, maxItems })`).
// The control already enforces the bounds in its UI, so this is opt-in.
export {
	repeatingGroupValidators,
	type RepeatingGroupBounds,
} from './controls/repeatingGroupValidators';
export { useProLicense } from './hooks/useProLicense';
export type { UseProLicenseResult } from './hooks/useProLicense';
export { assertLicensed } from './license/assertLicensed';
export {
	getLicenseStatus,
	setEasyFormsProLicense,
} from './license/setEasyFormsProLicense';
export type {
	LicenseClaims,
	LicenseInvalidReason,
	LicenseStatus,
	ProEdition,
} from './license/types';
export { verifyLicense } from './license/verify';
