'use client';

import { type ReactNode, useEffect, useRef } from 'react';

/**
 * One-shot scroll reveal. Adds `.is-visible` (see `.ef-reveal` in global.css)
 * when the element first enters the viewport. Honors `prefers-reduced-motion`
 * by revealing immediately.
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			el.classList.add('is-visible');
			return;
		}

		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible');
						io.unobserve(entry.target);
					}
				}
			},
			{ threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	return (
		<div ref={ref} className={['ef-reveal', className ?? ''].join(' ')}>
			{children}
		</div>
	);
}
