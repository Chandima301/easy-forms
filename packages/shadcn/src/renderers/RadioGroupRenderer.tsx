import type { Option, RadioGroupQuestion, RendererProps } from '@easy-forms/core';
import { FieldShell } from '../primitives/FieldShell';
import { Label } from '../primitives/Label';
import { RadioGroup, RadioGroupItem } from '../primitives/RadioGroup';
import { cn } from '../lib/cn';

export function RadioGroupRenderer({
	question,
	value,
	onChange,
	onBlur,
	error,
	touched,
}: RendererProps<RadioGroupQuestion>) {
	const showError = touched && !!error;
	const options: Option[] = (question.options as Option[] | undefined) ?? [];
	const disabled = !!question.disabled;
	return (
		<FieldShell
			id={question.key}
			label={question.label}
			description={question.description}
			error={showError ? error : null}
			required={!!question.required}
		>
			<RadioGroup
				value={value == null ? '' : String(value)}
				onValueChange={(v) => onChange(v)}
				disabled={disabled}
				aria-invalid={showError || undefined}
				aria-describedby={showError ? `${question.key}-error` : undefined}
				onBlur={onBlur}
				className={cn(question.vertical === false ? 'flex flex-row flex-wrap gap-4' : 'flex flex-col gap-2')}
			>
				{options.map((opt) => {
					const id = `${question.key}-${String(opt.value)}`;
					return (
						<div key={String(opt.value)} className="flex items-center gap-2">
							<RadioGroupItem
								id={id}
								value={String(opt.value)}
								disabled={opt.disabled || disabled}
							/>
							<Label htmlFor={id} className="cursor-pointer">
								{opt.label}
							</Label>
						</div>
					);
				})}
			</RadioGroup>
		</FieldShell>
	);
}
