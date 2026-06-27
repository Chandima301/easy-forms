// Server-safe metadata for the examples gallery + detail pages. Pure data (no
// functions), so the server route handlers can read it for generateStaticParams,
// metadata, and page headers. The runtime schema/code lives in the client-only
// `components/demo/example-registry` (it carries functions); the two are tied by
// `slug`. Keep this list in display order — the gallery and nav follow it.

export interface ExampleMeta {
	slug: string;
	/** Card + page title. */
	title: string;
	/** One-line card subtitle. */
	description: string;
	/** Intro paragraph on the detail page. */
	intro: string;
	/** Optional "see also" link under the demo. */
	seeAlso?: { text: string; href: string };
}

export const exampleMeta: ExampleMeta[] = [
	{
		slug: 'signup',
		title: 'Sign up',
		description: 'Grid layout, validation, and a required terms checkbox.',
		intro:
			'A polished signup form with a two-column grid, built-in validation, and a required terms checkbox backed by a custom message.',
	},
	{
		slug: 'checkout-wizard',
		title: 'Checkout wizard',
		description: 'Multi-step with a conditional step and per-step validation.',
		intro:
			'The "Shipping notes" step appears only when expedited shipping is requested. Each step validates before advancing.',
		seeAlso: { text: 'Wizards', href: '/docs/wizard' },
	},
	{
		slug: 'dependent-dropdowns',
		title: 'Dependent dropdowns',
		description: 'Country → region, driven by one propsDependsOn rule.',
		intro:
			'Choosing a country populates the region options and enables the field — one propsDependsOn rule does it all.',
		seeAlso: { text: 'propsDependsOn', href: '/docs/dynamic/props-depends-on' },
	},
	{
		slug: 'order-calculator',
		title: 'Order calculator',
		description: 'A live total via valueDependsOn.',
		intro:
			'Edit quantity or unit price — the total recomputes instantly and never marks the form dirty on its own.',
		seeAlso: { text: 'valueDependsOn', href: '/docs/dynamic/value-depends-on' },
	},
];

export function getExampleMeta(slug: string): ExampleMeta {
	const meta = exampleMeta.find((m) => m.slug === slug);
	if (!meta) throw new Error(`Unknown example: ${slug}`);
	return meta;
}
