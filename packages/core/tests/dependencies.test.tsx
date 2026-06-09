// Tests for the 3 categorical dependency kinds:
//   - propsDependsOn (field + group)
//   - valueDependsOn
//   - resetDependsOn
// Plus group-cascade hidden, clearWhenHidden, and cycle detection.

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Form } from '../src/components/Form';
import {
	assertNoDependencyCycle,
	buildDependencyGraph,
	defaultDependencyHandlers,
} from '../src/dependencies';
import { createFormStore } from '../src/store/createFormStore';
import type {
	CheckboxQuestion,
	DateQuestion,
	DropdownQuestion,
	FormSchema,
	NumberQuestion,
	Option,
	TextQuestion,
} from '../src/types';
import type { RendererProps, RendererRegistry } from '../src/types/renderer';

// Tiny inline renderers.
function TextR(props: RendererProps<TextQuestion>) {
	return (
		<label>
			{props.question.label}
			<input
				aria-label={props.question.key}
				readOnly={!!props.question.readOnly}
				disabled={!!props.question.disabled}
				value={props.value ?? ''}
				onChange={(e) => props.onChange(e.target.value)}
				onBlur={props.onBlur}
			/>
			{props.error ? <span data-testid={`err-${props.question.key}`}>{props.error}</span> : null}
			{props.question.required ? <em data-testid={`req-${props.question.key}`}>*</em> : null}
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
				onBlur={props.onBlur}
			/>
		</label>
	);
}
function DropdownR(props: RendererProps<DropdownQuestion>) {
	const opts = (props.question.options as Option[] | undefined) ?? [];
	return (
		<label>
			{props.question.label}
			<select
				aria-label={props.question.key}
				value={props.value == null ? '' : String(props.value)}
				onChange={(e) => props.onChange(e.target.value || null)}
				onBlur={props.onBlur}
			>
				<option value="">(none)</option>
				{opts.map((opt) => (
					<option key={String(opt.value)} value={String(opt.value)}>
						{opt.label}
					</option>
				))}
			</select>
			<span data-testid={`placeholder-${props.question.key}`}>
				{props.question.placeholder ?? ''}
			</span>
		</label>
	);
}
function NumberR(props: RendererProps<NumberQuestion>) {
	return (
		<label>
			{props.question.label}
			<input
				type="number"
				aria-label={props.question.key}
				value={props.value == null ? '' : String(props.value)}
				onChange={(e) =>
					props.onChange(e.target.value === '' ? null : Number(e.target.value))
				}
				onBlur={props.onBlur}
			/>
		</label>
	);
}
function DateR(props: RendererProps<DateQuestion>) {
	return (
		<label>
			{props.question.label}
			<input
				type="date"
				aria-label={props.question.key}
				value={props.value ?? ''}
				min={typeof props.question.minDate === 'string' ? props.question.minDate : undefined}
				max={typeof props.question.maxDate === 'string' ? props.question.maxDate : undefined}
				onChange={(e) => props.onChange(e.target.value || null)}
				onBlur={props.onBlur}
			/>
		</label>
	);
}
const registry: RendererRegistry = {
	text: TextR,
	checkbox: CheckboxR,
	dropdown: DropdownR,
	number: NumberR,
	date: DateR,
};

// =============================================================================
// propsDependsOn — field-level
// =============================================================================

describe('propsDependsOn (field-level)', () => {
	it('sets `hidden` from a predicate over source fields', async () => {
		const schema: FormSchema = {
			groups: [
				{
					questions: [
						{ key: 'subscribe', label: 'Subscribe', control: 'checkbox' } as CheckboxQuestion,
						{
							key: 'email',
							label: 'Email',
							control: 'text',
							dependents: {
								propsDependsOn: [
									{
										fieldNames: ['subscribe'],
										compute: (v) => ({ hidden: v.subscribe !== true }),
									},
								],
							},
						} as TextQuestion,
					],
				},
			],
		};
		render(
			<Form
				schema={schema}
				registry={registry}
				initialValues={{ subscribe: false, email: '' }}
				onSubmit={async () => {}}
			/>
		);
		expect(screen.queryByLabelText('email')).not.toBeInTheDocument();
		await userEvent.click(screen.getByLabelText('subscribe'));
		expect(screen.getByLabelText('email')).toBeInTheDocument();
	});

	it('sets `required` and makes empty values fail validation', async () => {
		const store = createFormStore({ initialValues: { subscribe: true, email: '' } });
		const schema: FormSchema = {
			groups: [
				{
					questions: [
						{ key: 'subscribe', label: 'Subscribe', control: 'checkbox' } as CheckboxQuestion,
						{
							key: 'email',
							label: 'Email',
							control: 'text',
							dependents: {
								propsDependsOn: [
									{
										fieldNames: ['subscribe'],
										compute: (v) => ({ required: v.subscribe === true }),
									},
								],
							},
						} as TextQuestion,
					],
				},
			],
		};
		render(<Form schema={schema} registry={registry} store={store} onSubmit={async () => {}} />);
		await act(async () => {
			await Promise.resolve();
		});
		expect(store.getFieldState('email').runtimeOverrides.required).toBe(true);
		await act(async () => {
			await store.validateField('email');
		});
		expect(store.getFieldState('email').error).toBe('This field is required');
	});

	it('sets `readOnly` dynamically', async () => {
		const store = createFormStore({ initialValues: { lock: false } });
		const schema: FormSchema = {
			groups: [
				{
					questions: [
						{ key: 'lock', label: 'Lock', control: 'checkbox' } as CheckboxQuestion,
						{
							key: 'note',
							label: 'Note',
							control: 'text',
							dependents: {
								propsDependsOn: [
									{
										fieldNames: ['lock'],
										compute: (v) => ({ readOnly: v.lock === true }),
									},
								],
							},
						} as TextQuestion,
					],
				},
			],
		};
		render(<Form schema={schema} registry={registry} store={store} onSubmit={async () => {}} />);
		await userEvent.click(screen.getByLabelText('lock'));
		await act(async () => {
			await Promise.resolve();
		});
		expect(store.getFieldState('note').runtimeOverrides.readOnly).toBe(true);
	});

	it('sets `options` dynamically (cascading dropdown)', async () => {
		const STATES: Record<string, Option[]> = {
			us: [
				{ value: 'ca', label: 'CA' },
				{ value: 'ny', label: 'NY' },
			],
			lk: [{ value: 'wp', label: 'Western' }],
		};
		const store = createFormStore({ initialValues: { country: 'us', state: null } });
		const schema: FormSchema = {
			groups: [
				{
					questions: [
						{
							key: 'country',
							label: 'Country',
							control: 'dropdown',
							options: [
								{ value: 'us', label: 'US' },
								{ value: 'lk', label: 'LK' },
							],
						} as DropdownQuestion,
						{
							key: 'state',
							label: 'State',
							control: 'dropdown',
							options: [],
							dependents: {
								propsDependsOn: [
									{
										fieldNames: ['country'],
										compute: (v) => ({ options: STATES[v.country as string] ?? [] }),
									},
								],
							},
						} as DropdownQuestion,
					],
				},
			],
		};
		render(<Form schema={schema} registry={registry} store={store} onSubmit={async () => {}} />);
		await act(async () => {
			await Promise.resolve();
		});
		expect(store.getFieldState('state').runtimeOverrides.options).toEqual(STATES.us);
	});

	it('sets `minDate` / `maxDate` dynamically', async () => {
		const store = createFormStore({ initialValues: { start: '2025-06-01', end: null } });
		const schema: FormSchema = {
			groups: [
				{
					questions: [
						{ key: 'start', label: 'Start', control: 'date' } as DateQuestion,
						{
							key: 'end',
							label: 'End',
							control: 'date',
							dependents: {
								propsDependsOn: [
									{
										fieldNames: ['start'],
										compute: (v) => ({ minDate: v.start as string }),
									},
								],
							},
						} as DateQuestion,
					],
				},
			],
		};
		render(<Form schema={schema} registry={registry} store={store} onSubmit={async () => {}} />);
		await act(async () => {
			await Promise.resolve();
		});
		expect(store.getFieldState('end').runtimeOverrides.minDate).toBe('2025-06-01');
	});

	it('multiple rules compose; later rules overwrite earlier ones for the same prop', async () => {
		const store = createFormStore({ initialValues: { a: true, b: true } });
		const schema: FormSchema = {
			groups: [
				{
					questions: [
						{ key: 'a', label: 'A', control: 'checkbox' } as CheckboxQuestion,
						{ key: 'b', label: 'B', control: 'checkbox' } as CheckboxQuestion,
						{
							key: 'target',
							label: 'Target',
							control: 'text',
							dependents: {
								propsDependsOn: [
									{ fieldNames: ['a'], compute: (v) => ({ readOnly: v.a === true }) },
									{
										fieldNames: ['b'],
										compute: (v) => ({ readOnly: v.b !== true, placeholder: 'rule-2' }),
									},
								],
							},
						} as TextQuestion,
					],
				},
			],
		};
		render(<Form schema={schema} registry={registry} store={store} onSubmit={async () => {}} />);
		await act(async () => {
			await Promise.resolve();
		});
		// Rule 2 sets readOnly: !b. b is true → readOnly: false (rule 2 wins).
		expect(store.getFieldState('target').runtimeOverrides.readOnly).toBe(false);
		expect(store.getFieldState('target').runtimeOverrides.placeholder).toBe('rule-2');
	});

	it('clearWhenHidden resets the field on the false → true hide edge', async () => {
		const store = createFormStore({ initialValues: { show: true, email: 'a@b.co' } });
		const schema: FormSchema = {
			groups: [
				{
					questions: [
						{ key: 'show', label: 'Show', control: 'checkbox' } as CheckboxQuestion,
						{
							key: 'email',
							label: 'Email',
							control: 'text',
							clearWhenHidden: true,
							dependents: {
								propsDependsOn: [
									{
										fieldNames: ['show'],
										compute: (v) => ({ hidden: v.show !== true }),
									},
								],
							},
						} as TextQuestion,
					],
				},
			],
		};
		render(<Form schema={schema} registry={registry} store={store} onSubmit={async () => {}} />);
		// Toggle to hidden.
		await userEvent.click(screen.getByLabelText('show'));
		await act(async () => {
			await Promise.resolve();
		});
		// Value was reset to initial.
		expect(store.getFieldState('email').value).toBe('a@b.co');
		expect(store.getFieldState('email').dirty).toBe(false);
	});

	it('without clearWhenHidden, value is preserved on hide', async () => {
		const store = createFormStore({ initialValues: { show: true, email: 'a@b.co' } });
		const schema: FormSchema = {
			groups: [
				{
					questions: [
						{ key: 'show', label: 'Show', control: 'checkbox' } as CheckboxQuestion,
						{
							key: 'email',
							label: 'Email',
							control: 'text',
							dependents: {
								propsDependsOn: [
									{
										fieldNames: ['show'],
										compute: (v) => ({ hidden: v.show !== true }),
									},
								],
							},
						} as TextQuestion,
					],
				},
			],
		};
		render(<Form schema={schema} registry={registry} store={store} onSubmit={async () => {}} />);
		// Mutate value, then hide.
		await act(async () => {
			store.setValue('email', 'changed', { validate: false });
		});
		await userEvent.click(screen.getByLabelText('show'));
		await act(async () => {
			await Promise.resolve();
		});
		// Hidden, but stored value preserved.
		expect(store.getFieldState('email').value).toBe('changed');
	});
});

// =============================================================================
// propsDependsOn — group-level
// =============================================================================

describe('propsDependsOn (group-level)', () => {
	it('hides a whole group; descendant fields excluded from getValues but state preserved', async () => {
		const store = createFormStore({ initialValues: { show: true, a: 'A', b: 'B' } });
		const schema: FormSchema = {
			groups: [
				{
					questions: [
						{ key: 'show', label: 'Show', control: 'checkbox' } as CheckboxQuestion,
					],
				},
				{
					id: 'panel',
					title: 'Panel',
					dependents: {
						propsDependsOn: [
							{
								fieldNames: ['show'],
								compute: (v) => ({ hidden: v.show !== true }),
							},
						],
					},
					questions: [
						{ key: 'a', label: 'A', control: 'text' } as TextQuestion,
						{ key: 'b', label: 'B', control: 'text' } as TextQuestion,
					],
				},
			],
		};
		render(<Form schema={schema} registry={registry} store={store} onSubmit={async () => {}} />);
		// Initially visible.
		expect(store.getValues()).toEqual({ show: true, a: 'A', b: 'B' });
		// Toggle group hidden.
		await userEvent.click(screen.getByLabelText('show'));
		await act(async () => {
			await Promise.resolve();
		});
		expect(store.getValues()).toEqual({ show: false });
		// But the underlying state survives (CSS-hide preserves it).
		expect(store.getFieldState('a').value).toBe('A');
		expect(store.getFieldState('b').value).toBe('B');
		// Show again — values still there.
		await userEvent.click(screen.getByLabelText('show'));
		await act(async () => {
			await Promise.resolve();
		});
		expect(store.getValues()).toEqual({ show: true, a: 'A', b: 'B' });
	});

	it('group `clearWhenHidden: true` resets every descendant on the rising edge', async () => {
		const store = createFormStore({ initialValues: { show: true, a: 'init-a', b: 'init-b' } });
		const schema: FormSchema = {
			groups: [
				{
					questions: [
						{ key: 'show', label: 'Show', control: 'checkbox' } as CheckboxQuestion,
					],
				},
				{
					id: 'panel',
					title: 'Panel',
					clearWhenHidden: true,
					dependents: {
						propsDependsOn: [
							{
								fieldNames: ['show'],
								compute: (v) => ({ hidden: v.show !== true }),
							},
						],
					},
					questions: [
						{ key: 'a', label: 'A', control: 'text' } as TextQuestion,
						{ key: 'b', label: 'B', control: 'text' } as TextQuestion,
					],
				},
			],
		};
		render(<Form schema={schema} registry={registry} store={store} onSubmit={async () => {}} />);
		// Mutate before hiding.
		await act(async () => {
			store.setValue('a', 'mutated', { validate: false });
			store.setValue('b', 'mutated', { validate: false });
		});
		// Hide the group → cascade reset to initials.
		await userEvent.click(screen.getByLabelText('show'));
		await act(async () => {
			await Promise.resolve();
		});
		expect(store.getFieldState('a').value).toBe('init-a');
		expect(store.getFieldState('b').value).toBe('init-b');
	});
});

// =============================================================================
// valueDependsOn
// =============================================================================

describe('valueDependsOn', () => {
	it('derives a value and re-runs on source change', async () => {
		const store = createFormStore({ initialValues: { price: 10, taxRate: 0.1, total: 0 } });
		const schema: FormSchema = {
			groups: [
				{
					questions: [
						{ key: 'price', label: 'Price', control: 'number' } as NumberQuestion,
						{ key: 'taxRate', label: 'Tax', control: 'number' } as NumberQuestion,
						{
							key: 'total',
							label: 'Total',
							control: 'number',
							dependents: {
								valueDependsOn: {
									fieldNames: ['price', 'taxRate'],
									compute: (v) => {
										const price = (v.price as number | null) ?? 0;
										const rate = (v.taxRate as number | null) ?? 0;
										return price * (1 + rate);
									},
								},
							},
						} as NumberQuestion,
					],
				},
			],
		};
		render(<Form schema={schema} registry={registry} store={store} onSubmit={async () => {}} />);
		await act(async () => {
			await Promise.resolve();
		});
		expect(store.getFieldState('total').value).toBeCloseTo(11);
		await act(async () => {
			store.setValue('price', 20);
			await Promise.resolve();
		});
		expect(store.getFieldState('total').value).toBeCloseTo(22);
	});

	it('derived values do not flip isDirty', async () => {
		const store = createFormStore({ initialValues: { a: 1, b: 0 } });
		const schema: FormSchema = {
			groups: [
				{
					questions: [
						{ key: 'a', label: 'A', control: 'number' } as NumberQuestion,
						{
							key: 'b',
							label: 'B',
							control: 'number',
							dependents: {
								valueDependsOn: {
									fieldNames: ['a'],
									compute: (v) => ((v.a as number | null) ?? 0) * 2,
								},
							},
						} as NumberQuestion,
					],
				},
			],
		};
		render(<Form schema={schema} registry={registry} store={store} onSubmit={async () => {}} />);
		await act(async () => {
			await Promise.resolve();
		});
		expect(store.getDerived().isDirty).toBe(false);
	});
});

// =============================================================================
// resetDependsOn
// =============================================================================

describe('resetDependsOn', () => {
	it('resets target on the false → true edge of `when`', async () => {
		const store = createFormStore({ initialValues: { trigger: false, name: 'init' } });
		const schema: FormSchema = {
			groups: [
				{
					questions: [
						{ key: 'trigger', label: 'Trigger', control: 'checkbox' } as CheckboxQuestion,
						{
							key: 'name',
							label: 'Name',
							control: 'text',
							dependents: {
								resetDependsOn: {
									fieldNames: ['trigger'],
									when: (v) => v.trigger === true,
								},
							},
						} as TextQuestion,
					],
				},
			],
		};
		render(<Form schema={schema} registry={registry} store={store} onSubmit={async () => {}} />);
		// Mutate, then trigger reset.
		await act(async () => {
			store.setValue('name', 'changed', { validate: false });
		});
		expect(store.getFieldState('name').value).toBe('changed');
		await userEvent.click(screen.getByLabelText('trigger'));
		await act(async () => {
			await Promise.resolve();
		});
		expect(store.getFieldState('name').value).toBe('init');
	});

	it('does not re-fire while `when` stays true (no stable-true reset)', async () => {
		const store = createFormStore({ initialValues: { trigger: true, name: 'init' } });
		const schema: FormSchema = {
			groups: [
				{
					questions: [
						{ key: 'trigger', label: 'Trigger', control: 'checkbox' } as CheckboxQuestion,
						{
							key: 'name',
							label: 'Name',
							control: 'text',
							dependents: {
								resetDependsOn: {
									fieldNames: ['trigger'],
									when: (v) => v.trigger === true,
								},
							},
						} as TextQuestion,
					],
				},
			],
		};
		render(<Form schema={schema} registry={registry} store={store} onSubmit={async () => {}} />);
		await act(async () => {
			await Promise.resolve();
		});
		// Mutate while `when` is true; should not re-reset on subsequent changes.
		await act(async () => {
			store.setValue('name', 'changed', { validate: false });
		});
		expect(store.getFieldState('name').value).toBe('changed');
	});
});

// =============================================================================
// Cycle detection (field + group)
// =============================================================================

describe('cycle detection', () => {
	it('throws when two fields mutually `valueDependsOn` each other', () => {
		const schema: FormSchema = {
			groups: [
				{
					questions: [
						{
							key: 'a',
							label: 'A',
							control: 'number',
							dependents: {
								valueDependsOn: {
									fieldNames: ['b'],
									compute: (v) => ((v.b as number | null) ?? 0) + 1,
								},
							},
						} as NumberQuestion,
						{
							key: 'b',
							label: 'B',
							control: 'number',
							dependents: {
								valueDependsOn: {
									fieldNames: ['a'],
									compute: (v) => ((v.a as number | null) ?? 0) + 1,
								},
							},
						} as NumberQuestion,
					],
				},
			],
		};
		const graph = buildDependencyGraph(schema, defaultDependencyHandlers);
		expect(() => assertNoDependencyCycle(graph)).toThrowError(/dependency cycle/i);
	});

	it('allows a benign one-way chain', () => {
		const schema: FormSchema = {
			groups: [
				{
					questions: [
						{ key: 'a', label: 'A', control: 'number' } as NumberQuestion,
						{
							key: 'b',
							label: 'B',
							control: 'number',
							dependents: {
								valueDependsOn: {
									fieldNames: ['a'],
									compute: (v) => ((v.a as number | null) ?? 0) * 2,
								},
							},
						} as NumberQuestion,
					],
				},
			],
		};
		const graph = buildDependencyGraph(schema, defaultDependencyHandlers);
		expect(() => assertNoDependencyCycle(graph)).not.toThrow();
	});
});

// =============================================================================
// Missing group id
// =============================================================================

describe('schema integrity', () => {
	it('throws when a group with `dependents` is missing `id`', () => {
		const schema: FormSchema = {
			groups: [
				{
					// no id
					title: 'Bad group',
					dependents: {
						propsDependsOn: [
							{ fieldNames: [], compute: () => ({ hidden: false }) },
						],
					},
					questions: [],
				},
			],
		};
		expect(() => buildDependencyGraph(schema, defaultDependencyHandlers)).toThrow(/missing `id`/);
	});
});
