import { createContext, useContext } from 'react';
import type { WizardStep } from '../types/schema';

export interface WizardState {
	currentStepIndex: number;
	visitedSteps: ReadonlySet<number>;
	visibleStepIndices: readonly number[];
}

export interface WizardContextValue {
	state: WizardState;
	step: WizardStep;
	steps: readonly WizardStep[];
	isFirstVisibleStep: boolean;
	isLastVisibleStep: boolean;
	canGoPrevious: boolean;
	canGoNext: boolean;
	goNext: () => Promise<boolean>;
	goPrevious: () => void;
	goTo: (index: number) => Promise<boolean>;
	submit: () => Promise<void>;
}

export const WizardContext = createContext<WizardContextValue | null>(null);

export function useWizard(): WizardContextValue {
	const value = useContext(WizardContext);
	if (!value) {
		throw new Error(
			'useWizard: no WizardContext found. Wrap your form in <Wizard> or use a schema with `wizard.steps`.'
		);
	}
	return value;
}
