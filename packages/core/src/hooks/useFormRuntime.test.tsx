import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Field } from '../components/Field';
import { RendererRegistryContext } from '../components/RegistryContext';
import { FormStoreProvider } from '../context/FormStoreProvider';
import type { FormPlugin } from '../plugins';
import { createFormStore } from '../store';
import type { CheckboxQuestion, TextQuestion } from '../types';
import type { RendererProps, RendererRegistry } from '../types/renderer';
import type { FormSchema } from '../types/schema';
import { useFormRuntime } from './useFormRuntime';

// Fields only take a value once they REGISTER, so every assertion here mounts the
// schema through `Field` rather than reading an unregistered key off the store.
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

const registry: RendererRegistry = { text: TextR, checkbox: CheckboxR };

const simpleSchema: FormSchema = {
	groups: [{ questions: [{ key: 'a', label: 'A', control: 'text' } as TextQuestion] }],
};

const dependentSchema: FormSchema = {
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

function Runtime({
	schema,
	initialValues,
	store: external,
	plugins,
}: {
	schema: FormSchema;
	initialValues?: Record<string, unknown>;
	store?: ReturnType<typeof createFormStore>;
	plugins?: FormPlugin[];
}) {
	const { store } = useFormRuntime(schema, { initialValues, store: external, plugins });
	return (
		<FormStoreProvider store={store}>
			<RendererRegistryContext.Provider value={registry}>
				{schema.groups.map((group, index) => (
					<div key={group.id ?? group.title ?? `root-${index}`}>
						{group.questions?.map((question) => (
							<Field key={question.key} question={question} />
						))}
					</div>
				))}
			</RendererRegistryContext.Provider>
		</FormStoreProvider>
	);
}

describe('useFormRuntime', () => {
	it('creates a store seeded with initialValues', () => {
		render(<Runtime schema={simpleSchema} initialValues={{ a: 'seed' }} />);
		expect(screen.getByLabelText('a')).toHaveValue('seed');
	});

	it('uses an external store when one is provided', () => {
		const external = createFormStore({ initialValues: { a: 'external' } });
		render(<Runtime schema={simpleSchema} initialValues={{ a: 'seed' }} store={external} />);
		expect(screen.getByLabelText('a')).toHaveValue('external');
		expect(external.getValues().a).toBe('external');
	});

	it('attaches the dependency engine, so propsDependsOn fires', async () => {
		const store = createFormStore({ initialValues: { subscribe: false, email: '' } });
		render(<Runtime schema={dependentSchema} store={store} />);
		await act(async () => {
			await Promise.resolve();
		});
		expect(store.getFieldState('email').runtimeOverrides.required).toBe(false);

		await userEvent.click(screen.getByLabelText('subscribe'));
		expect(store.getFieldState('email').runtimeOverrides.required).toBe(true);
	});

	it('attaches plugins', async () => {
		const seen: string[] = [];
		render(
			<Runtime
				schema={dependentSchema}
				plugins={[{ name: 'probe', onInit: () => seen.push('init') }]}
			/>
		);
		await act(async () => {
			await Promise.resolve();
		});
		expect(seen).toContain('init');
	});
});
