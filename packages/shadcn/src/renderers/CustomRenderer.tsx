// CustomRenderer — delegates entirely to the user-provided component.
// The question carries either `render` (function) or `component` (Component).
//
// Wrapped in FieldShell so the user's component focuses on the control itself
// and gets free label / description / error handling.

import type { CustomQuestion, RendererProps } from '@easy-forms/core';
import { FieldShell } from '../primitives/FieldShell';

export function CustomRenderer({
	question,
	value,
	onChange,
	onBlur,
	error,
	touched,
}: RendererProps<CustomQuestion>) {
	const showError = touched && !!error;
	const userProps = {
		value,
		onChange,
		onBlur,
		disabled: !!question.disabled,
		readOnly: !!question.readOnly,
		error: showError ? error : null,
		...(question.componentProps ?? {}),
	};
	return (
		<FieldShell
			id={question.key}
			label={question.label}
			description={question.description}
			error={showError ? error : null}
			required={!!question.required}
		>
			{question.render ? (
				question.render(userProps)
			) : question.component ? (
				<question.component {...userProps} />
			) : (
				<div className="text-sm text-red-600">
					CustomQuestion "{question.key}" is missing both `render` and `component`.
				</div>
			)}
		</FieldShell>
	);
}
