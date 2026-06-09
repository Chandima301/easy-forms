import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

/**
 * Shared layout options (nav, links) used by both the docs layout and the
 * home/marketing layout so the top bar stays consistent across the site.
 */
export const baseOptions: BaseLayoutProps = {
	nav: {
		title: (
			<span className="inline-flex items-center gap-2 font-semibold">
				<span className="grid h-6 w-6 place-items-center rounded-md bg-fd-primary text-fd-primary-foreground text-[13px] font-bold">
					E
				</span>
				<span>Easy Forms</span>
			</span>
		),
	},
	links: [
		{ text: 'Docs', url: '/docs', active: 'nested-url' },
		{ text: 'Playground', url: '/playground' },
		{ text: 'Examples', url: '/docs/examples' },
		{ text: 'Enterprise', url: '/enterprise' },
	],
	githubUrl: 'https://github.com/Chandima301/easy-forms',
};
