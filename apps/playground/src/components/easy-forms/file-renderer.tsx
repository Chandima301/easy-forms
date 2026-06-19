import { FieldShell } from '@/components/easy-forms/field-shell';
import { cn } from '@/lib/utils';
import type { FileQuestion, RendererProps } from '@easy-forms/core';

function acceptToString(accept: FileQuestion['accept']): string | undefined {
	if (!accept) return undefined;
	const parts: string[] = [];
	for (const [mime, exts] of Object.entries(accept)) {
		parts.push(mime, ...exts);
	}
	return parts.join(',');
}

export function FileRenderer({
	question,
	value,
	onChange,
	onBlur,
	error,
	touched,
}: RendererProps<FileQuestion>) {
	const showError = touched && !!error;
	const accept = acceptToString(question.accept);
	const files = value ?? [];
	const disabled = !!question.disabled;
	const readOnly = !!question.readOnly;
	const summary =
		files.length === 0
			? 'No file selected'
			: files.length === 1
				? (files[0]?.name ?? '')
				: `${files.length} files`;
	return (
		<FieldShell
			id={question.key}
			label={question.label}
			description={question.description}
			error={showError ? error : null}
			required={!!question.required}
		>
			<label
				htmlFor={question.key}
				className={cn(
					'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
					'cursor-pointer hover:bg-accent',
					disabled && 'cursor-not-allowed opacity-50',
					showError && 'border-destructive'
				)}
			>
				<span className={cn(files.length === 0 && 'text-muted-foreground')}>{summary}</span>
				<span className="text-xs uppercase tracking-wide text-muted-foreground">Browse</span>
				<input
					id={question.key}
					name={question.key}
					type="file"
					accept={accept}
					multiple={question.multiple}
					disabled={disabled || readOnly}
					aria-invalid={showError || undefined}
					aria-describedby={showError ? `${question.key}-error` : undefined}
					className="sr-only"
					onChange={(e) => {
						const list = e.target.files;
						if (!list || list.length === 0) {
							onChange(null);
							return;
						}
						onChange(Array.from(list));
					}}
					onBlur={onBlur}
				/>
			</label>
		</FieldShell>
	);
}
