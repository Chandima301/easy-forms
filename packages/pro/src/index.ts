// @easy-forms/pro — public entrypoint.

export { ProWatermark } from './components/ProWatermark';
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
