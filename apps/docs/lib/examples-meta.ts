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
	{
		slug: 'contact',
		title: 'Contact form',
		description: 'Name, email, and a required message.',
		intro:
			'The classic contact form — name, email, and a required message, each with inline validation.',
	},
	{
		slug: 'newsletter-preferences',
		title: 'Newsletter preferences',
		description: 'Conditional groups — preferences appear once you subscribe.',
		intro:
			'A whole section of preferences appears only after the visitor opts in. The group is CSS-hidden while collapsed, so its field state survives toggling.',
		seeAlso: { text: 'Conditional groups', href: '/docs/dynamic/conditional-groups' },
	},
	{
		slug: 'async-username',
		title: 'Async username check',
		description: 'A custom async validator checks availability.',
		intro:
			'The username field runs a custom async validator that simulates a backend availability check. Try "ada" or "admin" — both are taken.',
		seeAlso: { text: 'Custom & async validation', href: '/docs/validation/custom-async' },
	},
	{
		slug: 'survey',
		title: 'Survey / feedback',
		description: 'Radios, multi-select, and a conditional "Other" field.',
		intro:
			'A feedback survey mixing a radio group, a multi-select, and a text field that appears (and becomes required) only when you choose "Other".',
		seeAlso: { text: 'propsDependsOn', href: '/docs/dynamic/props-depends-on' },
	},
	{
		slug: 'job-application',
		title: 'Job application',
		description: 'File upload, a date, grouped layout, and validation.',
		intro:
			'A grouped application form: applicant details, a résumé upload (PDF, max 5 MB), and an availability date that cannot be in the past.',
		seeAlso: { text: 'File control', href: '/docs/components/file' },
	},
	{
		slug: 'change-password',
		title: 'Change password',
		description: 'Cross-field "passwords must match" validation.',
		intro:
			'The confirmation field runs a custom validator against the new-password field — a classic cross-field rule — and the new password requires a minimum length.',
		seeAlso: { text: 'Custom & async validation', href: '/docs/validation/custom-async' },
	},
	{
		slug: 'login',
		title: 'Sign in',
		description: 'Email, password, and a remember-me checkbox.',
		intro:
			'A minimal sign-in form — email and password with inline validation, plus a remember-me checkbox.',
	},
	{
		slug: 'event-rsvp',
		title: 'Event RSVP',
		description: 'Attendance radio, guest count, and dietary needs.',
		intro:
			'An RSVP form: confirm attendance, set a guest count, and pick any dietary requirements from a multi-select.',
	},
	{
		slug: 'feedback',
		title: 'Quick feedback',
		description: 'A rating radio group and an optional comment.',
		intro:
			'A compact feedback widget — a required satisfaction rating and an optional free-text comment.',
	},
];

export function getExampleMeta(slug: string): ExampleMeta {
	const meta = exampleMeta.find((m) => m.slug === slug);
	if (!meta) throw new Error(`Unknown example: ${slug}`);
	return meta;
}
