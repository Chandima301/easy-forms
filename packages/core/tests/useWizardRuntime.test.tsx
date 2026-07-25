// Tests for `useWizardRuntime` — the wizard state machine extracted from the
// deleted `<Wizard>` component (pre-commit 843696a). Ported from the deleted
// `tests/wizard.test.tsx`, which drove the same behavior through Next/Back
// buttons; here we call the hook's returned `WizardContextValue` directly via
// `renderWizard` (see `helpers/renderForm.tsx`) since core no longer renders
// any chrome to click.

import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFormStore } from '../src/store/createFormStore';
import type { CheckboxQuestion, FormSchema, TextQuestion } from '../src/types';
import type { RendererProps, RendererRegistry } from '../src/types/renderer';
import type { WizardConfig } from '../src/types/schema';
import { renderWizard } from './helpers/renderForm';

// Tiny inline renderers (same shape as the deleted wizard.test.tsx used).
function TextR(props: RendererProps<TextQuestion>) {
	return (
		<label>
			{props.question.label}
			<input
				aria-label={props.question.key}
				value={(props.value as string) ?? ''}
				onChange={(e) => props.onChange(e.target.value)}
				onBlur={props.onBlur}
			/>
			{props.error ? <span data-testid={`err-${props.question.key}`}>{props.error}</span> : null}
		</label>
	);
}
function CheckboxR(props: RendererProps<CheckboxQuestion>) {
	return (
		<label>
			{props.question.label}
			<input
				type="checkbox"
				aria-label={props.question.key}
				checked={!!props.value}
				onChange={(e) => props.onChange(e.target.checked)}
			/>
		</label>
	);
}
const registry: RendererRegistry = { text: TextR, checkbox: CheckboxR };

beforeEach(() => {
	window.localStorage.clear();
});
afterEach(() => {
	window.localStorage.clear();
});

const twoStepWizard: WizardConfig = {
	steps: [
		{
			id: 's1',
			title: 'Step 1',
			groups: [{ questions: [{ key: 'a', label: 'A', control: 'text' } as TextQuestion] }],
		},
		{
			id: 's2',
			title: 'Step 2',
			groups: [{ questions: [{ key: 'b', label: 'B', control: 'text' } as TextQuestion] }],
		},
	],
};

const requiredFirstStepWizard: WizardConfig = {
	steps: [
		{
			id: 's1',
			title: 'Step 1',
			groups: [
				{
					questions: [
						{
							key: 'a',
							label: 'A',
							control: 'text',
							validators: { required: true },
						} as TextQuestion,
					],
				},
			],
		},
		{
			id: 's2',
			title: 'Step 2',
			groups: [{ questions: [{ key: 'b', label: 'B', control: 'text' } as TextQuestion] }],
		},
	],
};

describe('useWizardRuntime', () => {
	it('selects the first step on mount', () => {
		const { getContext } = renderWizard({
			wizard: twoStepWizard,
			registry,
			initialValues: { a: '', b: '' },
			onSubmit: async () => {},
		});
		const ctx = getContext();
		expect(ctx.state.currentStepIndex).toBe(0);
		expect(ctx.step.id).toBe('s1');
		expect(ctx.isFirstVisibleStep).toBe(true);
		expect(ctx.isLastVisibleStep).toBe(false);
	});

	it('goNext advances to the next step and marks it visited', async () => {
		const { getContext } = renderWizard({
			wizard: twoStepWizard,
			registry,
			initialValues: { a: 'hi', b: '' },
			onSubmit: async () => {},
		});
		await act(async () => {
			const ok = await getContext().goNext();
			expect(ok).toBe(true);
		});
		const ctx = getContext();
		expect(ctx.state.currentStepIndex).toBe(1);
		expect(ctx.step.id).toBe('s2');
		expect(ctx.state.visitedSteps.has(1)).toBe(true);
		expect(ctx.isLastVisibleStep).toBe(true);
	});

	it('blocks goNext when the current step has invalid required fields', async () => {
		const { getContext } = renderWizard({
			wizard: requiredFirstStepWizard,
			registry,
			initialValues: { a: '', b: '' },
			onSubmit: async () => {},
		});
		await act(async () => {
			const ok = await getContext().goNext();
			expect(ok).toBe(false);
		});
		const ctx = getContext();
		expect(ctx.state.currentStepIndex).toBe(0);
		expect(ctx.step.id).toBe('s1');
		expect(screen.getByTestId('err-a')).toHaveTextContent('This field is required');
	});

	it('allows goNext past an invalid step when validateOnNext is false', async () => {
		const wizard: WizardConfig = { ...requiredFirstStepWizard, validateOnNext: false };
		const { getContext } = renderWizard({
			wizard,
			registry,
			initialValues: { a: '', b: '' },
			onSubmit: async () => {},
		});
		await act(async () => {
			const ok = await getContext().goNext();
			expect(ok).toBe(true);
		});
		expect(getContext().state.currentStepIndex).toBe(1);
	});

	it('goPrevious moves back a step without validating', async () => {
		const { getContext } = renderWizard({
			wizard: twoStepWizard,
			registry,
			initialValues: { a: 'hi', b: '' },
			onSubmit: async () => {},
		});
		await act(async () => {
			await getContext().goNext();
		});
		expect(getContext().state.currentStepIndex).toBe(1);
		act(() => {
			getContext().goPrevious();
		});
		const ctx = getContext();
		expect(ctx.state.currentStepIndex).toBe(0);
		expect(ctx.step.id).toBe('s1');
	});

	it('goTo refuses a non-visible step index', async () => {
		const { getContext } = renderWizard({
			wizard: twoStepWizard,
			registry,
			initialValues: { a: 'hi', b: '' },
			onSubmit: async () => {},
		});
		await act(async () => {
			const ok = await getContext().goTo(5);
			expect(ok).toBe(false);
		});
		expect(getContext().state.currentStepIndex).toBe(0);
	});

	it('goTo validates the current step on forward jumps', async () => {
		const { getContext } = renderWizard({
			wizard: requiredFirstStepWizard,
			registry,
			initialValues: { a: '', b: '' },
			onSubmit: async () => {},
		});
		await act(async () => {
			const ok = await getContext().goTo(1);
			expect(ok).toBe(false);
		});
		expect(getContext().state.currentStepIndex).toBe(0);
	});

	it('skips hidden steps in forward navigation via isStepVisible', async () => {
		const schema: FormSchema = {
			groups: [],
			wizard: {
				steps: [
					{
						id: 's1',
						title: 'Step 1',
						groups: [
							{
								questions: [
									{ key: 'route', label: 'Route', control: 'checkbox' } as CheckboxQuestion,
								],
							},
						],
					},
					{
						id: 's2',
						title: 'Step 2',
						// Hidden when `route` is false (step-level propsDependsOn).
						dependents: {
							propsDependsOn: [
								{
									fieldNames: ['route'],
									compute: (v: Record<string, unknown>) => ({ hidden: v.route !== true }),
								},
							],
						},
						groups: [
							{ questions: [{ key: 'detour', label: 'Detour', control: 'text' } as TextQuestion] },
						],
					},
					{
						id: 's3',
						title: 'Step 3',
						groups: [
							{ questions: [{ key: 'finish', label: 'Finish', control: 'text' } as TextQuestion] },
						],
					},
				],
			},
		};
		const { getContext } = renderWizard({
			wizard: schema.wizard as WizardConfig,
			registry,
			initialValues: { route: false, detour: '', finish: '' },
			onSubmit: async () => {},
		});
		expect(getContext().state.visibleStepIndices).toEqual([0, 2]);
		await act(async () => {
			const ok = await getContext().goNext();
			expect(ok).toBe(true);
		});
		const ctx = getContext();
		expect(ctx.step.id).toBe('s3');
		expect(ctx.state.currentStepIndex).toBe(2);
	});

	it('submit validates the current step, calls onSubmit, and clears the persisted key', async () => {
		let submitted: Record<string, unknown> | null = null;
		const wizard: WizardConfig = { ...twoStepWizard, persistKey: 'easy-forms-test-submit' };
		window.localStorage.setItem(
			'easy-forms-test-submit',
			JSON.stringify({ values: { a: 'hi', b: '' }, currentStepIndex: 1 })
		);
		const { getContext } = renderWizard({
			wizard,
			registry,
			initialValues: { a: 'hi', b: '' },
			onSubmit: async (values) => {
				submitted = values;
			},
		});
		// Hydration lands us on step 1 (last step) — submit from there.
		await act(async () => {
			await Promise.resolve();
		});
		expect(getContext().state.currentStepIndex).toBe(1);
		await act(async () => {
			await getContext().submit();
		});
		expect(submitted).toEqual({ a: 'hi', b: '' });
		expect(window.localStorage.getItem('easy-forms-test-submit')).toBeNull();
	});

	it('submit is blocked when the current step is invalid', async () => {
		let submitted = false;
		const wizard: WizardConfig = {
			steps: [
				{
					id: 's1',
					title: 'Step 1',
					groups: [
						{
							questions: [
								{
									key: 'a',
									label: 'A',
									control: 'text',
									validators: { required: true },
								} as TextQuestion,
							],
						},
					],
				},
			],
		};
		const { getContext } = renderWizard({
			wizard,
			registry,
			initialValues: { a: '' },
			onSubmit: async () => {
				submitted = true;
			},
		});
		await act(async () => {
			await getContext().submit();
		});
		expect(submitted).toBe(false);
	});

	it('debounced-persists { values, currentStepIndex } to localStorage on step change', async () => {
		const wizard: WizardConfig = { ...twoStepWizard, persistKey: 'easy-forms-test-persist-write' };
		const { getContext } = renderWizard({
			wizard,
			registry,
			initialValues: { a: '', b: '' },
			onSubmit: async () => {},
		});
		await userEvent.type(screen.getByLabelText('a'), 'persist-me');
		await act(async () => {
			const ok = await getContext().goNext();
			expect(ok).toBe(true);
		});
		// createDebouncedSaver's default delay is 250ms — wait past it to flush.
		await act(async () => {
			await new Promise((r) => setTimeout(r, 350));
		});
		const persisted = JSON.parse(
			window.localStorage.getItem('easy-forms-test-persist-write') ?? '{}'
		);
		expect(persisted.values.a).toBe('persist-me');
		expect(persisted.currentStepIndex).toBe(1);
	});

	it('hydrates persisted { values, currentStepIndex } on mount', async () => {
		window.localStorage.setItem(
			'easy-forms-test-hydrate',
			JSON.stringify({ values: { a: 'persist-me', b: '' }, currentStepIndex: 1 })
		);
		const store = createFormStore({ initialValues: { a: '', b: '' } });
		const wizard: WizardConfig = { ...twoStepWizard, persistKey: 'easy-forms-test-hydrate' };
		const { getContext } = renderWizard({
			wizard,
			registry,
			store,
			onSubmit: async () => {},
		});
		await act(async () => {
			await Promise.resolve();
		});
		const ctx = getContext();
		expect(ctx.state.currentStepIndex).toBe(1);
		expect(ctx.state.visitedSteps.has(1)).toBe(true);
		expect(store.getValue('a')).toBe('persist-me');
	});
});
