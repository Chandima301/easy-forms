import { SchemaStudio } from '@/components/demo/SchemaStudio';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Playground',
	description: 'Edit a schema as JSON and watch the real Easy Forms engine render it live.',
};

export default function PlaygroundPage() {
	return (
		<main className="mx-auto w-full max-w-6xl px-4 py-12">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Schema Studio</h1>
				<p className="mt-2 max-w-2xl text-fd-muted-foreground">
					Edit the schema on the left as JSON. The form on the right is rendered by the genuine{' '}
					<code className="rounded bg-fd-muted px-1.5 py-0.5 text-sm">@easy-forms/core</code> engine
					with the shadcn renderer registry. Share your schema with the copy link button — it
					encodes the schema in the URL.
				</p>
			</div>
			<SchemaStudio />
		</main>
	);
}
