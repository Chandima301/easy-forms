import type { NumberQuestion, RendererProps } from '@easy-forms/core';
import { useEffect, useState } from 'react';
import { FieldShell } from '../primitives/FieldShell';
import { Input } from '../primitives/Input';

function formatThousands(n: number, decimalScale: number | undefined): string {
	const opts: Intl.NumberFormatOptions = {};
	if (decimalScale !== undefined) {
		opts.minimumFractionDigits = decimalScale;
		opts.maximumFractionDigits = decimalScale;
	}
	return n.toLocaleString('en-US', opts);
}

function parseNumber(raw: string): number | null {
	const cleaned = raw.replace(/[\s,]/g, '');
	if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
	const n = Number(cleaned);
	return Number.isFinite(n) ? n : null;
}

export function NumberRenderer({
	question,
	value,
	onChange,
	onBlur,
	error,
	touched,
}: RendererProps<NumberQuestion>) {
	const showError = touched && !!error;
	// Local string state so the user can type intermediate values like "-" or "12."
	const [draft, setDraft] = useState<string>(() => {
		if (value == null) return '';
		return question.allowThousandSeparator
			? formatThousands(value, question.decimalScale)
			: String(value);
	});

	useEffect(() => {
		// When the form-level value changes externally (reset, dep), resync the draft.
		if (value == null) {
			setDraft('');
		} else {
			const formatted = question.allowThousandSeparator
				? formatThousands(value, question.decimalScale)
				: String(value);
			setDraft((current) => (parseNumber(current) === value ? current : formatted));
		}
	}, [value, question.allowThousandSeparator, question.decimalScale]);

	return (
		<FieldShell
			id={question.key}
			label={question.label}
			description={question.description}
			error={showError ? error : null}
			required={!!question.required}
		>
			<div className="relative flex items-center">
				{question.prefix ? (
					<span className="pointer-events-none absolute left-3 text-sm text-slate-500">
						{question.prefix}
					</span>
				) : null}
				<Input
					id={question.key}
					name={question.key}
					type="text"
					inputMode="decimal"
					value={draft}
					placeholder={question.placeholder}
					disabled={!!question.disabled}
					readOnly={!!question.readOnly}
					className={[question.prefix ? 'pl-7' : '', question.suffix ? 'pr-7' : '']
						.filter(Boolean)
						.join(' ')}
					aria-invalid={showError || undefined}
					aria-describedby={showError ? `${question.key}-error` : undefined}
					onChange={(e) => {
						setDraft(e.target.value);
						onChange(parseNumber(e.target.value));
					}}
					onBlur={() => {
						// On blur, reformat with thousand separators if enabled.
						const parsed = parseNumber(draft);
						if (parsed != null && question.allowThousandSeparator) {
							setDraft(formatThousands(parsed, question.decimalScale));
						}
						onBlur();
					}}
				/>
				{question.suffix ? (
					<span className="pointer-events-none absolute right-3 text-sm text-slate-500">
						{question.suffix}
					</span>
				) : null}
			</div>
		</FieldShell>
	);
}
