import { FieldShell } from '@/components/easy-forms/field-shell';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { DropdownQuestion, Option, RendererProps } from '@easy-forms/core';

export function DropdownRenderer({
	question,
	value,
	onChange,
	onBlur,
	error,
	touched,
}: RendererProps<DropdownQuestion>) {
	const showError = touched && !!error;
	// Options come from the effective question — runtime overrides from
	// `propsDependsOn` have already been merged into `question.options` by
	// <Field>, so no separate `computed.options` lookup is needed.
	const options: Option[] = (question.options as Option[] | undefined) ?? [];

	return (
		<FieldShell
			id={question.key}
			label={question.label}
			description={question.description}
			error={showError ? error : null}
			required={!!question.required}
		>
			<Select
				value={value == null ? '' : String(value)}
				onValueChange={(v) => onChange(v)}
				disabled={!!question.disabled}
			>
				<SelectTrigger
					id={question.key}
					aria-invalid={showError || undefined}
					aria-describedby={showError ? `${question.key}-error` : undefined}
					onBlur={onBlur}
				>
					<SelectValue placeholder={question.placeholder ?? 'Select...'} />
				</SelectTrigger>
				<SelectContent>
					{options.map((opt) => (
						<SelectItem key={String(opt.value)} value={String(opt.value)} disabled={opt.disabled}>
							{opt.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</FieldShell>
	);
}
