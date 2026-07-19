// ChromeRegistryContext — injects consumer-ejected chrome components (the
// GroupRenderer today) into core + Pro, which no longer ship rendered chrome.
// One context per concern, matching FormStoreContext / RendererRegistryContext.
import { type ComponentType, createContext, useContext } from 'react';
import type { GroupRendererProps } from '../types/chrome';

export interface ChromeRegistry {
	GroupRenderer: ComponentType<GroupRendererProps>;
}

export const ChromeRegistryContext = createContext<ChromeRegistry | null>(null);

export function useChromeRegistry(): ChromeRegistry {
	const value = useContext(ChromeRegistryContext);
	if (!value) {
		throw new Error(
			'ChromeRegistryContext missing: render inside <EasyForm>, <Wizard>, or ' +
				'<AdvancedWizard>, which provide the chrome registry.'
		);
	}
	return value;
}
