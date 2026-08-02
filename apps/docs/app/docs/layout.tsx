import { baseOptions } from '@/app/layout.config';
import { DocsSidebarFooter } from '@/components/layout/DocsSidebarFooter';
import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
	return (
		// `DocsLayout` (unlike `HomeLayout`) doesn't filter `links` by `on:
		// 'nav'` — it renders every non-icon link above the page tree. Passing
		// `links={[]}` after the spread empties that list so the sidebar opens
		// on "Get started"; `getLinks` still synthesizes the GitHub icon link
		// from `githubUrl`, so the GitHub button survives. The site links move
		// to a quiet footer instead so they stay reachable from every doc page.
		<DocsLayout
			tree={source.pageTree}
			{...baseOptions}
			links={[]}
			sidebar={{ footer: <DocsSidebarFooter /> }}
		>
			{children}
		</DocsLayout>
	);
}
