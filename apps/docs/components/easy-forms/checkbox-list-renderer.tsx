import { FieldShell } from '@/components/easy-forms/field-shell';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { CheckboxListQuestion, RendererProps } from '@easy-forms/core';

export function CheckboxListRenderer({
	question,
	value,
	onChange,
	onBlur,
	error,
	touched,
}: RendererProps<CheckboxListQuestion>) {
	const showError = touched && !!error;
	const selected = (value ?? []) as (string | number | boolean)[];
	const options = question.options ?? [];
	const disabled = !!question.disabled;

	function toggle(optValue: string | number | boolean) {
		const next = selected.includes(optValue)
			? selected.filter((v) => v !== optValue)
			: [...selected, optValue];
		onChange(next as never);
	}

	const allSelected = options.length > 0 && options.every((opt) => selected.includes(opt.value));
	function toggleAll() {
		onChange((allSelected ? [] : options.map((o) => o.value)) as never);
	}

	return (
		<FieldShell
			id={question.key}
			label={question.label}
			description={question.description}
			error={showError ? error : null}
			required={!!question.required}
		>
			<div
				className={cn('flex gap-3', question.vertical === false ? 'flex-wrap' : 'flex-col')}
				role="group"
				aria-labelledby={question.key}
				aria-invalid={showError || undefined}
				aria-describedby={showError ? `${question.key}-error` : undefined}
				onBlur={onBlur}
			>
				{question.showSelectAll && options.length > 0 ? (
					<div className="flex items-center gap-2 border-b pb-2">
						<Checkbox
							id={`${question.key}-select-all`}
							checked={allSelected}
							disabled={disabled}
							onCheckedChange={toggleAll}
						/>
						<Label htmlFor={`${question.key}-select-all`} className="cursor-pointer">
							{question.selectAllLabel ?? 'Select all'}
						</Label>
					</div>
				) : null}
				{options.map((opt) => {
					const id = `${question.key}-${String(opt.value)}`;
					return (
						<div key={String(opt.value)} className="flex items-center gap-2">
							<Checkbox
								id={id}
								checked={selected.includes(opt.value)}
								disabled={disabled || opt.disabled}
								onCheckedChange={() => toggle(opt.value)}
							/>
							<Label htmlFor={id} className="cursor-pointer">
								{opt.label}
							</Label>
						</div>
					);
				})}
			</div>
		</FieldShell>
	);
}
