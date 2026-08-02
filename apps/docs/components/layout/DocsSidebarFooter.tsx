import { LayoutGrid, Mail, Tag } from 'lucide-react';
import Link from 'next/link';

const links = [
	{ label: 'Examples', href: '/examples', icon: LayoutGrid },
	{ label: 'Pricing', href: '/pricing', icon: Tag },
	{ label: 'Contact', href: '/contact', icon: Mail },
];

/**
 * Quiet site-link row for the docs sidebar footer. `DocsLayout` doesn't
 * filter `baseOptions.links` by `on: 'nav'` (that's a HomeLayout-only
 * behavior), so `apps/docs/app/docs/layout.tsx` passes `links={[]}` to keep
 * the sidebar's link list empty and renders this instead — small and muted
 * so it reads as a footer, not a second nav competing with the page tree.
 */
export function DocsSidebarFooter() {
	return (
		<ul className="mt-3 flex flex-col gap-1 border-t border-fd-border pt-3 text-xs text-fd-muted-foreground">
			{links.map(({ label, href, icon: Icon }) => (
				<li key={href}>
					<Link
						href={href}
						className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:text-fd-foreground"
					>
						<Icon className="h-3.5 w-3.5" />
						{label}
					</Link>
				</li>
			))}
		</ul>
	);
}
