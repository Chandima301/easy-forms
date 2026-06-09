import type { EmailQuestion, RendererProps } from '@easy-forms/core';
import { FieldShell } from '../primitives/FieldShell';
import { Input } from '../primitives/Input';

export function EmailRenderer({
	question,
	value,
	onChange,
	onBlur,
	error,
	touched,
}: RendererProps<EmailQuestion>) {
	const showError = touched && !!error;
	return (
		<FieldShell
			id={question.key}
			label={question.label}
			description={question.description}
			error={showError ? error : null}
			required={!!question.required}
		>
			<Input
				id={question.key}
				name={question.key}
				type="email"
				inputMode="email"
				autoComplete="email"
				value={value ?? ''}
				placeholder={question.placeholder}
				disabled={!!question.disabled}
				readOnly={!!question.readOnly}
				aria-invalid={showError || undefined}
				aria-describedby={showError ? `${question.key}-error` : undefined}
				onChange={(e) => onChange(e.target.value)}
				onBlur={onBlur}
			/>
		</FieldShell>
	);
}
