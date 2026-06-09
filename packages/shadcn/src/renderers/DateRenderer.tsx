// Date — uses the native `<input type="date">`. Cross-browser the styling is
// imperfect, but it's keyboard-accessible, free, and ships with a date picker.
// A Radix-Popover-based calendar can replace this later without breaking the
// `DateQuestion` contract.

import type { DateQuestion, RendererProps } from '@easy-forms/core';
import { useFormStoreContext } from '@easy-forms/core';
import { FieldShell } from '../primitives/FieldShell';
import { Input } from '../primitives/Input';

function resolveBoundary(
	bound: DateQuestion['minDate'] | DateQuestion['maxDate'],
	values: Record<string, unknown>
): string | undefined {
	if (bound == null) return undefined;
	if (typeof bound === 'string') return bound;
	return bound(values);
}

export function DateRenderer({
	question,
	value,
	onChange,
	onBlur,
	error,
	touched,
}: RendererProps<DateQuestion>) {
	const showError = touched && !!error;
	const store = useFormStoreContext();
	const values = store.getValues();
	// minDate / maxDate may have been set dynamically by `propsDependsOn` and
	// already merged into the effective question. Static values may be a
	// string or a `(values) => string` function; both resolve here.
	const min = resolveBoundary(question.minDate, values);
	const max = resolveBoundary(question.maxDate, values);

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
				type="date"
				value={value ?? ''}
				placeholder={question.placeholder}
				min={min}
				max={max}
				disabled={!!question.disabled}
				readOnly={!!question.readOnly}
				aria-invalid={showError || undefined}
				aria-describedby={showError ? `${question.key}-error` : undefined}
				onChange={(e) => onChange(e.target.value || null)}
				onBlur={onBlur}
			/>
		</FieldShell>
	);
}
