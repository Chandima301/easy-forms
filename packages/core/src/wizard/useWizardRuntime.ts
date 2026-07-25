// useWizardRuntime — the wizard state machine, extracted from the deleted
// `<Wizard>` component (see git history prior to commit 843696a). Core keeps
// LOGIC; rendering the steps/nav is left to an ejectable chrome component
// that calls this hook and provides the `<WizardContext.Provider>`.
//
// Design (unchanged from the original component):
//   - Callers are expected to render every step's fields (typically all
//     mounted, active step visible) so every field stays registered with the
//     store — this keeps cross-step `valueDependsOn` working and
//     `getValues()` always reflecting every step's inputs.
//   - Per-step validation gating: `goNext`/forward `goTo` only validate the
//     active step's field keys, not the entire form.
//   - Step-level `propsDependsOn` (`hidden`) skips hidden steps in
//     navigation via `isStepVisible`.
//   - `persistKey` debounced-writes `{ values, currentStepIndex }` to
//     localStorage; on mount, the wizard hydrates from it. On successful
//     submit the key is cleared.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormStoreContext } from '../context/useFormStoreContext';
import { useFormValues } from '../hooks/useFormValues';
import type { WizardConfig, WizardStep } from '../types/schema';
import type { WizardContextValue, WizardState } from './WizardContext';
import { clearPersisted, createDebouncedSaver, loadPersisted } from './persistence';
import { collectStepFieldKeys, isStepVisible } from './walkSteps';

export interface UseWizardRuntimeOptions {
	onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
}

export function useWizardRuntime(
	// WizardConfig is generic in TFormData but the runtime doesn't read field
	// values typed by it — same variance dodge as GroupRenderer/engine.
	// biome-ignore lint/suspicious/noExplicitAny: see comment above.
	wizard: WizardConfig<any>,
	{ onSubmit }: UseWizardRuntimeOptions
): WizardContextValue {
	const store = useFormStoreContext();
	const values = useFormValues();

	const visibleStepIndices = useMemo(() => {
		const indices: number[] = [];
		wizard.steps.forEach((step, idx) => {
			if (isStepVisible(step, values)) indices.push(idx);
		});
		return indices;
	}, [wizard.steps, values]);

	// Hydrate persisted state once on mount.
	const hydratedRef = useRef(false);
	const [currentStepIndex, setCurrentStepIndex] = useState(() => visibleStepIndices[0] ?? 0);
	const [visitedSteps, setVisitedSteps] = useState<ReadonlySet<number>>(
		() => new Set([visibleStepIndices[0] ?? 0])
	);

	useEffect(() => {
		if (hydratedRef.current) return;
		hydratedRef.current = true;
		if (!wizard.persistKey) return;
		const persisted = loadPersisted(wizard.persistKey);
		if (!persisted) return;
		for (const [k, v] of Object.entries(persisted.values)) {
			store.setValue(k, v, { validate: false, markDirty: false });
		}
		setCurrentStepIndex(persisted.currentStepIndex);
		setVisitedSteps((prev) => new Set([...prev, persisted.currentStepIndex]));
	}, [wizard.persistKey, store]);

	// Debounced persistence — fires on form-value changes AND when the step
	// index changes (so a "next" click is captured even without typing).
	const saver = useMemo(
		() => (wizard.persistKey ? createDebouncedSaver(wizard.persistKey) : null),
		[wizard.persistKey]
	);
	useEffect(() => {
		if (!saver) return;
		const unsub = store.subscribeForm(() => {
			saver({ values: store.getValues(), currentStepIndex });
		});
		return unsub;
	}, [saver, store, currentStepIndex]);
	useEffect(() => {
		if (!saver || !hydratedRef.current) return;
		saver({ values: store.getValues(), currentStepIndex });
	}, [saver, store, currentStepIndex]);

	const step = wizard.steps[currentStepIndex] as WizardStep;

	const positionInVisible = visibleStepIndices.indexOf(currentStepIndex);
	const isFirstVisibleStep = positionInVisible <= 0;
	const isLastVisibleStep =
		positionInVisible === -1 || positionInVisible === visibleStepIndices.length - 1;

	const validateCurrentStep = useCallback(async (): Promise<boolean> => {
		if (wizard.validateOnNext === false) return true;
		const keys = collectStepFieldKeys(step);
		return store.validateAll(keys);
	}, [step, store, wizard.validateOnNext]);

	const goTo = useCallback(
		async (index: number): Promise<boolean> => {
			if (!visibleStepIndices.includes(index)) return false;
			// Validate forward navigation only.
			if (index > currentStepIndex) {
				const ok = await validateCurrentStep();
				if (!ok) return false;
			}
			setCurrentStepIndex(index);
			setVisitedSteps((prev) => new Set([...prev, index]));
			return true;
		},
		[visibleStepIndices, currentStepIndex, validateCurrentStep]
	);

	const goNext = useCallback(async (): Promise<boolean> => {
		const idxInVisible = visibleStepIndices.indexOf(currentStepIndex);
		const next = visibleStepIndices[idxInVisible + 1];
		if (next === undefined) return false;
		return goTo(next);
	}, [visibleStepIndices, currentStepIndex, goTo]);

	const goPrevious = useCallback((): void => {
		const idxInVisible = visibleStepIndices.indexOf(currentStepIndex);
		const prev = visibleStepIndices[idxInVisible - 1];
		if (prev === undefined) return;
		setCurrentStepIndex(prev);
	}, [visibleStepIndices, currentStepIndex]);

	const submit = useCallback(async (): Promise<void> => {
		const ok = await validateCurrentStep();
		if (!ok) return;
		await store.submit(async (vals) => {
			await onSubmit(vals);
			if (wizard.persistKey) clearPersisted(wizard.persistKey);
		});
	}, [validateCurrentStep, store, onSubmit, wizard.persistKey]);

	const wizardState: WizardState = {
		currentStepIndex,
		visitedSteps,
		visibleStepIndices,
	};

	return {
		state: wizardState,
		step,
		steps: wizard.steps,
		isFirstVisibleStep,
		isLastVisibleStep,
		canGoPrevious: !isFirstVisibleStep,
		canGoNext: !isLastVisibleStep,
		goNext,
		goPrevious,
		goTo,
		submit,
	};
}
