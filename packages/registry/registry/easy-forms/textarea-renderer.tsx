import { FieldShell } from '@/components/easy-forms/field-shell';
import { Textarea } from '@/components/ui/textarea';
import type { RendererProps, TextAreaQuestion } from '@easy-forms/core';

export function TextAreaRenderer({
	question,
	value,
	onChange,
	onBlur,
	error,
	touched,
}: RendererProps<TextAreaQuestion>) {
	const showError = touched && !!error;
	return (
		<FieldShell
			id={question.key}
			label={question.label}
			description={question.description}
			error={showError ? error : null}
			required={!!question.required}
		>
			<Textarea
				id={question.key}
				name={question.key}
				value={value ?? ''}
				placeholder={question.placeholder}
				maxLength={question.maxLength}
				rows={question.rows ?? 4}
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
