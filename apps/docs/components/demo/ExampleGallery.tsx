'use client';

import { EasyForm } from '@/components/easy-forms/easy-form';
import { type ExampleMeta, exampleMeta } from '@/lib/examples-meta';
import Link from 'next/link';
import { getExample } from './example-registry';

/**
 * Four-column masonry gallery. Every card is one column wide, so CSS multi-column
 * packs them with no gaps — shorter cards backfill under taller ones automatically.
 * Each card *is* the genuine form at its natural size — the `.easy-forms` surface
 * already carries the border/padding/shadow, so we add no second card chrome
 * around it. The form is display-only; the whole tile links to the detail page.
 */
export function ExampleGallery() {
	return (
		<div className="columns-1 gap-5 sm:columns-2 xl:columns-4">
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
			<div className="ef-gallery-card ef-demo-surface pointer-events-none select-none rounded-xl ring-1 ring-transparent transition group-hover:ring-2 group-hover:ring-fd-primary/40">
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
