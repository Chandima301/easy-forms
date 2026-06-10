import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Form } from '../src/components/Form';
import { createFormStore } from '../src/store/createFormStore';
import type { CheckboxQuestion, FormSchema, NumberQuestion, TextQuestion } from '../src/types';
import type { RendererProps, RendererRegistry } from '../src/types/renderer';

function TextR(props: RendererProps<TextQuestion>) {
	return (
		<label>
			{props.question.label}
			<input
				aria-label={props.question.key}
				value={props.value ?? ''}
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
function NumberR(props: RendererProps<NumberQuestion>) {
	return (
		<input
			type="number"
			aria-label={props.question.key}
			value={props.value == null ? '' : String(props.value)}
			onChange={(e) => props.onChange(e.target.value === '' ? null : Number(e.target.value))}
			onBlur={props.onBlur}
		/>
	);
}
const registry: RendererRegistry = { text: TextR, checkbox: CheckboxR, number: NumberR };

beforeEach(() => {
	window.localStorage.clear();
});
afterEach(() => {
	window.localStorage.clear();
});

describe('Wizard', () => {
	it('renders the first step and navigates forward/back', async () => {
		const schema: FormSchema = {
			title: 'Wizard',
			groups: [],
			wizard: {
				steps: [
					{
						id: 's1',
						title: 'Step 1',
						groups: [
							{
								questions: [{ key: 'a', label: 'A', control: 'text' } as TextQuestion],
							},
						],
					},
					{
						id: 's2',
						title: 'Step 2',
						groups: [
							{
								questions: [{ key: 'b', label: 'B', control: 'text' } as TextQuestion],
							},
						],
					},
				],
			},
		};
		render(
			<Form
				schema={schema}
				registry={registry}
				initialValues={{ a: 'hi', b: '' }}
				onSubmit={async () => {}}
			/>
		);
		// Step 1 visible, step 2 hidden.
		expect(screen.getByLabelText('a').closest('[role=tabpanel]')?.getAttribute('aria-hidden')).toBe(
			'false'
		);
		await userEvent.click(screen.getByRole('button', { name: 'Next' }));
		// Step 2 now active.
		expect(screen.getByLabelText('b').closest('[role=tabpanel]')?.getAttribute('aria-hidden')).toBe(
			'false'
		);
		await userEvent.click(screen.getByRole('button', { name: 'Back' }));
		expect(screen.getByLabelText('a').closest('[role=tabpanel]')?.getAttribute('aria-hidden')).toBe(
			'false'
		);
	});

	it('blocks goNext when the current step has invalid fields', async () => {
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
						groups: [
							{
								questions: [{ key: 'b', label: 'B', control: 'text' } as TextQuestion],
							},
						],
					},
				],
			},
		};
		render(
			<Form
				schema={schema}
				registry={registry}
				initialValues={{ a: '', b: '' }}
				onSubmit={async () => {}}
			/>
		);
		await userEvent.click(screen.getByRole('button', { name: 'Next' }));
		// Should still be on step 1 because validation failed.
		expect(screen.getByTestId('err-a')).toHaveTextContent('This field is required');
		expect(screen.getByLabelText('a').closest('[role=tabpanel]')?.getAttribute('aria-hidden')).toBe(
			'false'
		);
	});

	it('preserves field values across steps', async () => {
		const store = createFormStore({ initialValues: { a: '', b: '' } });
		const schema: FormSchema = {
			groups: [],
			wizard: {
				steps: [
					{
						id: 's1',
						title: 'Step 1',
						groups: [
							{
								questions: [{ key: 'a', label: 'A', control: 'text' } as TextQuestion],
							},
						],
					},
					{
						id: 's2',
						title: 'Step 2',
						groups: [
							{
								questions: [{ key: 'b', label: 'B', control: 'text' } as TextQuestion],
							},
						],
					},
				],
			},
		};
		render(<Form schema={schema} registry={registry} store={store} onSubmit={async () => {}} />);
		await userEvent.type(screen.getByLabelText('a'), 'hello');
		await userEvent.click(screen.getByRole('button', { name: 'Next' }));
		await userEvent.click(screen.getByRole('button', { name: 'Back' }));
		// Step 1 still has the typed value (cross-step state preserved).
		expect((screen.getByLabelText('a') as HTMLInputElement).value).toBe('hello');
		expect(store.getValue('a')).toBe('hello');
	});

	it('skips hidden steps in forward navigation', async () => {
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
						// Hidden when `route` is false (via propsDependsOn).
						dependents: {
							propsDependsOn: [
								{
									fieldNames: ['route'],
									compute: (v) => ({ hidden: v.route !== true }),
								},
							],
						},
						groups: [
							{
								questions: [{ key: 'detour', label: 'Detour', control: 'text' } as TextQuestion],
							},
						],
					},
					{
						id: 's3',
						title: 'Step 3',
						groups: [
							{
								questions: [{ key: 'finish', label: 'Finish', control: 'text' } as TextQuestion],
							},
						],
					},
				],
			},
		};
		render(
			<Form
				schema={schema}
				registry={registry}
				initialValues={{ route: false, detour: '', finish: '' }}
				onSubmit={async () => {}}
			/>
		);
		// Step 2's tab should not appear in the indicator list.
		expect(screen.queryByRole('button', { name: 'Step 2' })).not.toBeInTheDocument();
		// goNext should skip step 2 and land on step 3.
		await userEvent.click(screen.getByRole('button', { name: 'Next' }));
		expect(screen.getByLabelText('finish')).toBeInTheDocument();
		expect(
			screen.getByLabelText('finish').closest('[role=tabpanel]')?.getAttribute('aria-hidden')
		).toBe('false');
	});

	it('persists state to localStorage and hydrates on remount', async () => {
		const schema: FormSchema = {
			groups: [],
			wizard: {
				persistKey: 'easy-forms-test-wizard',
				steps: [
					{
						id: 's1',
						title: 'Step 1',
						groups: [
							{
								questions: [{ key: 'a', label: 'A', control: 'text' } as TextQuestion],
							},
						],
					},
					{
						id: 's2',
						title: 'Step 2',
						groups: [
							{
								questions: [{ key: 'b', label: 'B', control: 'text' } as TextQuestion],
							},
						],
					},
				],
			},
		};
		const { unmount } = render(
			<Form
				schema={schema}
				registry={registry}
				initialValues={{ a: '', b: '' }}
				onSubmit={async () => {}}
			/>
		);
		await userEvent.type(screen.getByLabelText('a'), 'persist-me');
		await userEvent.click(screen.getByRole('button', { name: 'Next' }));
		// Wait for the debounce flush.
		await act(async () => {
			await new Promise((r) => setTimeout(r, 350));
		});
		const persisted = JSON.parse(window.localStorage.getItem('easy-forms-test-wizard') ?? '{}');
		expect(persisted.values.a).toBe('persist-me');
		expect(persisted.currentStepIndex).toBe(1);
		unmount();
		// Remount and verify hydration.
		render(
			<Form
				schema={schema}
				registry={registry}
				initialValues={{ a: '', b: '' }}
				onSubmit={async () => {}}
			/>
		);
		// Wait for hydration effect.
		await act(async () => {
			await Promise.resolve();
		});
		expect((screen.getByLabelText('a') as HTMLInputElement).value).toBe('persist-me');
	});
});
