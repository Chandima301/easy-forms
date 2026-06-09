import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
	{ className, ...props },
	ref
) {
	return (
		<textarea
			ref={ref}
			className={cn(
				'flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm',
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
