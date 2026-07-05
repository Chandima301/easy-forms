// Public types for the Pro branching wizard (`<AdvancedWizard>`).
//
// The free linear wizard (`@easy-forms/core`) walks a flat step array in order.
// The branching wizard adds declarative, per-step routing: each step decides its
// own successor from the current answers, so the taken path is a graph walk, not
// an index++. See `routing.ts` for the resolution semantics.

import type { Group } from '@easy-forms/core';

/**
 * One declarative routing rule on a step's `next`. Evaluated against the values
 * of `fieldNames` only (the subscription surface, mirroring `propsDependsOn`).
 * The first rule whose `when` returns true wins.
 */
export interface AdvancedWizardRoute {
	/** Field keys this route reads — the picked map passed to `when`. */
	fieldNames: string[];
	/** Return true to take this route. First satisfied route wins. */
	when: (values: Record<string, unknown>) => boolean;
	/** Target step id to advance to when this route is taken. */
	to: string;
}

export interface AdvancedWizardStep {
	id: string;
	title: string;
	description?: string;
	groups: Group[];
	/**
	 * Declarative routing on "next":
	 *   - omitted   → linear: the next step in array order (or terminal if last)
	 *   - string    → always advance to that step id
	 *   - Route[]   → first satisfied route wins; a trailing rule with
	 *                 `when: () => true` acts as the default/else. If none match,
	 *                 the step is terminal.
	 */
	next?: string | AdvancedWizardRoute[];
	/** Force this step to be terminal (submit shown) regardless of `next`. */
	terminal?: boolean;
	optional?: boolean;
}

export interface AdvancedWizardConfig {
	steps: AdvancedWizardStep[];
	/** Entry step id. Defaults to `steps[0].id`. */
	start?: string;
	/** Validate the active step's fields before advancing. Default true. */
	validateOnNext?: boolean;
	/**
	 * How validation errors gate navigation. Default `'strict'`.
	 *   - `'strict'`  — a step with errors blocks Next (the classic wizard).
	 *   - `'lenient'` — Next always advances; errors are still computed and
	 *     surfaced per-step (`errorCount` / `hasErrors`) for chips, the whole
	 *     projected path is freely jumpable, and the final `submit()` still
	 *     validates + blocks so every error surfaces at the last stage.
	 */
	navigation?: 'strict' | 'lenient';
}

/** Navigation-derived status for a step, consumed by the ejectable indicator. */
export type AdvancedWizardStepStatus =
	/** The step the user is currently on. */
	| 'active'
	/** Earlier in the taken path (visited, before current). */
	| 'completed'
	/** On the projected forward path from the current answers. */
	| 'upcoming'
	/** Not on the current projected path (a not-taken / abandoned branch). */
	| 'unreachable';

/** A configured step decorated with live navigation state. */
export interface AdvancedWizardStepState {
	id: string;
	title: string;
	description?: string;
	/** Position in `config.steps`. */
	index: number;
	status: AdvancedWizardStepStatus;
	isActive: boolean;
	/** In the taken back-stack. */
	isVisited: boolean;
	/** completed | active | upcoming. */
	isOnPath: boolean;
	/**
	 * Safe to jump to via `goTo`. In `'strict'` mode this is visited-only; in
	 * `'lenient'` mode any step on the projected path (forward or back) qualifies.
	 */
	canNavigateTo: boolean;
	/** Fields on this step currently in error (0 until the step is validated). */
	errorCount: number;
	/** `errorCount > 0` — drives an error chip in the step indicator. */
	hasErrors: boolean;
}

export interface UseAdvancedWizardResult {
	/** Every configured step, decorated with navigation state. */
	steps: AdvancedWizardStepState[];
	/** The progress path: completed + active + upcoming (what an indicator renders). */
	path: AdvancedWizardStepState[];
	/** The active step's state. */
	current: AdvancedWizardStepState;
	/** Step ids whose panels should be mounted (path ids) — off-path steps stay unmounted. */
	mountedStepIds: string[];
	/** Steps on the path currently in error — for a final-stage summary. */
	invalidSteps: AdvancedWizardStepState[];
	isFirstStep: boolean;
	/** True when the active step is terminal (show Submit, not Next). */
	isTerminalStep: boolean;
	canGoPrevious: boolean;
	canGoNext: boolean;
	/** Validate (gated) then advance along the resolved route. Resolves false if blocked/terminal. */
	goNext: () => Promise<boolean>;
	/** Pop back to the previous step (no validation). */
	goPrevious: () => void;
	/** Jump to a visited step (truncates the stack). No-op for non-visited steps. */
	goTo: (stepId: string) => Promise<boolean>;
	/** Validate the terminal step then submit through the store. */
	submit: () => Promise<void>;
	progress: { current: number; total: number };
}
