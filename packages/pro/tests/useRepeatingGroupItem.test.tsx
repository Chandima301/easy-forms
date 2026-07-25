import {
	Field,
	type FormStore,
	FormStoreProvider,
	type Group,
	type GroupRendererProps,
	type RendererProps,
	type RendererRegistry,
	RendererRegistryContext,
	type TextQuestion,
	createFormStore,
	useGroup,
} from '@easy-forms/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
	type UseRepeatingGroupItemOptions,
	useRepeatingGroupItem,
} from '../src/hooks/useRepeatingGroupItem';

function TextRenderer({ question, value, onChange }: RendererProps<TextQuestion>) {
	return (
		<input
			aria-label={question.label}
			readOnly={!!question.readOnly}
			value={(value as string) ?? ''}
			onChange={(e) => onChange(e.target.value)}
		/>
	);
}

const registry: RendererRegistry = { text: TextRenderer };

// Same recursive stub the other pro suites define — walks questions + nested groups.
function StubGroupRenderer({ group, depth = 0 }: GroupRendererProps) {
	const overrides = useGroup(group.id);
	const hidden = overrides.hidden === true;
	if (hidden) return null;
	return (
		<div data-depth={depth}>
			{group.questions?.map((question) => (
				<Field key={question.key} question={question} />
			))}
			{(group as Group).groups?.map((child, index) => (
				<StubGroupRenderer
					key={child.id ?? child.title ?? `group-${depth}-${index}`}
					group={child}
					depth={depth + 1}
				/>
			))}
		</div>
	);
}

// A row must be a component: hooks cannot be called inside a `.map()` callback.
// This mirrors the `<Row>` the ejected repeating-group renderer defines.
function Row({ groupKey, index, groups, defaultItem }: UseRepeatingGroupItemOptions) {
	const { groups: prefixed } = useRepeatingGroupItem({ groupKey, index, groups, defaultItem });
	return (
		<>
			{prefixed.map((g, i) => (
				<StubGroupRenderer key={g.id ?? g.title ?? `row-${index}-${i}`} group={g} />
			))}
		</>
	);
}

function Harness({
	store,
	groups,
	indices = [0],
	rootQuestions,
}: {
	store: FormStore;
	groups: Group[];
	indices?: number[];
	rootQuestions?: TextQuestion[];
}) {
	return (
		<FormStoreProvider store={store}>
			<RendererRegistryContext.Provider value={registry}>
				{rootQuestions?.map((q) => (
					<Field key={q.key} question={q} />
				))}
				{indices.map((index) => (
					<Row key={index} groupKey="items" index={index} groups={groups} />
				))}
			</RendererRegistryContext.Provider>
		</FormStoreProvider>
	);
}

const plainGroups: Group[] = [
	{ questions: [{ key: 'label', label: 'Label', control: 'text' } as TextQuestion] },
];

// `note` reacts to its own row's `trigger` — a within-row dependency.
const dependentGroups: Group[] = [
	{
		questions: [
			{ key: 'trigger', label: 'Trigger', control: 'text' } as TextQuestion,
			{
				key: 'note',
				label: 'Note',
				control: 'text',
				dependents: {
					propsDependsOn: [
						{
							fieldNames: ['trigger'],
							compute: (v: Record<string, unknown>) => ({ readOnly: v.trigger === 'lock' }),
						},
					],
				},
			} as unknown as TextQuestion,
		],
	},
];

describe('useRepeatingGroupItem', () => {
	it('prefixes every row key with `${groupKey}.${index}.`', async () => {
		const user = userEvent.setup();
		const store = createFormStore();
		render(<Harness store={store} groups={plainGroups} />);

		await user.type(screen.getByLabelText('Label'), 'Checking');
		expect(store.getValues()['items.0.label']).toBe('Checking');
		expect(store.getNestedValues()).toMatchObject({ items: [{ label: 'Checking' }] });
	});

	it('fires a within-row dependency', async () => {
		const user = userEvent.setup();
		const store = createFormStore();
		render(<Harness store={store} groups={dependentGroups} />);

		expect(store.getFieldState('items.0.note').runtimeOverrides.readOnly).toBe(false);
		await user.type(screen.getByLabelText('Trigger'), 'lock');
		expect(store.getFieldState('items.0.note').runtimeOverrides.readOnly).toBe(true);
	});

	it('keeps rows isolated — row 0 changes do not touch row 1', async () => {
		const user = userEvent.setup();
		const store = createFormStore();
		render(<Harness store={store} groups={dependentGroups} indices={[0, 1]} />);

		const [row0Trigger] = screen.getAllByLabelText('Trigger');
		if (!row0Trigger) throw new Error('expected a row-0 trigger input');
		await user.type(row0Trigger, 'lock');

		expect(store.getFieldState('items.0.note').runtimeOverrides.readOnly).toBe(true);
		expect(store.getFieldState('items.1.note').runtimeOverrides.readOnly).toBe(false);
	});
});
