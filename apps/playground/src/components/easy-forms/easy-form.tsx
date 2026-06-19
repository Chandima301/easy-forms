// EasyForm — the pre-wired entry point. A thin wrapper over <Form> from
// @easy-forms/core with the local renderer registry + chrome styles baked in,
// so you write `<EasyForm schema={...} onSubmit={...} />` with no registry prop.
//
// You own this file: tweak the registry import, default labels, or class names.

import { easyFormsRegistry } from '@/components/easy-forms/registry';
import { Form, type FormProps } from '@easy-forms/core';
import './easy-forms.css';

export type EasyFormProps<TFormData extends Record<string, unknown> = Record<string, unknown>> =
	Omit<FormProps<TFormData>, 'registry'>;

export function EasyForm<TFormData extends Record<string, unknown> = Record<string, unknown>>(
	props: EasyFormProps<TFormData>
) {
	return <Form<TFormData> {...props} registry={easyFormsRegistry} />;
}

export { easyFormsRegistry };
