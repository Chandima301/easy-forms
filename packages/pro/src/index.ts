// @easy-forms/pro — public entrypoint.

export {
	AdvancedWizardPanel,
	type AdvancedWizardPanelProps,
} from './components/AdvancedWizardPanel';
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
export {
	useAdvancedWizard,
	type UseAdvancedWizardOptions,
} from './hooks/useAdvancedWizard';
export { useProLicense } from './hooks/useProLicense';
export type { UseProLicenseResult } from './hooks/useProLicense';
// Branching (non-linear) wizard — the Pro engine. Pair with the ejectable
// `<AdvancedWizard>` from the shadcn registry (`shadcn add @easy-forms/advanced-wizard`).
export {
	AdvancedWizardContext,
	useAdvancedWizardContext,
} from './wizard/AdvancedWizardContext';
export { projectPath, resolveNext } from './wizard/routing';
export type {
	AdvancedWizardConfig,
	AdvancedWizardRoute,
	AdvancedWizardStep,
	AdvancedWizardStepState,
	AdvancedWizardStepStatus,
	UseAdvancedWizardResult,
} from './wizard/types';
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
