import { FieldShell } from '@/components/easy-forms/field-shell';
import { Input } from '@/components/ui/input';
import type { RendererProps, TextQuestion } from '@easy-forms/core';

export function TextRenderer({
	question,
	value,
	onChange,
	onBlur,
	error,
	touched,
}: RendererProps<TextQuestion>) {
	const showError = touched && !!error;
	const inputType = question.inputType ?? 'text';
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
				type={inputType}
				value={value ?? ''}
				placeholder={question.placeholder}
				maxLength={question.maxLength}
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
