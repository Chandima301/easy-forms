'use client';

import { EasyForm } from '@/components/easy-forms/easy-form';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { LiveBadge } from './DemoFrame';
import { type ExampleEntry, examples } from './example-registry';

/**
 * Visual gallery of examples. Each card is a *genuine* engine mini-preview
 * (clipped + non-interactive) that links to the full detail page.
 */
export function ExampleGallery() {
	return (
		<div className="not-prose grid gap-5 sm:grid-cols-2">
			{examples.map((ex) => (
				<GalleryCard key={ex.slug} example={ex} />
			))}
		</div>
	);
}

function GalleryCard({ example }: { example: ExampleEntry }) {
	return (
		<Link
			href={`/docs/examples/${example.slug}`}
			className="group flex flex-col overflow-hidden rounded-xl border border-fd-border bg-fd-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-fd-primary/50 hover:shadow-md"
		>
			<div className="flex items-center gap-2 border-b border-fd-border bg-fd-muted/40 px-4 py-2.5">
				<div className="flex gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
					<span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
				</div>
				<span className="ml-1 font-medium text-sm text-fd-foreground">{example.title}</span>
				<div className="ml-auto">
					<LiveBadge />
				</div>
			</div>

			<div className="relative h-52 overflow-hidden">
				<div className="ef-demo-surface pointer-events-none absolute inset-0 origin-top scale-[0.85] p-5">
					<EasyForm
						schema={example.schema}
						initialValues={example.initialValues}
						showReset={false}
						onSubmit={async () => {}}
					/>
				</div>
				<div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-fd-card via-fd-card/80 to-transparent" />
			</div>

			<div className="flex items-center gap-2 border-t border-fd-border px-4 py-3">
				<p className="text-sm text-fd-muted-foreground">{example.description}</p>
				<ArrowRight className="ml-auto h-4 w-4 shrink-0 text-fd-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-fd-primary" />
			</div>
		</Link>
	);
}
