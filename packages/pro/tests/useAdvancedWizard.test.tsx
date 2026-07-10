import {
	FormStoreProvider,
	type RendererProps,
	type RendererRegistry,
	RendererRegistryContext,
	type TextQuestion,
	createFormStore,
} from '@easy-forms/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMemo } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/license/setEasyFormsProLicense', () => ({
	getLicenseStatus: vi.fn(),
}));

import { AdvancedWizardPanel } from '../src/components/AdvancedWizardPanel';
import { useAdvancedWizard } from '../src/hooks/useAdvancedWizard';
import { resetWarningsForTests } from '../src/license/assertLicensed';
import { getLicenseStatus } from '../src/license/setEasyFormsProLicense';
import type { AdvancedWizardConfig } from '../src/wizard/types';

const statusMock = vi.mocked(getLicenseStatus);
const ORIGINAL_ENV = process.env.NODE_ENV;
const licensed = {
	valid: true as const,
	claims: { customer: 'Acme', edition: 'pro' as const, seats: 1, iat: 0, exp: 9e9 },
};
const unlicensed = { valid: false as const, reason: 'missing' as const };

function TextRenderer({ question, value, onChange, error }: RendererProps<TextQuestion>) {
	return (
		<label>
			{question.label}
			<input
				aria-label={question.key}
				value={(value as string) ?? ''}
				onChange={(e) => onChange(e.target.value)}
			/>
			{error ? <span data-testid={`err-${question.key}`}>{error}</span> : null}
		</label>
	);
}

const registry: RendererRegistry = { text: TextRenderer };

// In-file harness mirroring the ejectable <AdvancedWizard> (which lives in the
// registry and is not importable here): store + providers, then the hook + panels.
function Harness({
	config,
	onSubmit = vi.fn(),
}: {
	config: AdvancedWizardConfig;
	onSubmit?: (v: Record<string, unknown>) => void | Promise<void>;
}) {
	const store = useMemo(() => createFormStore(), []);
	return (
		<FormStoreProvider store={store}>
			<RendererRegistryContext.Provider value={registry}>
				<Inner config={config} onSubmit={onSubmit} />
			</RendererRegistryContext.Provider>
		</FormStoreProvider>
	);
}

function Inner({
	config,
	onSubmit,
}: {
	config: AdvancedWizardConfig;
	onSubmit: (v: Record<string, unknown>) => void | Promise<void>;
}) {
	const wiz = useAdvancedWizard(config, { onSubmit });
	return (
		<div>
			<nav>
				{wiz.path.map((s) => (
					<button
						key={s.id}
						type="button"
						data-testid={`nav-${s.id}`}
						data-status={s.status}
						data-error-count={s.errorCount}
						data-has-errors={s.hasErrors}
						disabled={!s.canNavigateTo}
						onClick={() => void wiz.goTo(s.id)}
					>
						{s.title}
					</button>
				))}
			</nav>
			<div data-testid="invalid-steps">{wiz.invalidSteps.map((s) => s.id).join(',')}</div>
			<div>
				{config.steps
					.filter((s) => wiz.mountedStepIds.includes(s.id))
					.map((s) => (
						<AdvancedWizardPanel key={s.id} step={s} active={s.id === wiz.current.id} />
					))}
			</div>
			<footer>
				<button type="button" onClick={() => wiz.goPrevious()} disabled={!wiz.canGoPrevious}>
					Back
				</button>
				{wiz.isTerminalStep ? (
					<button type="button" onClick={() => void wiz.submit()}>
						Submit
					</button>
				) : (
					<button type="button" onClick={() => void wiz.goNext()}>
						Next
					</button>
				)}
			</footer>
		</div>
	);
}

const step = (
	id: string,
	fields: TextQuestion[],
	next?: AdvancedWizardConfig['steps'][number]['next']
) => ({
	id,
	title: id,
	groups: [{ questions: fields }],
	next,
});

const field = (key: string, required = false): TextQuestion =>
	({
		key,
		label: key,
		control: 'text',
		...(required ? { validators: { required: true } } : {}),
	}) as TextQuestion;

// A KYC-style branch: `kind` routes to `biz` (required EIN) or `person`, both → `done`.
function kycConfig(overrides: Partial<AdvancedWizardConfig> = {}): AdvancedWizardConfig {
	return {
		steps: [
			step(
				'start',
				[field('kind')],
				[
					{ fieldNames: ['kind'], when: (v) => v.kind === 'business', to: 'biz' },
					{ fieldNames: [], when: () => true, to: 'person' },
				]
			),
			step('biz', [field('ein', true)], 'done'),
			step('person', [field('ssn')], 'done'),
			step('done', [field('confirm')]),
		],
		...overrides,
	};
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

describe('useAdvancedWizard', () => {
	it('mounts only the start step (and its projected path), not other branches', () => {
		render(<Harness config={kycConfig()} />);
		// start is active and interactive.
		expect(screen.getByLabelText('kind')).toBeInTheDocument();
		// The unchosen `business` branch is not mounted.
		expect(screen.queryByLabelText('ein')).toBeNull();
	});

	it('routes to the branch selected by the current answers', async () => {
		const user = userEvent.setup();
		render(<Harness config={kycConfig()} />);
		await user.type(screen.getByLabelText('kind'), 'business');
		await user.click(screen.getByRole('button', { name: 'Next' }));
		// Took the business branch.
		expect(screen.getByLabelText('ein')).toBeInTheDocument();
		expect(screen.queryByLabelText('ssn')).toBeNull();
	});

	it('takes the default route when no predicate matches', async () => {
		const user = userEvent.setup();
		render(<Harness config={kycConfig()} />);
		await user.type(screen.getByLabelText('kind'), 'individual');
		await user.click(screen.getByRole('button', { name: 'Next' }));
		expect(screen.getByLabelText('ssn')).toBeInTheDocument();
		expect(screen.queryByLabelText('ein')).toBeNull();
	});

	it('blocks goNext when the current step has an invalid required field', async () => {
		const user = userEvent.setup();
		render(<Harness config={kycConfig()} />);
		await user.type(screen.getByLabelText('kind'), 'business');
		await user.click(screen.getByRole('button', { name: 'Next' }));
		// On biz; EIN is required and empty → Next is blocked.
		await user.click(screen.getByRole('button', { name: 'Next' }));
		expect(screen.getByTestId('err-ein')).toHaveTextContent('This field is required');
		expect(screen.getByLabelText('ein')).toBeInTheDocument();
	});

	it('goes back to the previous step preserving entered values', async () => {
		const user = userEvent.setup();
		render(<Harness config={kycConfig()} />);
		await user.type(screen.getByLabelText('kind'), 'individual');
		await user.click(screen.getByRole('button', { name: 'Next' }));
		await user.type(screen.getByLabelText('ssn'), '123');
		await user.click(screen.getByRole('button', { name: 'Back' }));
		expect((screen.getByLabelText('kind') as HTMLInputElement).value).toBe('individual');
	});

	it('excludes not-taken branch fields from submit', async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(<Harness config={kycConfig()} onSubmit={onSubmit} />);
		await user.type(screen.getByLabelText('kind'), 'individual');
		await user.click(screen.getByRole('button', { name: 'Next' })); // → person
		await user.type(screen.getByLabelText('ssn'), '123');
		await user.click(screen.getByRole('button', { name: 'Next' })); // → done
		await user.click(screen.getByRole('button', { name: 'Submit' }));
		expect(onSubmit).toHaveBeenCalledTimes(1);
		const submitted = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>;
		expect(submitted).not.toHaveProperty('ein'); // the unchosen business branch
		expect(submitted).toMatchObject({ kind: 'individual', ssn: '123' });
	});

	it('only allows jumping to visited steps', async () => {
		const user = userEvent.setup();
		render(<Harness config={kycConfig()} />);
		await user.type(screen.getByLabelText('kind'), 'individual');
		await user.click(screen.getByRole('button', { name: 'Next' })); // now on person
		// `start` is visited → its nav button is enabled.
		expect(screen.getByTestId('nav-start')).toBeEnabled();
		// `done` is upcoming (projected, not visited) → not navigable.
		expect(screen.getByTestId('nav-done')).toBeDisabled();
		// Jump back to start → start's panel is the visible one.
		await user.click(screen.getByTestId('nav-start'));
		expect(
			screen.getByLabelText('kind').closest('[role=tabpanel]')?.getAttribute('aria-hidden')
		).toBe('false');
		// The person branch stays mounted-but-hidden (still on the projected path).
		expect(
			screen.getByLabelText('ssn').closest('[role=tabpanel]')?.getAttribute('aria-hidden')
		).toBe('true');
	});

	it('shows the unlicensed watermark in dev on the active step', () => {
		statusMock.mockReturnValue(unlicensed);
		render(<Harness config={kycConfig()} />);
		expect(screen.getByText(/unlicensed/i)).toBeInTheDocument();
	});

	it('hides the watermark when licensed', () => {
		statusMock.mockReturnValue(licensed);
		render(<Harness config={kycConfig()} />);
		expect(screen.queryByText(/unlicensed/i)).toBeNull();
	});

	describe('lenient navigation (continue past errors)', () => {
		it('advances past an invalid step and flags it with an error count', async () => {
			const user = userEvent.setup();
			render(<Harness config={kycConfig({ navigation: 'lenient' })} />);
			await user.type(screen.getByLabelText('kind'), 'business');
			await user.click(screen.getByRole('button', { name: 'Next' })); // → biz (start valid)
			// EIN is required + empty, but lenient mode advances anyway.
			await user.click(screen.getByRole('button', { name: 'Next' })); // → done
			expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
			// The passed-over biz step is now flagged with one error.
			const bizNav = screen.getByTestId('nav-biz');
			expect(bizNav.getAttribute('data-error-count')).toBe('1');
			expect(bizNav.getAttribute('data-has-errors')).toBe('true');
		});

		it('lets you free-jump forward to an upcoming projected step', async () => {
			const user = userEvent.setup();
			render(<Harness config={kycConfig({ navigation: 'lenient' })} />);
			// From start, projected path is start → person → done; `done` is upcoming.
			const doneNav = screen.getByTestId('nav-done');
			expect(doneNav).toBeEnabled();
			await user.click(doneNav);
			expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
		});

		it('still blocks submit and lists every invalid step at the final stage', async () => {
			const user = userEvent.setup();
			const onSubmit = vi.fn();
			render(<Harness config={kycConfig({ navigation: 'lenient' })} onSubmit={onSubmit} />);
			await user.type(screen.getByLabelText('kind'), 'business');
			await user.click(screen.getByRole('button', { name: 'Next' })); // → biz
			await user.click(screen.getByRole('button', { name: 'Next' })); // → done (skipped EIN)
			await user.click(screen.getByRole('button', { name: 'Submit' }));
			// Final-stage validation blocks the submit and surfaces the invalid step.
			expect(onSubmit).not.toHaveBeenCalled();
			expect(screen.getByTestId('invalid-steps')).toHaveTextContent('biz');
		});

		it('clears a step chip once its error is fixed', async () => {
			const user = userEvent.setup();
			render(<Harness config={kycConfig({ navigation: 'lenient' })} />);
			await user.type(screen.getByLabelText('kind'), 'business');
			await user.click(screen.getByRole('button', { name: 'Next' })); // → biz
			await user.click(screen.getByRole('button', { name: 'Next' })); // → done, biz flagged
			expect(screen.getByTestId('nav-biz').getAttribute('data-error-count')).toBe('1');
			// Jump back to biz and fill the required field — chip clears live.
			await user.click(screen.getByTestId('nav-biz'));
			await user.type(screen.getByLabelText('ein'), '12-3456789');
			expect(screen.getByTestId('nav-biz').getAttribute('data-error-count')).toBe('0');
		});
	});

	it('strict mode (default) keeps blocking on an invalid step', async () => {
		const user = userEvent.setup();
		render(<Harness config={kycConfig({ navigation: 'strict' })} />);
		await user.type(screen.getByLabelText('kind'), 'business');
		await user.click(screen.getByRole('button', { name: 'Next' })); // → biz
		await user.click(screen.getByRole('button', { name: 'Next' })); // blocked (EIN required)
		expect(screen.getByLabelText('ein')).toBeInTheDocument();
		expect(screen.getByTestId('err-ein')).toHaveTextContent('This field is required');
	});
});
