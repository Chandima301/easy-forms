import {
	ChromeRegistryContext,
	Field,
	type FormSchema,
	FormStoreProvider,
	type Group,
	type GroupRendererProps,
	type Question,
	type RendererProps,
	type RendererRegistry,
	RendererRegistryContext,
	type TextQuestion,
	attachDependencyEngine,
	createFormStore,
	defaultDependencyHandlers,
	useGroup,
} from '@easy-forms/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useMemo } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/license/setEasyFormsProLicense', () => ({
	getLicenseStatus: vi.fn(),
}));

import { RepeatingGroupItem } from '../src/components/RepeatingGroupItem';
import type { RepeatingGroupQuestion } from '../src/controls/repeatingGroup';
import '../src/controls/repeatingGroup'; // loads the `repeatingGroup` control augmentation
import { useRepeatingGroup } from '../src/hooks/useRepeatingGroup';
import { resetWarningsForTests } from '../src/license/assertLicensed';
import { getLicenseStatus } from '../src/license/setEasyFormsProLicense';

// The ejectable registry renderer lives in @easy-forms/registry, so it is not
// importable here. This in-file harness mirrors it exactly (hook + item + markup)
// so these tests exercise the same Pro contract the ejected renderer relies on.
function RepeatingGroupRenderer(props: RendererProps<RepeatingGroupQuestion>) {
	const { question } = props;
	const { indices, add, remove, atMax, canRemove } = useRepeatingGroup(props);
	const addLabel = question.addLabel ?? 'Add';
	const removeLabel = question.removeLabel ?? 'Remove';
	const itemLabel = question.itemLabel;

	return (
		<div className="easy-forms-repeat" data-control="repeatingGroup">
			{question.label ? <div className="easy-forms-repeat__header">{question.label}</div> : null}
			{indices.map((index, position) => (
				<div className="easy-forms-repeat__item" data-index={index} key={index}>
					{itemLabel ? (
						<div className="easy-forms-repeat__item-header">{itemLabel(position)}</div>
					) : null}
					<RepeatingGroupItem
						groupKey={question.key}
						index={index}
						groups={question.groups}
						defaultItem={question.defaultItem}
					/>
					{canRemove ? (
						<button
							type="button"
							className="easy-forms-repeat__remove"
							onClick={() => remove(index)}
						>
							{removeLabel}
						</button>
					) : null}
				</div>
			))}
			<button type="button" className="easy-forms-repeat__add" onClick={add} disabled={atMax}>
				{addLabel}
			</button>
		</div>
	);
}

const statusMock = vi.mocked(getLicenseStatus);
const ORIGINAL_ENV = process.env.NODE_ENV;
const licensed = {
	valid: true as const,
	claims: { customer: 'Acme', edition: 'pro' as const, seats: 1, iat: 0, exp: 9e9 },
};
const unlicensed = { valid: false as const, reason: 'missing' as const };

// Minimal text input renderer so item fields are interactive in tests.
function TextRenderer({ question, value, onChange }: RendererProps<TextQuestion>) {
	return (
		<input
			aria-label={question.label}
			value={(value as string) ?? ''}
			onChange={(e) => onChange(e.target.value)}
		/>
	);
}

const registry: RendererRegistry = {
	text: TextRenderer,
	repeatingGroup: RepeatingGroupRenderer,
};

// A plain declarative `repeatingGroup` question — no factory.
function buildSchema(overrides: Record<string, unknown> = {}): FormSchema {
	const question = {
		key: 'bankAccounts',
		label: 'Bank accounts',
		control: 'repeatingGroup',
		minItems: 1,
		maxItems: 3,
		addLabel: 'Add account',
		removeLabel: 'Remove',
		groups: [{ questions: [{ key: 'currency', label: 'Currency', control: 'text' }] }],
		...overrides,
	} as unknown as Question;
	return { groups: [{ id: 'root', questions: [question] }] };
}

// Stand-in for the ejectable registry's GroupRenderer (core no longer ships
// rendered chrome; it's injected via ChromeRegistryContext). Mirrors the
// deleted core GroupRenderer closely enough to exercise real field/group
// rendering: walks questions + nested groups recursively.
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

// Stand-in for core's deleted <Form>: creates a store, attaches the dependency
// engine (mirroring <Form>'s own useEffect timing), provides the renderer +
// chrome registries, and wires a plain submit button through `store.submit`.
function FormHarness({
	schema,
	registry: rendererRegistry,
	onSubmit,
}: {
	schema: FormSchema;
	registry: RendererRegistry;
	onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
}) {
	const store = useMemo(() => createFormStore(), []);

	useEffect(() => {
		const attached = attachDependencyEngine(store, schema, defaultDependencyHandlers);
		return attached.detach;
	}, [store, schema]);

	return (
		<FormStoreProvider store={store}>
			<RendererRegistryContext.Provider value={rendererRegistry}>
				<ChromeRegistryContext.Provider value={{ GroupRenderer: StubGroupRenderer }}>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							void store.submit((values) => onSubmit(values));
						}}
					>
						{schema.groups.map((group, index) => (
							<StubGroupRenderer key={group.id ?? group.title ?? `root-${index}`} group={group} />
						))}
						<button type="submit">Submit</button>
					</form>
				</ChromeRegistryContext.Provider>
			</RendererRegistryContext.Provider>
		</FormStoreProvider>
	);
}

function renderForm(schema: FormSchema, onSubmit = vi.fn()) {
	render(<FormHarness schema={schema} registry={registry} onSubmit={onSubmit} />);
	return onSubmit;
}

beforeEach(() => {
	resetWarningsForTests();
	statusMock.mockReset();
	statusMock.mockReturnValue(licensed);
	vi.spyOn(console, 'warn').mockImplementation(() => {});
	process.env.NODE_ENV = 'development';
});

afterEach(() => {
	process.env.NODE_ENV = ORIGINAL_ENV;
	vi.restoreAllMocks();
});

describe('useRepeatingGroup + RepeatingGroupItem', () => {
	it('seeds minItems rows on mount', () => {
		renderForm(buildSchema({ minItems: 2 }));
		expect(screen.getAllByLabelText('Currency')).toHaveLength(2);
	});

	it('adds a row when the add button is clicked', async () => {
		const user = userEvent.setup();
		renderForm(buildSchema());
		expect(screen.getAllByLabelText('Currency')).toHaveLength(1);
		await user.click(screen.getByRole('button', { name: 'Add account' }));
		expect(screen.getAllByLabelText('Currency')).toHaveLength(2);
	});

	it('disables the add button at maxItems', async () => {
		const user = userEvent.setup();
		renderForm(buildSchema({ minItems: 1, maxItems: 2 }));
		await user.click(screen.getByRole('button', { name: 'Add account' }));
		expect(screen.getByRole('button', { name: 'Add account' })).toBeDisabled();
		expect(screen.getAllByLabelText('Currency')).toHaveLength(2);
	});

	it('removes a row and hides remove at minItems', async () => {
		const user = userEvent.setup();
		renderForm(buildSchema({ minItems: 1, maxItems: 3 }));
		await user.click(screen.getByRole('button', { name: 'Add account' }));
		expect(screen.getAllByLabelText('Currency')).toHaveLength(2);
		const [firstRemove] = screen.getAllByRole('button', { name: 'Remove' });
		if (!firstRemove) throw new Error('expected a remove button');
		await user.click(firstRemove);
		expect(screen.getAllByLabelText('Currency')).toHaveLength(1);
		// At minItems (1), no remove button is offered.
		expect(screen.queryByRole('button', { name: 'Remove' })).toBeNull();
	});

	it('preserves surviving rows when a middle row is removed', async () => {
		const user = userEvent.setup();
		const onSubmit = renderForm(buildSchema({ minItems: 1, maxItems: 3 }));
		await user.click(screen.getByRole('button', { name: 'Add account' }));
		await user.click(screen.getByRole('button', { name: 'Add account' }));
		const [usd, eur, gbp] = screen.getAllByLabelText('Currency');
		if (!usd || !eur || !gbp) throw new Error('expected three currency inputs');
		await user.type(usd, 'USD');
		await user.type(eur, 'EUR');
		await user.type(gbp, 'GBP');
		// Remove the middle row.
		const [, middleRemove] = screen.getAllByRole('button', { name: 'Remove' });
		if (!middleRemove) throw new Error('expected a middle remove button');
		await user.click(middleRemove);

		const remaining = screen.getAllByLabelText('Currency') as HTMLInputElement[];
		expect(remaining.map((i) => i.value)).toEqual(['USD', 'GBP']);

		await user.click(screen.getByRole('button', { name: 'Submit' }));
		expect(onSubmit).toHaveBeenCalledWith({
			bankAccounts: [{ currency: 'USD' }, { currency: 'GBP' }],
		});
	});

	it('seeds new item fields from defaultItem', () => {
		renderForm(buildSchema({ minItems: 1, defaultItem: { currency: 'USD' } }));
		const input = screen.getByLabelText('Currency') as HTMLInputElement;
		expect(input.value).toBe('USD');
	});

	it('supports groups (and nested groups) inside an item', async () => {
		const user = userEvent.setup();
		const onSubmit = renderForm(
			buildSchema({
				minItems: 1,
				groups: [
					{
						title: 'Holder',
						questions: [{ key: 'name', label: 'Name', control: 'text' }],
						groups: [
							{
								title: 'Bank',
								questions: [{ key: 'currency', label: 'Currency', control: 'text' }],
							},
						],
					},
				],
			})
		);
		// Both the top-level item field and the nested-group field render.
		await user.type(screen.getByLabelText('Name'), 'Ada');
		await user.type(screen.getByLabelText('Currency'), 'USD');
		await user.click(screen.getByRole('button', { name: 'Submit' }));
		expect(onSubmit).toHaveBeenCalledWith({
			bankAccounts: [{ name: 'Ada', currency: 'USD' }],
		});
	});

	it('fires within-row propsDependsOn and keeps rows isolated', async () => {
		const user = userEvent.setup();
		renderForm(
			buildSchema({
				minItems: 2,
				groups: [
					{
						questions: [
							{ key: 'country', label: 'Country', control: 'text' },
							{
								key: 'routing',
								label: 'Routing',
								control: 'text',
								dependents: {
									propsDependsOn: [
										{
											fieldNames: ['country'],
											compute: (v: Record<string, unknown>) => ({ hidden: v.country !== 'US' }),
										},
									],
								},
							},
						],
					},
				],
			})
		);
		// country is empty in both rows → routing hidden (the per-row engine's
		// initial pass ran).
		expect(screen.queryAllByLabelText('Routing')).toHaveLength(0);

		const [country0, country1] = screen.getAllByLabelText('Country');
		if (!country0 || !country1) throw new Error('expected two country inputs');

		// Row 0 → US reveals only row 0's routing (rows are isolated).
		await user.type(country0, 'US');
		expect(screen.getAllByLabelText('Routing')).toHaveLength(1);

		// Row 1 → US reveals the second.
		await user.type(country1, 'US');
		expect(screen.getAllByLabelText('Routing')).toHaveLength(2);
	});

	it('lets a row field read an outside field via the $root. marker', async () => {
		const user = userEvent.setup();
		const repeating = {
			key: 'bankAccounts',
			label: 'Bank accounts',
			control: 'repeatingGroup',
			minItems: 2,
			maxItems: 3,
			groups: [
				{
					questions: [
						{
							key: 'routing',
							label: 'Routing',
							control: 'text',
							dependents: {
								propsDependsOn: [
									{
										fieldNames: ['$root.accountType'],
										compute: (v: Record<string, unknown>) => ({
											hidden: v.accountType !== 'business',
										}),
									},
								],
							},
						},
					],
				},
			],
		} as unknown as Question;
		const schema: FormSchema = {
			groups: [
				{
					id: 'root',
					questions: [
						{ key: 'accountType', label: 'Account type', control: 'text' } as Question,
						repeating,
					],
				},
			],
		};
		renderForm(schema);

		// accountType empty → routing hidden in both rows.
		expect(screen.queryAllByLabelText('Routing')).toHaveLength(0);

		// Toggling the OUTSIDE field reveals routing in every row (shared source).
		await user.type(screen.getByLabelText('Account type'), 'business');
		expect(screen.getAllByLabelText('Routing')).toHaveLength(2);
	});

	it('supports a mixed rule of row-relative and $root. field names', async () => {
		const user = userEvent.setup();
		const repeating = {
			key: 'bankAccounts',
			label: 'Bank accounts',
			control: 'repeatingGroup',
			minItems: 1,
			maxItems: 3,
			groups: [
				{
					questions: [
						{ key: 'country', label: 'Country', control: 'text' },
						{
							key: 'routing',
							label: 'Routing',
							control: 'text',
							dependents: {
								propsDependsOn: [
									{
										fieldNames: ['country', '$root.accountType'],
										compute: (v: Record<string, unknown>) => ({
											hidden: !(v.country === 'US' && v.accountType === 'business'),
										}),
									},
								],
							},
						},
					],
				},
			],
		} as unknown as Question;
		const schema: FormSchema = {
			groups: [
				{
					id: 'root',
					questions: [
						{ key: 'accountType', label: 'Account type', control: 'text' } as Question,
						repeating,
					],
				},
			],
		};
		renderForm(schema);

		expect(screen.queryAllByLabelText('Routing')).toHaveLength(0);
		// Row-relative condition met, outside not yet → still hidden.
		await user.type(screen.getByLabelText('Country'), 'US');
		expect(screen.queryAllByLabelText('Routing')).toHaveLength(0);
		// Outside condition now met → routing revealed.
		await user.type(screen.getByLabelText('Account type'), 'business');
		expect(screen.getAllByLabelText('Routing')).toHaveLength(1);
	});

	it('submits a nested array of item objects', async () => {
		const user = userEvent.setup();
		const onSubmit = renderForm(buildSchema({ minItems: 1 }));
		await user.type(screen.getByLabelText('Currency'), 'USD');
		await user.click(screen.getByRole('button', { name: 'Submit' }));
		expect(onSubmit).toHaveBeenCalledWith({ bankAccounts: [{ currency: 'USD' }] });
	});

	it('lets an outside field read the group as an array of row objects (#C1)', async () => {
		const user = userEvent.setup();
		const seen: unknown[] = [];
		const repeating = {
			key: 'bankAccounts',
			label: 'Bank accounts',
			control: 'repeatingGroup',
			minItems: 1,
			maxItems: 3,
			addLabel: 'Add account',
			groups: [{ questions: [{ key: 'currency', label: 'Currency', control: 'text' }] }],
		} as unknown as Question;
		const summary = {
			key: 'summary',
			label: 'Summary',
			control: 'text',
			dependents: {
				propsDependsOn: [
					{
						fieldNames: ['bankAccounts'],
						compute: (v: Record<string, unknown>) => {
							seen.push(v.bankAccounts);
							const rows = (v.bankAccounts as Array<{ currency?: string }>) ?? [];
							return { description: rows.map((r) => r.currency ?? '').join(',') };
						},
					},
				],
			},
		} as unknown as Question;
		const schema: FormSchema = {
			groups: [{ id: 'root', questions: [repeating, summary] }],
		};
		renderForm(schema);

		// Compute received an array of row objects (not the raw index list).
		const first = seen.at(-1) as Array<{ currency?: string }>;
		expect(Array.isArray(first)).toBe(true);
		expect(first).toEqual([{ currency: undefined }]);

		// Editing a ROW field re-runs the outside dependent with fresh row objects.
		await user.type(screen.getByLabelText('Currency'), 'USD');
		expect(seen.at(-1)).toEqual([{ currency: 'USD' }]);

		// Adding a row updates the array too.
		await user.click(screen.getByRole('button', { name: 'Add account' }));
		expect((seen.at(-1) as unknown[]).length).toBe(2);
	});

	it('gives an outside dependent [] for an empty group (#C1)', () => {
		const seen: unknown[] = [];
		const repeating = {
			key: 'bankAccounts',
			label: 'Bank accounts',
			control: 'repeatingGroup',
			minItems: 0,
			maxItems: 3,
			groups: [{ questions: [{ key: 'currency', label: 'Currency', control: 'text' }] }],
		} as unknown as Question;
		const summary = {
			key: 'summary',
			label: 'Summary',
			control: 'text',
			dependents: {
				propsDependsOn: [
					{
						fieldNames: ['bankAccounts'],
						compute: (v: Record<string, unknown>) => {
							seen.push(v.bankAccounts);
							return {};
						},
					},
				],
			},
		} as unknown as Question;
		const schema: FormSchema = {
			groups: [{ id: 'root', questions: [repeating, summary] }],
		};
		renderForm(schema);
		// No rows seeded (minItems 0) → the outside dependent sees an empty array.
		expect(seen.at(-1)).toEqual([]);
	});

	it('shows the unlicensed watermark in dev when no license is set', () => {
		statusMock.mockReturnValue(unlicensed);
		renderForm(buildSchema());
		expect(screen.getByText(/unlicensed/i)).toBeInTheDocument();
	});

	it('hides the watermark when licensed', () => {
		statusMock.mockReturnValue(licensed);
		renderForm(buildSchema());
		expect(screen.queryByText(/unlicensed/i)).toBeNull();
	});

	it('shows a single watermark across many rows and hands off when the owner is removed', async () => {
		const user = userEvent.setup();
		statusMock.mockReturnValue(unlicensed);
		renderForm(buildSchema({ minItems: 1, maxItems: 3 }));
		// Two rows, but the singleton yields exactly one badge.
		await user.click(screen.getByRole('button', { name: 'Add account' }));
		expect(screen.getAllByText(/unlicensed/i)).toHaveLength(1);
		// Remove the owning (first) row — ownership hands off, still exactly one.
		const [firstRemove] = screen.getAllByRole('button', { name: 'Remove' });
		if (!firstRemove) throw new Error('expected a remove button');
		await user.click(firstRemove);
		expect(screen.getAllByText(/unlicensed/i)).toHaveLength(1);
	});
});
