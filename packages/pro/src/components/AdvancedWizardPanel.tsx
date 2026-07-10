import { GroupRenderer } from '@easy-forms/core';
import type { AdvancedWizardStep } from '../wizard/types';
import { ProWatermark } from './ProWatermark';

export interface AdvancedWizardPanelProps {
	step: AdvancedWizardStep;
	/** Only the active panel is shown; inactive ones stay mounted but CSS-hidden. */
	active: boolean;
}

/**
 * One branching-wizard step's fields. Renders the step's `groups` through core's
 * `GroupRenderer` (so layout + nesting match the rest of the schema) and CSS-hides
 * the panel when it is not the active step — keeping its fields registered so
 * same-branch back/forward navigation preserves their values.
 *
 * This is Pro-owned (the moat): the ejectable `<AdvancedWizard>` owns the chrome,
 * but the consumer must render this to get any fields — so the dev-only
 * `<ProWatermark>` lives here (on the visible active panel) and cannot be removed
 * by editing the ejected component.
 */
export function AdvancedWizardPanel({ step, active }: AdvancedWizardPanelProps) {
	return (
		<div
			role="tabpanel"
			aria-hidden={!active}
			aria-labelledby={`adv-step-tab-${step.id}`}
			style={{ display: active ? 'block' : 'none' }}
			className="easy-forms-wizard__panel"
			data-step={step.id}
		>
			{active ? <ProWatermark /> : null}
			{step.groups.map((group, index) => (
				<GroupRenderer key={group.id ?? group.title ?? `adv-${step.id}-${index}`} group={group} />
			))}
		</div>
	);
}
