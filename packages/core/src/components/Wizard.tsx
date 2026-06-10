// Wizard — multi-step form runtime.
//
// Design:
//   - All step groups are rendered in the DOM, but only the active step is
//     visible (display: block). This keeps every field registered with the
//     store, so cross-step `valueDependsOn` works and the merged `getValues()`
//     always reflects every step's inputs.
//   - Per-step validation gating: `goNext` only validates the active step's
//     field keys, not the entire form.
//   - Step-level `visibilityDependsOn` skips hidden steps in navigation.
//   - `persistKey` debounced-writes `{ values, currentStepIndex }` to
//     localStorage; on mount, the wizard hydrates from it. On successful
//     submit the key is cleared.

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useFormStoreContext } from '../context/useFormStoreContext';
import { useFormValues } from '../hooks/useFormValues';
import type { WizardConfig, WizardStep } from '../types/schema';
import { WizardContext, type WizardContextValue, type WizardState } from '../wizard/WizardContext';
import { clearPersisted, createDebouncedSaver, loadPersisted } from '../wizard/persistence';
import { collectStepFieldKeys, isStepVisible } from '../wizard/walkSteps';
import { GroupRenderer } from './GroupRenderer';

export interface WizardProps {
	// WizardConfig is generic in TFormData but the runtime doesn't read field
	// values typed by it — same variance dodge as GroupRenderer/engine.
	// biome-ignore lint/suspicious/noExplicitAny: see comment above.
	wizard: WizardConfig<any>;
	onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
	nextLabel?: string;
	previousLabel?: string;
	submitLabel?: string;
	className?: string;
}

export function Wizard({
	wizard,
	onSubmit,
	nextLabel = 'Next',
	previousLabel = 'Back',
	submitLabel = 'Submit',
	className,
}: WizardProps) {
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

	const ctx: WizardContextValue = {
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

	return (
		<WizardContext.Provider value={ctx}>
			<div className={['easy-forms-wizard', className].filter(Boolean).join(' ')}>
				<WizardStepIndicators />
				<div className="easy-forms-wizard__panels">
					{wizard.steps.map((s, idx) => (
						<div
							key={s.id}
							role="tabpanel"
							aria-hidden={idx !== currentStepIndex}
							aria-labelledby={`step-tab-${s.id}`}
							style={{ display: idx === currentStepIndex ? 'block' : 'none' }}
							className="easy-forms-wizard__panel"
						>
							{s.groups.map((group, gi) => (
								<GroupRenderer
									key={group.id ?? group.title ?? `wizard-${s.id}-${gi}`}
									group={group}
								/>
							))}
						</div>
					))}
				</div>
				<WizardNav nextLabel={nextLabel} previousLabel={previousLabel} submitLabel={submitLabel} />
			</div>
		</WizardContext.Provider>
	);
}

function WizardStepIndicators() {
	const { steps, state, goTo } = useWizardSafe();
	return (
		<nav className="easy-forms-wizard__nav" aria-label="Wizard progress">
			<ol className="easy-forms-wizard__nav-list">
				{steps.map((step, idx) => {
					const isVisible = state.visibleStepIndices.includes(idx);
					if (!isVisible) return null;
					const isActive = idx === state.currentStepIndex;
					const isVisited = state.visitedSteps.has(idx);
					return (
						<li
							key={step.id}
							className={[
								'easy-forms-wizard__nav-item',
								isActive && 'easy-forms-wizard__nav-item--active',
								isVisited && 'easy-forms-wizard__nav-item--visited',
							]
								.filter(Boolean)
								.join(' ')}
						>
							<button
								id={`step-tab-${step.id}`}
								type="button"
								onClick={() => {
									if (isVisited) void goTo(idx);
								}}
								disabled={!isVisited}
								aria-current={isActive ? 'step' : undefined}
							>
								{step.title}
							</button>
						</li>
					);
				})}
			</ol>
		</nav>
	);
}

function WizardNav({
	nextLabel,
	previousLabel,
	submitLabel,
}: {
	nextLabel: string;
	previousLabel: string;
	submitLabel: string;
}) {
	const { canGoPrevious, isLastVisibleStep, goNext, goPrevious, submit } = useWizardSafe();
	return (
		<footer className="easy-forms-wizard__footer">
			<button
				type="button"
				className="easy-forms-wizard__previous"
				onClick={goPrevious}
				disabled={!canGoPrevious}
			>
				{previousLabel}
			</button>
			{isLastVisibleStep ? (
				<button type="button" className="easy-forms-wizard__submit" onClick={() => void submit()}>
					{submitLabel}
				</button>
			) : (
				<button type="button" className="easy-forms-wizard__next" onClick={() => void goNext()}>
					{nextLabel}
				</button>
			)}
		</footer>
	);
}

// Internal hook — used by the sub-components defined in this file so they
// can read the context provided by their parent <Wizard>.
function useWizardSafe(): WizardContextValue {
	const value = useContext(WizardContext);
	if (!value) throw new Error('Wizard internal: missing context');
	return value;
}
