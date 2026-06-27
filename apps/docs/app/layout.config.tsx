import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

/**
 * Shared layout options (nav, links) used by both the docs layout and the
 * home/marketing layout so the top bar stays consistent across the site.
 */
export const baseOptions: BaseLayoutProps = {
	nav: {
		title: (
			<span className="inline-flex items-center gap-2 font-semibold">
				{/* Static asset (not inline SVG): fumadocs renders this title in
				    several nav variants, and an inline <linearGradient> with a fixed
				    id collides across the hidden/visible copies, painting the tile
				    transparent. An <img> scopes the gradient to its own document. */}
				<img
					src="/easy-forms-icon.svg"
					alt=""
					width={24}
					height={24}
					className="h-6 w-6"
				/>
				<span className="text-[15px] tracking-tight">
					easy-
					<span
						style={{
							background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
							WebkitBackgroundClip: 'text',
							backgroundClip: 'text',
							color: 'transparent',
						}}
					>
						forms
					</span>
				</span>
			</span>
		),
	},
	links: [
		{ text: 'Docs', url: '/docs', active: 'nested-url' },
		{ text: 'Examples', url: '/examples' },
		{ text: 'Enterprise', url: '/enterprise' },
	],
	githubUrl: 'https://github.com/Chandima301/easy-forms',
};
