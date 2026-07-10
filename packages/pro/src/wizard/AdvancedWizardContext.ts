// Context carrying the branching-wizard engine result, so an ejected
// `<AdvancedWizard>`'s sub-components (indicator, nav, panels) can read it without
// prop-drilling — mirrors core's `WizardContext`.

import { createContext, useContext } from 'react';
import type { UseAdvancedWizardResult } from './types';

export const AdvancedWizardContext = createContext<UseAdvancedWizardResult | null>(null);

export function useAdvancedWizardContext(): UseAdvancedWizardResult {
	const value = useContext(AdvancedWizardContext);
	if (!value) {
		throw new Error(
			'useAdvancedWizardContext: no AdvancedWizardContext found. Render inside <AdvancedWizard>.'
		);
	}
	return value;
}
