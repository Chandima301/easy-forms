'use client';

// Pro previews load from a separate PRIVATE app. The Pro renderer source must
// never enter this public repo, so the Preview tab is an iframe rather than an
// in-repo component. No license key is set on that app: keys are not
// domain-bound, so shipping one to the browser would leak it. The unlicensed
// watermark is therefore expected inside the frame, and is documented on-page.
//
// With NEXT_PUBLIC_EF_EMBED_URL unset the Preview tab renders a static panel, so
// local dev, CI, and preview deploys never depend on that second app existing.
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import { ComponentPreview } from './ComponentPreview';

const EMBED_BASE = process.env.NEXT_PUBLIC_EF_EMBED_URL;

export interface ProEmbedProps {
	/** Embed route on the examples app, e.g. "repeating-group". */
	name: string;
	/** Source snippet for the Code tab. */
	code: string;
	/** Accessible name for the iframe. */
	title: string;
	/** Height reserved before the first height message, to avoid layout shift. */
	minHeight?: number;
}

export function ProEmbed({ name, code, title, minHeight = 420 }: ProEmbedProps) {
	return (
		<ComponentPreview code={code} previewClassName="p-0">
			{EMBED_BASE ? (
				<ProIframe base={EMBED_BASE} name={name} title={title} minHeight={minHeight} />
			) : (
				<ProEmbedFallback />
			)}
		</ComponentPreview>
	);
}

function ProIframe({
	base,
	name,
	title,
	minHeight,
}: {
	base: string;
	name: string;
	title: string;
	minHeight: number;
}) {
	const { resolvedTheme } = useTheme();
	const holder = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);
	const [height, setHeight] = useState(minHeight);

	// Defer booting the embedded app until the reader scrolls near it.
	useEffect(() => {
		const el = holder.current;
		if (!el) return;
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					setVisible(true);
					io.disconnect();
				}
			},
			{ rootMargin: '200px' }
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	useEffect(() => {
		const origin = new URL(base).origin;
		function onMessage(event: MessageEvent) {
			if (event.origin !== origin) return;
			const data = event.data as { type?: string; height?: number } | null;
			if (data?.type !== 'ef-embed-height' || typeof data.height !== 'number') return;
			setHeight(Math.max(minHeight, Math.ceil(data.height)));
		}
		window.addEventListener('message', onMessage);
		return () => window.removeEventListener('message', onMessage);
	}, [base, minHeight]);

	const theme = resolvedTheme === 'dark' ? 'dark' : 'light';
	const src = `${base.replace(/\/$/, '')}/embed/${name}?theme=${theme}`;

	return (
		<div ref={holder} style={{ minHeight }}>
			{visible ? (
				<iframe
					src={src}
					title={title}
					loading="lazy"
					style={{ display: 'block', width: '100%', height, border: 0 }}
				/>
			) : null}
		</div>
	);
}

function ProEmbedFallback() {
	return (
		<div className="flex flex-col items-start gap-2 p-6 text-sm">
			<span className="rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
				Pro
			</span>
			<p className="text-fd-muted-foreground">
				The live preview for this Pro component is not configured in this environment. The Code tab
				shows the full schema, and{' '}
				<a className="font-medium text-fd-primary hover:underline" href="/pricing">
					Easy Forms Pro
				</a>{' '}
				covers what it renders.
			</p>
		</div>
	);
}
