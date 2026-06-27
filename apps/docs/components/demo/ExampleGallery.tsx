'use client';

import { EasyForm } from '@/components/easy-forms/easy-form';
import { type ExampleMeta, exampleMeta } from '@/lib/examples-meta';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { getExample } from './example-registry';

/**
 * Masonry gallery. Each card *is* the genuine form at its natural size — the
 * `.easy-forms` surface already carries the border/padding/shadow, so we add no
 * second card chrome around it, only a compact text label above. The form is
 * display-only; the whole tile links to the detail page.
 */
export function ExampleGallery() {
	return (
		<div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
			{exampleMeta.map((meta) => (
				<GalleryCard key={meta.slug} meta={meta} />
			))}
		</div>
	);
}

function GalleryCard({ meta }: { meta: ExampleMeta }) {
	const example = getExample(meta.slug);
	return (
		<Link href={`/examples/${meta.slug}`} className="group mb-5 block break-inside-avoid">
			<div className="mb-2 flex items-center gap-2 px-1">
				<span className="font-medium text-sm text-fd-foreground">{meta.title}</span>
				<span className="truncate text-xs text-fd-muted-foreground">{meta.description}</span>
				<ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-fd-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:text-fd-primary" />
			</div>
			<div className="ef-demo-surface pointer-events-none select-none rounded-xl ring-1 ring-transparent transition group-hover:ring-2 group-hover:ring-fd-primary/40">
				<EasyForm
					schema={example.schema}
					initialValues={example.initialValues}
					showReset={false}
					onSubmit={async () => {}}
				/>
			</div>
		</Link>
	);
}
