// @easy-forms/pro — public entrypoint.

export { RepeatingGroupRenderer } from './components/RepeatingGroupRenderer';
export { ProWatermark } from './components/ProWatermark';
export type {
	RepeatingGroupConfig,
	RepeatingGroupQuestion,
} from './controls/repeatingGroup';
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
