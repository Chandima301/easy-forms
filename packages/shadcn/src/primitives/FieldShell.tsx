import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Label } from './Label';

export interface FieldShellProps {
	id: string;
	label: string;
	description?: string;
	error?: string | null;
	required?: boolean;
	className?: string;
	children: ReactNode;
}

/** Common wrapper for a labelled field with optional description and inline error. */
export function FieldShell({
	id,
	label,
	description,
	error,
	required,
	className,
	children,
}: FieldShellProps) {
	const descriptionId = description ? `${id}-description` : undefined;
	const errorId = error ? `${id}-error` : undefined;
	return (
		<div className={cn('easy-forms-field flex flex-col gap-1.5', className)}>
			<Label htmlFor={id}>
				{label}
				{required ? <span className="ml-0.5 text-red-500">*</span> : null}
			</Label>
			{children}
			{description ? (
				<p id={descriptionId} className="text-xs text-slate-500">
					{description}
				</p>
			) : null}
			{error ? (
				<p id={errorId} className="text-xs font-medium text-red-600">
					{error}
				</p>
			) : null}
		</div>
	);
}
