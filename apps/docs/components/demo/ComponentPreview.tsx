'use client';

import { CodePane } from '@/components/code/CodePane';
import { CopyButton } from '@/components/ui/CopyButton';
import { type ReactNode, useState } from 'react';
import { DemoFrame, LiveBadge } from './DemoFrame';

export interface ComponentPreviewProps {
	/** The live demo rendered on the preview window surface. */
	children: ReactNode;
	/** Source snippet shown on the Code tab. */
	code: string;
	/** Filename shown in the Code tab's title bar (default "schema.tsx"). */
	filename?: string;
	/** Prism language for the snippet (default "tsx"). */
	language?: string;
	/** Body padding/scroll class for the preview surface (default "p-5"). */
	previewClassName?: string;
	className?: string;
}

/**
 * MagicUI-style Preview/Code primitive: a segmented tab control over a shared
 * window surface. The Preview tab renders the genuine engine on the `DemoFrame`
 * chrome; the Code tab shows the source with a filename bar + copy button.
 */
export function ComponentPreview({
	children,
	code,
	filename = 'schema.tsx',
	language = 'tsx',
	previewClassName = 'p-5',
	className,
}: ComponentPreviewProps) {
	const [tab, setTab] = useState<'preview' | 'code'>('preview');

	return (
		<div className={['not-prose flex flex-col gap-3', className ?? ''].join(' ')}>
			<div className="inline-flex items-center gap-1 self-start rounded-full border border-fd-border bg-fd-card p-1">
				{(['preview', 'code'] as const).map((t) => (
					<button
						key={t}
						type="button"
						onClick={() => setTab(t)}
						className={[
							'rounded-full px-4 py-1 text-sm font-medium capitalize transition-colors',
							tab === t
								? 'bg-fd-primary text-fd-primary-foreground'
								: 'text-fd-muted-foreground hover:text-fd-foreground',
						].join(' ')}
					>
						{t}
					</button>
				))}
			</div>

			{tab === 'preview' ? (
				<DemoFrame title="Preview" accent={<LiveBadge />} bodyClassName={previewClassName}>
					{children}
				</DemoFrame>
			) : (
				<DemoFrame
					title={filename}
					className="bg-[var(--ef-code-bg)]"
					accent={
						<CopyButton
							value={code}
							className="text-fd-muted-foreground hover:text-fd-foreground"
						/>
					}
					bodyClassName="max-h-[480px] overflow-auto bg-[var(--ef-code-bg)]"
				>
					<CodePane code={code} language={language} />
				</DemoFrame>
			)}
		</div>
	);
}
