// MultiSelect — popover-based selector. Radix Select doesn't support multi
// natively, so we use Popover + a checkbox list.

import type { MultiSelectQuestion, Option, RendererProps } from '@easy-forms/core';
import { ChevronDown } from 'lucide-react';
import { Checkbox } from '../primitives/Checkbox';
import { FieldShell } from '../primitives/FieldShell';
import { Label } from '../primitives/Label';
import { Popover, PopoverContent, PopoverTrigger } from '../primitives/Popover';
import { cn } from '../lib/cn';

export function MultiSelectRenderer({
	question,
	value,
	onChange,
	onBlur,
	error,
	touched,
}: RendererProps<MultiSelectQuestion>) {
	const showError = touched && !!error;
	const options: Option[] = (question.options as Option[] | undefined) ?? [];
	const selected = (value ?? []) as (string | number | boolean)[];
	const selectedLabels = options
		.filter((o) => selected.includes(o.value))
		.map((o) => o.label);
	const placeholder = question.placeholder ?? 'Select...';
	const disabled = !!question.disabled;

	function toggle(optValue: string | number | boolean) {
		const next = selected.includes(optValue)
			? selected.filter((v) => v !== optValue)
			: [...selected, optValue];
		onChange(next as never);
	}

	function selectAll() {
		onChange(options.map((o) => o.value) as never);
	}
	function clearAll() {
		onChange([] as never);
	}

	return (
		<FieldShell
			id={question.key}
			label={question.label}
			description={question.description}
			error={showError ? error : null}
			required={!!question.required}
		>
			<Popover>
				<PopoverTrigger asChild>
					<button
						id={question.key}
						type="button"
						disabled={disabled}
						aria-invalid={showError || undefined}
						aria-describedby={showError ? `${question.key}-error` : undefined}
						onBlur={onBlur}
						className={cn(
							'flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm',
							'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1',
							'disabled:cursor-not-allowed disabled:opacity-50',
							'aria-[invalid=true]:border-red-500'
						)}
					>
						<span className={cn(selectedLabels.length === 0 && 'text-slate-400')}>
							{selectedLabels.length === 0
								? placeholder
								: selectedLabels.length <= 2
									? selectedLabels.join(', ')
									: `${selectedLabels.length} selected`}
						</span>
						<ChevronDown className="h-4 w-4 opacity-50" />
					</button>
				</PopoverTrigger>
				<PopoverContent className="max-h-72 w-[var(--radix-popover-trigger-width)] overflow-auto p-2">
					{question.enableSelectAll ? (
						<div className="flex justify-between border-b border-slate-100 pb-2 mb-2 text-xs">
							<button
								type="button"
								className="text-slate-700 underline-offset-2 hover:underline"
								onClick={selectAll}
							>
								Select all
							</button>
							<button
								type="button"
								className="text-slate-700 underline-offset-2 hover:underline"
								onClick={clearAll}
							>
								Clear
							</button>
						</div>
					) : null}
					<div className="flex flex-col gap-1.5">
						{options.map((opt) => {
							const id = `${question.key}-${String(opt.value)}`;
							const isChecked = selected.includes(opt.value);
							return (
								<div
									key={String(opt.value)}
									className="flex items-center gap-2 rounded px-1 py-1 hover:bg-slate-50"
								>
									<Checkbox
										id={id}
										checked={isChecked}
										disabled={opt.disabled}
										onCheckedChange={() => toggle(opt.value)}
									/>
									<Label htmlFor={id} className="cursor-pointer text-sm">
										{opt.label}
									</Label>
								</div>
							);
						})}
					</div>
				</PopoverContent>
			</Popover>
		</FieldShell>
	);
}
