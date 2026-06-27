import Link from 'next/link';

export default function NotFound() {
	return (
		<main className="flex flex-1 flex-col items-center justify-center px-4 py-32 text-center">
			<p className="font-mono text-sm font-semibold text-fd-primary">404</p>
			<h1 className="mt-3 text-3xl font-bold tracking-tight">This page took a different path</h1>
			<p className="mt-3 max-w-md text-fd-muted-foreground">
				The page you're looking for doesn't exist. Try the documentation, or browse the examples.
			</p>
			<div className="mt-7 flex flex-wrap justify-center gap-3">
				<Link
					href="/docs"
					className="rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground"
				>
					Read the docs
				</Link>
				<Link
					href="/"
					className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-semibold"
				>
					Back home
				</Link>
			</div>
		</main>
	);
}
