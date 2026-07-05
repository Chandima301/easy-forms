import { collectStepFieldKeys, useFormState, useFormStoreContext } from '@easy-forms/core';
import { useCallback, useMemo, useState } from 'react';
import { projectPath, resolveNext } from '../wizard/routing';
import type {
	AdvancedWizardConfig,
	AdvancedWizardStepState,
	AdvancedWizardStepStatus,
	UseAdvancedWizardResult,
} from '../wizard/types';
import { useProLicense } from './useProLicense';

export interface UseAdvancedWizardOptions {
	onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
}

function nonNull<T>(value: T | undefined, message: string): T {
	if (value === undefined) throw new Error(message);
	return value;
}

/**
 * Headless engine for the Pro branching wizard. Owns the moat: declarative route
 * resolution, the taken back-stack (start → current), per-step validation gating,
 * and off-path field exclusion (only the projected path is mounted). An ejectable
 * `<AdvancedWizard>` renders the step-states creatively.
 *
 * `backStack` is always exactly start → current. `goNext` re-resolves the route
 * from the live answers and pushes — so re-answering an earlier step naturally
 * reroutes and discards a previously-taken forward branch.
 *
 * Persistence is intentionally not built in — the consumer owns save/resume (a
 * future `onChange` will surface the live state so any storage can be wired up).
 */
export function useAdvancedWizard(
	config: AdvancedWizardConfig,
	{ onSubmit }: UseAdvancedWizardOptions
): UseAdvancedWizardResult {
	const store = useFormStoreContext();
	// `useFormState` re-renders on both value AND error changes (its snapshot
	// equality covers `errors`), so per-step error chips stay live.
	const derived = useFormState();
	const values = derived.values;
	const errors = derived.errors;
	// Side effect only: fire the one-time dev `assertLicensed` warning. Enforcement
	// is soft/honor-based (prod never blocks), so nothing license-related is exposed.
	useProLicense('advancedWizard');

	const navigation = config.navigation ?? 'strict';
	const startId = config.start ?? config.steps[0]?.id ?? '';
	const [backStack, setBackStack] = useState<string[]>(() => [startId]);

	const currentId = backStack[backStack.length - 1] ?? startId;

	const byId = useMemo(() => new Map(config.steps.map((s) => [s.id, s])), [config.steps]);
	const currentStep = nonNull(
		byId.get(currentId) ?? config.steps[0],
		'useAdvancedWizard: config.steps must be non-empty'
	);

	const projectedIds = useMemo(
		() => projectPath(config, backStack, values),
		[config, backStack, values]
	);

	const { steps, path, current, invalidSteps } = useMemo(() => {
		const pathSet = new Set(projectedIds);
		const visitedSet = new Set(backStack);
		const decorated: AdvancedWizardStepState[] = config.steps.map((s, index) => {
			const isActive = s.id === currentId;
			const isVisited = visitedSet.has(s.id);
			const isOnPath = pathSet.has(s.id);
			let status: AdvancedWizardStepStatus;
			if (isActive) status = 'active';
			else if (isVisited) status = 'completed';
			else if (isOnPath) status = 'upcoming';
			else status = 'unreachable';
			// Count this step's fields currently in error. `errors` only holds
			// validated, non-hidden fields, so unvalidated / hidden fields contribute 0.
			let errorCount = 0;
			for (const key of collectStepFieldKeys(s)) {
				if (key in errors) errorCount += 1;
			}
			// Lenient mode lets you jump to any step on the projected path (forward or
			// back); strict mode is visited-only.
			const canNavigateTo = !isActive && (navigation === 'lenient' ? isOnPath : isVisited);
			return {
				id: s.id,
				title: s.title,
				description: s.description,
				index,
				status,
				isActive,
				isVisited,
				isOnPath,
				canNavigateTo,
				errorCount,
				hasErrors: errorCount > 0,
			};
		});
		const stateById = new Map(decorated.map((s) => [s.id, s]));
		const orderedPath = projectedIds
			.map((id) => stateById.get(id))
			.filter((s): s is AdvancedWizardStepState => s !== undefined);
		return {
			steps: decorated,
			path: orderedPath,
			current: nonNull(
				stateById.get(currentId) ?? decorated[0],
				'useAdvancedWizard: config.steps must be non-empty'
			),
			invalidSteps: orderedPath.filter((s) => s.hasErrors),
		};
	}, [config.steps, projectedIds, backStack, currentId, errors, navigation]);

	const isTerminalStep = resolveNext(config, currentStep, values) === null;
	const isFirstStep = backStack.length <= 1;

	const validateCurrentStep = useCallback(async (): Promise<boolean> => {
		if (config.validateOnNext === false) return true;
		return store.validateAll(collectStepFieldKeys(currentStep));
	}, [config.validateOnNext, currentStep, store]);

	const goNext = useCallback(async (): Promise<boolean> => {
		const target = resolveNext(config, currentStep, store.getValues());
		if (target === null) return false;
		// Always validate (so errors populate for chips); only strict mode blocks.
		const ok = await validateCurrentStep();
		if (!ok && navigation !== 'lenient') return false;
		setBackStack((prev) => [...prev, target]);
		return true;
	}, [config, currentStep, store, validateCurrentStep, navigation]);

	const goPrevious = useCallback((): void => {
		setBackStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
	}, []);

	const goTo = useCallback(
		async (stepId: string): Promise<boolean> => {
			// Back-jump to a visited step: truncate the stack to it.
			const at = backStack.indexOf(stepId);
			if (at !== -1) {
				setBackStack((prev) => prev.slice(0, at + 1));
				return true;
			}
			// Lenient mode also allows forward free-jump to any projected step —
			// adopt the projected route up to and including the target.
			if (navigation === 'lenient') {
				const projectedAt = projectedIds.indexOf(stepId);
				if (projectedAt !== -1) {
					setBackStack(projectedIds.slice(0, projectedAt + 1));
					return true;
				}
			}
			return false; // strict: no forward / cross-branch jumps
		},
		[backStack, navigation, projectedIds]
	);

	const submit = useCallback(async (): Promise<void> => {
		const ok = await validateCurrentStep();
		if (!ok) return;
		await store.submit((vals) => onSubmit(vals));
	}, [validateCurrentStep, store, onSubmit]);

	return {
		steps,
		path,
		current,
		invalidSteps,
		mountedStepIds: projectedIds,
		isFirstStep,
		isTerminalStep,
		canGoPrevious: !isFirstStep,
		canGoNext: !isTerminalStep,
		goNext,
		goPrevious,
		goTo,
		submit,
		progress: {
			current: projectedIds.indexOf(currentId) + 1,
			total: projectedIds.length,
		},
	};
}
