// Wizard — ejectable simple (linear) multi-step wizard chrome. Logic lives in core's
// useWizardRuntime/WizardContext; this owns only markup + utility styling. Panels
// render through the injected GroupRenderer. Mirrors the Pro AdvancedWizard styling.
import { GroupRenderer } from '@/components/easy-forms/group-renderer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type WizardConfig, WizardContext, useWizard, useWizardRuntime } from '@easy-forms/core';

export interface WizardProps {
	// biome-ignore lint/suspicious/noExplicitAny: variance dodge, matches engine.
	wizard: WizardConfig<any>;
	onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
	nextLabel?: string;
	previousLabel?: string;
	submitLabel?: string;
	className?: string;
}

export function Wizard({
	wizard,
	onSubmit,
	nextLabel = 'Next',
	previousLabel = 'Back',
	submitLabel = 'Submit',
	className,
}: WizardProps) {
	const ctx = useWizardRuntime(wizard, { onSubmit });
	return (
		<WizardContext.Provider value={ctx}>
			<div className={cn('easy-forms-wizard', 'flex flex-col gap-4', className)}>
				<StepIndicator />
				<div className="easy-forms-wizard__panels flex flex-col gap-4">
					{ctx.steps.map((s, idx) => (
						<div
							key={s.id}
							role="tabpanel"
							aria-hidden={idx !== ctx.state.currentStepIndex}
							aria-labelledby={`step-tab-${s.id}`}
							style={{ display: idx === ctx.state.currentStepIndex ? 'block' : 'none' }}
							className="easy-forms-wizard__panel"
						>
							{s.groups.map((group, gi) => (
								<GroupRenderer
									key={group.id ?? group.title ?? `wizard-${s.id}-${gi}`}
									group={group}
								/>
							))}
						</div>
					))}
				</div>
				<Nav nextLabel={nextLabel} previousLabel={previousLabel} submitLabel={submitLabel} />
			</div>
		</WizardContext.Provider>
	);
}

function StepIndicator() {
	const { steps, state, goTo } = useWizard();
	return (
		<nav className="easy-forms-wizard__nav" aria-label="Wizard progress">
			<ol className="easy-forms-wizard__nav-list flex flex-wrap items-center gap-2 border-b border-border pb-3">
				{steps.map((step, idx) => {
					if (!state.visibleStepIndices.includes(idx)) return null;
					const isActive = idx === state.currentStepIndex;
					const isVisited = state.visitedSteps.has(idx);
					const visited = isVisited && !isActive;
					return (
						<li
							key={step.id}
							className={cn(
								'easy-forms-wizard__nav-item',
								isActive && 'easy-forms-wizard__nav-item--active',
								isVisited && 'easy-forms-wizard__nav-item--visited'
							)}
						>
							<button
								id={`step-tab-${step.id}`}
								type="button"
								onClick={() => {
									if (isVisited) void goTo(idx);
								}}
								disabled={!isVisited}
								aria-current={isActive ? 'step' : undefined}
								className={cn(
									'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors',
									'disabled:cursor-not-allowed disabled:opacity-50',
									isActive
										? 'border-primary bg-primary text-primary-foreground'
										: visited
											? 'border-emerald-600 text-emerald-700 hover:bg-accent dark:text-emerald-400'
											: 'border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
								)}
							>
								{step.title}
							</button>
						</li>
					);
				})}
			</ol>
		</nav>
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
	const { canGoPrevious, isLastVisibleStep, goNext, goPrevious, submit } = useWizard();
	return (
		<footer className="easy-forms-wizard__footer flex justify-between gap-2 border-t border-border pt-4">
			<Button type="button" variant="outline" onClick={goPrevious} disabled={!canGoPrevious}>
				{previousLabel}
			</Button>
			{isLastVisibleStep ? (
				<Button type="button" onClick={() => void submit()}>
					{submitLabel}
				</Button>
			) : (
				<Button type="button" onClick={() => void goNext()}>
					{nextLabel}
				</Button>
			)}
		</footer>
	);
}
