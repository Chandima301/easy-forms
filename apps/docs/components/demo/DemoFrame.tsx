import type { ReactNode } from 'react';

/**
 * A polished "window" frame used to wrap both code panes and live form panes so
 * demos read as a product surface rather than a raw embed.
 */
export function DemoFrame({
	title,
	accent,
	children,
	className,
	bodyClassName,
}: {
	title?: string;
	/** Small label on the right of the title bar, e.g. "Live". */
	accent?: ReactNode;
	children: ReactNode;
	className?: string;
	bodyClassName?: string;
}) {
	return (
		<div
			className={[
				'overflow-hidden rounded-xl border border-fd-border bg-fd-card shadow-sm',
				className ?? '',
			].join(' ')}
		>
			<div className="flex items-center gap-2 border-b border-fd-border bg-fd-muted/40 px-4 py-2.5">
				<div className="flex gap-1.5">
					<span className="h-3 w-3 rounded-full bg-red-400/80" />
					<span className="h-3 w-3 rounded-full bg-amber-400/80" />
					<span className="h-3 w-3 rounded-full bg-emerald-400/80" />
				</div>
				{title ? (
					<span className="ml-1.5 font-mono text-xs text-fd-muted-foreground">{title}</span>
				) : null}
				{accent ? <div className="ml-auto">{accent}</div> : null}
			</div>
			<div className={bodyClassName ?? 'p-5'}>{children}</div>
		</div>
	);
}

export function LiveBadge() {
	return (
		<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
			<span className="relative flex h-1.5 w-1.5">
				<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
				<span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
			</span>
			Live
		</span>
	);
}
