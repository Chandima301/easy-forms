import {
	Form,
	type FormSchema,
	type Question,
	type RendererProps,
	type RendererRegistry,
	type TextQuestion,
} from '@easy-forms/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/license/setEasyFormsProLicense', () => ({
	getLicenseStatus: vi.fn(),
}));

import { RepeatingGroupRenderer } from '../src/components/RepeatingGroupRenderer';
import '../src/controls/repeatingGroup'; // loads the `repeatingGroup` control augmentation
import { resetWarningsForTests } from '../src/license/assertLicensed';
import { getLicenseStatus } from '../src/license/setEasyFormsProLicense';

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

function renderForm(schema: FormSchema, onSubmit = vi.fn()) {
	render(<Form schema={schema} registry={registry} onSubmit={onSubmit} />);
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

describe('RepeatingGroupRenderer', () => {
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

	it('submits a nested array of item objects', async () => {
		const user = userEvent.setup();
		const onSubmit = renderForm(buildSchema({ minItems: 1 }));
		await user.type(screen.getByLabelText('Currency'), 'USD');
		await user.click(screen.getByRole('button', { name: 'Submit' }));
		expect(onSubmit).toHaveBeenCalledWith({ bankAccounts: [{ currency: 'USD' }] });
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
});
