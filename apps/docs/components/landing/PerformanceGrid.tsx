'use client';

import { useEffect, useRef, useState } from 'react';

/** The 24-cell render-isolation grid: cells stagger in on scroll; the one
 *  "edited" cell pulses. Honors `prefers-reduced-motion`. */
export function PerformanceGrid() {
	const ref = useRef<HTMLDivElement>(null);
	const [shown, setShown] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			setShown(true);
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setShown(true);
						io.disconnect();
					}
				}
			},
			{ threshold: 0.2 }
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className="grid grid-cols-4 gap-2 rounded-xl border border-fd-border bg-fd-card p-5 sm:grid-cols-6"
		>
			{Array.from({ length: 24 }).map((_, i) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative grid, never reordered
					key={`cell-${i}`}
					style={{ transitionDelay: shown ? `${i * 25}ms` : '0ms' }}
					className={[
						'aspect-square rounded-md border transition-all duration-300 ease-out motion-reduce:transition-none',
						shown ? 'scale-100 opacity-100' : 'scale-90 opacity-0',
						i === 9
							? 'ef-pulse border-fd-primary bg-fd-primary/20 text-fd-primary'
							: 'border-fd-border bg-fd-muted/40',
					].join(' ')}
				/>
			))}
			<p className="col-span-full mt-1 text-center text-xs text-fd-muted-foreground">
				24 fields rendered — editing one repaints just the highlighted cell.
			</p>
		</div>
	);
}
