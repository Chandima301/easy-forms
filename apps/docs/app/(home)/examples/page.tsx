import { ExampleGallery } from '@/components/demo/ExampleGallery';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Examples',
	description:
		'Real, working forms built with Easy Forms — copy-paste recipes, each a live preview of the genuine engine.',
};

export default function ExamplesPage() {
	return (
		<main className="w-full px-6 py-16">
			<div className="mb-10 text-center">
				<span className="text-sm font-semibold text-fd-primary">Examples &amp; templates</span>
				<h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Examples</h1>
				<p className="mx-auto mt-4 max-w-2xl text-fd-muted-foreground">
					Real, working forms you can copy. Every card is a live preview of the genuine engine —
					open one for the full Preview/Code walkthrough.
				</p>
			</div>
			<div className="relative">
				<ExampleGallery />
				{/* Fade the forms out into the page background toward the bottom. */}
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-b from-transparent to-[var(--background)]"
				/>
			</div>
		</main>
	);
}
