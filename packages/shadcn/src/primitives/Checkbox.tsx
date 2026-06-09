import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { cn } from '../lib/cn';

export const Checkbox = forwardRef<
	HTMLButtonElement,
	ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(function Checkbox({ className, ...props }, ref) {
	return (
		<CheckboxPrimitive.Root
			ref={ref}
			className={cn(
				'peer h-4 w-4 shrink-0 rounded-sm border border-slate-300',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-1',
				'disabled:cursor-not-allowed disabled:opacity-50',
				'data-[state=checked]:bg-slate-900 data-[state=checked]:text-white',
				className
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
				<Check className="h-3.5 w-3.5" />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
});
