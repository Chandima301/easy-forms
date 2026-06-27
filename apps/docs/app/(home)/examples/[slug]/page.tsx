import { ExampleDetail } from '@/components/demo/ExampleDetail';
import { exampleMeta } from '@/lib/examples-meta';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
	return exampleMeta.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata(props: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await props.params;
	const meta = exampleMeta.find((m) => m.slug === slug);
	if (!meta) return {};
	return { title: meta.title, description: meta.description };
}

export default async function ExampleDetailPage(props: { params: Promise<{ slug: string }> }) {
	const { slug } = await props.params;
	if (!exampleMeta.some((m) => m.slug === slug)) notFound();
	return (
		<main className="mx-auto w-full max-w-4xl px-4 py-12">
			<ExampleDetail slug={slug} />
		</main>
	);
}
