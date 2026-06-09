// FormSchema — top-level shape passed to <Form>.

import type { Group } from './group';
import type { Dependency } from './dependencies';

export interface WizardStep<
	TFormData extends Record<string, unknown> = Record<string, unknown>,
> {
	id: string;
	title: string;
	description?: string;
	groups: Group<TFormData>[];
	dependents?: Dependency<TFormData>;
	optional?: boolean;
}

export interface WizardConfig<
	TFormData extends Record<string, unknown> = Record<string, unknown>,
> {
	steps: WizardStep<TFormData>[];
	/** When set, wizard state (values + currentStepIndex) is persisted to localStorage under this key. */
	persistKey?: string;
	/** Default true. Runs the current step's validators before advancing. */
	validateOnNext?: boolean;
}

export interface FormSchema<
	TFormData extends Record<string, unknown> = Record<string, unknown>,
> {
	id?: string;
	title?: string;
	description?: string;
	groups: Group<TFormData>[];
	wizard?: WizardConfig<TFormData>;
}

export type ValidationMode = 'onChange' | 'onBlur' | 'onSubmit' | 'all';
