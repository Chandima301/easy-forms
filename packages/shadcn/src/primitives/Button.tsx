import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../lib/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'default' | 'outline' | 'ghost';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ className, variant = 'default', type = 'button', ...props },
	ref
) {
	const base =
		'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium ' +
		'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ' +
		'disabled:cursor-not-allowed disabled:opacity-50';
	const variantClasses = {
		default: 'bg-slate-900 text-white hover:bg-slate-800',
		outline: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50',
		ghost: 'text-slate-900 hover:bg-slate-100',
	}[variant];
	return (
		<button ref={ref} type={type} className={cn(base, variantClasses, className)} {...props} />
	);
});
