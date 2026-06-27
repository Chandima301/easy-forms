'use client';

import { getExampleMeta } from '@/lib/examples-meta';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { ComponentPreview } from './ComponentPreview';
import { getExample } from './example-registry';
import { LiveForm } from './LiveForm';

/** Full-width example detail: heading, intro, Preview/Code shell, optional link. */
export function ExampleDetail({ slug }: { slug: string }) {
	const meta = getExampleMeta(slug);
	const example = getExample(slug);
	return (
		<div>
			<Link
				href="/examples"
				className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
			>
				<ArrowLeft className="h-4 w-4" />
				All examples
			</Link>

			<h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{meta.title}</h1>
			<p className="mt-3 max-w-2xl text-fd-muted-foreground">{meta.intro}</p>

			<div className="mt-8">
				<ComponentPreview code={example.code}>
					<LiveForm
						schema={example.schema}
						initialValues={example.initialValues}
						showReset={example.showReset ?? true}
						framed={false}
					/>
				</ComponentPreview>
			</div>

			{meta.seeAlso ? (
				<p className="mt-6 text-sm text-fd-muted-foreground">
					See{' '}
					<Link
						href={meta.seeAlso.href}
						className="inline-flex items-center gap-0.5 font-medium text-fd-primary hover:underline"
					>
						{meta.seeAlso.text}
						<ArrowUpRight className="h-3.5 w-3.5" />
					</Link>{' '}
					for the details.
				</p>
			) : null}
		</div>
	);
}
