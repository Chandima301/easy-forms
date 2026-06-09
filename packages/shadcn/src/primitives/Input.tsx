import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
	{ className, type = 'text', ...props },
	ref
) {
	return (
		<input
			ref={ref}
			type={type}
			className={cn(
				'flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm',
				'placeholder:text-slate-400',
				'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1',
				'disabled:cursor-not-allowed disabled:opacity-50',
				'aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500',
				className
			)}
			{...props}
		/>
	);
});
