import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { CheckboxQuestion, RendererProps } from '@easy-forms/core';

export function CheckboxRenderer({
	question,
	value,
	onChange,
	onBlur,
	error,
	touched,
}: RendererProps<CheckboxQuestion>) {
	const showError = touched && !!error;
	const errorId = showError ? `${question.key}-error` : undefined;
	return (
		<div className="easy-forms-field flex flex-col gap-1.5">
			<div className="flex items-center gap-2">
				<Checkbox
					id={question.key}
					checked={!!value}
					disabled={!!question.disabled}
					onCheckedChange={(checked) => onChange(checked === true)}
					onBlur={onBlur}
					aria-invalid={showError || undefined}
					aria-describedby={errorId}
				/>
				<Label htmlFor={question.key} className="cursor-pointer">
					{question.checkboxLabel ?? question.label}
					{question.required ? <span className="ml-0.5 text-destructive">*</span> : null}
				</Label>
			</div>
			{question.description ? (
				<p className="text-xs text-muted-foreground">{question.description}</p>
			) : null}
			{showError ? (
				<p id={errorId} className="text-xs font-medium text-destructive">
					{error}
				</p>
			) : null}
		</div>
	);
}
