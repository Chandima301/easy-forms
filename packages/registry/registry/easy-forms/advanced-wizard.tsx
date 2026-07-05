// AdvancedWizard — ejectable renderer for the Pro branching (non-linear) wizard.
//
// This owns ALL the markup + styling: the step indicator, the panel area, and the
// Back / Next / Submit nav. Styled the shadcn way — Tailwind theme-token utilities +
// `cn()` + the shadcn `Button` primitive — so it themes with the rest of your form.
// Edit freely to restyle; the step-state contract is what makes it customisable —
// each step arrives decorated with `status` ('active' | 'completed' | 'upcoming' |
// 'unreachable'), so you can render the indicator however you like.
//
// The engine (declarative route resolution, the taken back-stack, per-step validation
// gating, off-path field exclusion, branch-aware persistence) lives behind
// `useAdvancedWizard` + `<AdvancedWizardPanel>` in @easy-forms/pro. Requires
// @easy-forms/pro. It mounts its own store like <Form>, so render it standalone:
//   <AdvancedWizard config={myWizardConfig} registry={easyFormsRegistry} onSubmit={...} />

import { easyFormsRegistry } from '@/components/easy-forms/registry';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
	type DependencyHandlerRegistry,
	type FormPlugin,
	type FormSchema,
	FormStoreProvider,
	type RendererRegistry,
	RendererRegistryContext,
	attachDependencyEngine,
	attachPlugins,
	createFormStore,
	defaultDependencyHandlers,
	useFormStoreContext,
} from '@easy-forms/core';
import {
	type AdvancedWizardConfig,
	AdvancedWizardContext,
	AdvancedWizardPanel,
	useAdvancedWizard,
	useAdvancedWizardContext,
} from '@easy-forms/pro';
import { useEffect, useMemo } from 'react';

export interface AdvancedWizardProps {
	config: AdvancedWizardConfig;
	/** Defaults to the bound `easyFormsRegistry` — pass one only to override. */
	registry?: RendererRegistry;
	onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
	initialValues?: Record<string, unknown>;
	dependencyHandlers?: DependencyHandlerRegistry;
	plugins?: FormPlugin[];
	nextLabel?: string;
	previousLabel?: string;
	submitLabel?: string;
	className?: string;
}

export function AdvancedWizard({
	config,
	registry = easyFormsRegistry,
	onSubmit,
	initialValues,
	dependencyHandlers,
	plugins,
	nextLabel = 'Next',
	previousLabel = 'Back',
	submitLabel = 'Submit',
	className,
}: AdvancedWizardProps) {
	const store = useMemo(() => createFormStore({ initialValues }), [initialValues]);
	const handlers = useMemo(
		() => ({ ...defaultDependencyHandlers, ...dependencyHandlers }),
		[dependencyHandlers]
	);

	return (
		<FormStoreProvider store={store}>
			<RendererRegistryContext.Provider value={registry}>
				<AdvancedWizardRuntime
					config={config}
					onSubmit={onSubmit}
					handlers={handlers}
					plugins={plugins}
					nextLabel={nextLabel}
					previousLabel={previousLabel}
					submitLabel={submitLabel}
					className={className}
				/>
			</RendererRegistryContext.Provider>
		</FormStoreProvider>
	);
}

function AdvancedWizardRuntime({
	config,
	onSubmit,
	handlers,
	plugins,
	nextLabel,
	previousLabel,
	submitLabel,
	className,
}: {
	config: AdvancedWizardConfig;
	onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
	handlers: DependencyHandlerRegistry;
	plugins?: FormPlugin[];
	nextLabel: string;
	previousLabel: string;
	submitLabel: string;
	className?: string;
}) {
	const wizard = useAdvancedWizard(config, { onSubmit });

	// The schema of currently-mounted steps. Re-derived when the reachable path
	// changes so the engine's initial pass covers each step as it becomes reachable.
	// Off-path steps aren't mounted, so their fields never register.
	const mountedSchema = useMemo<FormSchema>(() => {
		const byId = new Map(config.steps.map((s) => [s.id, s]));
		const groups = wizard.mountedStepIds.flatMap((id) => byId.get(id)?.groups ?? []);
		return { groups };
	}, [config.steps, wizard.mountedStepIds]);

	return (
		<AdvancedWizardContext.Provider value={wizard}>
			<EngineBridge schema={mountedSchema} handlers={handlers} plugins={plugins} />
			<div className={cn('easy-forms-wizard', className)}>
				<StepIndicator />
				<div className="easy-forms-wizard__panels">
					{config.steps
						.filter((s) => wizard.mountedStepIds.includes(s.id))
						.map((s) => (
							<AdvancedWizardPanel key={s.id} step={s} active={s.id === wizard.current.id} />
						))}
				</div>
				<ErrorSummary />
				<Nav nextLabel={nextLabel} previousLabel={previousLabel} submitLabel={submitLabel} />
			</div>
		</AdvancedWizardContext.Provider>
	);
}

// Attaches the dependency engine + plugins over the mounted-step schema. Kept as a
// sibling component so its effects re-run when the reachable path changes.
function EngineBridge({
	schema,
	handlers,
	plugins,
}: {
	schema: FormSchema;
	handlers: DependencyHandlerRegistry;
	plugins?: FormPlugin[];
}) {
	const store = useFormStoreContext();
	useEffect(() => {
		const attached = attachDependencyEngine(store, schema, handlers);
		return attached.detach;
	}, [store, schema, handlers]);
	useEffect(() => {
		if (!plugins || plugins.length === 0) return;
		return attachPlugins(store, schema, plugins);
	}, [store, schema, plugins]);
	return null;
}

function StepIndicator() {
	const { path, goTo } = useAdvancedWizardContext();
	return (
		<nav className="easy-forms-wizard__nav" aria-label="Wizard progress">
			<ol className="easy-forms-wizard__nav-list">
				{path.map((step) => (
					<li
						key={step.id}
						className={cn(
							'easy-forms-wizard__nav-item',
							step.isActive && 'easy-forms-wizard__nav-item--active',
							step.status === 'completed' && 'easy-forms-wizard__nav-item--visited'
						)}
					>
						<button
							id={`adv-step-tab-${step.id}`}
							type="button"
							onClick={() => {
								if (step.canNavigateTo) void goTo(step.id);
							}}
							disabled={!step.canNavigateTo}
							aria-current={step.isActive ? 'step' : undefined}
						>
							{step.title}
							{step.hasErrors ? (
								<span
									className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground"
									aria-label={`${step.errorCount} error${step.errorCount === 1 ? '' : 's'}`}
								>
									{step.errorCount}
								</span>
							) : null}
						</button>
					</li>
				))}
			</ol>
		</nav>
	);
}

// Final-stage error summary — in lenient mode a user can advance past invalid
// steps, so the terminal step aggregates every remaining error with jump-to-fix
// links. Renders nothing in strict mode (you can't reach the end while invalid).
function ErrorSummary() {
	const { invalidSteps, isTerminalStep, goTo } = useAdvancedWizardContext();
	if (!isTerminalStep || invalidSteps.length === 0) return null;
	const total = invalidSteps.reduce((sum, s) => sum + s.errorCount, 0);
	return (
		<div
			role="alert"
			className="easy-forms-wizard__errors rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm"
		>
			<p className="font-medium text-destructive">
				Please fix {total} issue{total === 1 ? '' : 's'} before submitting:
			</p>
			<ul className="mt-2 flex flex-col gap-1">
				{invalidSteps.map((step) => (
					<li key={step.id}>
						<button
							type="button"
							className="text-destructive underline underline-offset-2 hover:no-underline"
							onClick={() => void goTo(step.id)}
						>
							{step.title} — {step.errorCount} error{step.errorCount === 1 ? '' : 's'}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}

function Nav({
	nextLabel,
	previousLabel,
	submitLabel,
}: {
	nextLabel: string;
	previousLabel: string;
	submitLabel: string;
}) {
	const { canGoPrevious, isTerminalStep, goNext, goPrevious, submit } = useAdvancedWizardContext();
	return (
		<footer className="easy-forms-wizard__footer">
			<Button
				type="button"
				variant="outline"
				className="easy-forms-wizard__previous"
				onClick={() => goPrevious()}
				disabled={!canGoPrevious}
			>
				{previousLabel}
			</Button>
			{isTerminalStep ? (
				<Button type="button" className="easy-forms-wizard__submit" onClick={() => void submit()}>
					{submitLabel}
				</Button>
			) : (
				<Button type="button" className="easy-forms-wizard__next" onClick={() => void goNext()}>
					{nextLabel}
				</Button>
			)}
		</footer>
	);
}
