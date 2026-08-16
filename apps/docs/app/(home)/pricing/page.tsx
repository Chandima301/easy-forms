import { ArrowRight, Check, Minus, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'Pricing',
	description:
		'Easy Forms is MIT and free forever. Pro adds repeating groups and branching wizards at $199 per seat per year.',
};

const POLAR_CHECKOUT = 'https://buy.polar.sh/polar_cl_wRwAZKdSs5Oqdd8bSfIpgza3caqqPlkOKel7P1qvElJ';

const FREE_FEATURES = [
	'Full schema engine — validation, dependencies, wizard',
	'12 controls + the renderer registry',
	'Own-the-code renderers via shadcn',
	'Strict TypeScript, dual ESM/CJS, tree-shakeable',
	'MIT licensed, forever',
];

const PRO_FEATURES = [
	'Everything in Free',
	'Repeating groups — line items with bounds and per-row dependencies',
	'Branching wizards — the next step computed from answers',
	'The private @ef-pro renderer registry',
	'Your license keeps working forever on every version released during your term',
];

const COMPARISON: { feature: string; free: boolean; pro: boolean }[] = [
	{ feature: 'Schema, validation, dependencies', free: true, pro: true },
	{ feature: '12 controls + renderer registry', free: true, pro: true },
	{ feature: 'Linear multi-step wizard', free: true, pro: true },
	{ feature: 'Plugins (autosave, logging)', free: true, pro: true },
	{ feature: 'Repeating groups', free: false, pro: true },
	{ feature: 'Branching (non-linear) wizard', free: false, pro: true },
];

const ROADMAP = [
	'SSO / SAML-aware field packs',
	'First-party audit-log plugin',
	'SOC 2 posture & compliance documentation',
	'Private renderer registry distribution',
	'Priority support with response SLAs',
	'Design-system theming presets',
];

const FAQ: { q: string; a: string }[] = [
	{
		q: 'Is the free version really MIT?',
		a: 'Yes. @easy-forms/core is MIT licensed with no usage limits, no telemetry, and no seat counting. It stays that way.',
	},
	{
		q: 'What happens when my Pro license expires?',
		a: 'Nothing breaks. A license is validated against the release date of the version you have installed, not the clock — so every version published during your paid term keeps working forever. Renewing gets you versions released after that.',
	},
	{
		q: 'Do CI machines and contractors need seats?',
		a: 'Seats count developers who write code against Pro, so contractors do. CI does not — builds are not seats.',
	},
	{
		q: 'What exactly is in Pro?',
		a: 'Two features: repeating groups and branching wizards. The behaviour ships in @easy-forms/pro on npm; the markup ships as ejectable components in the private @ef-pro registry, so you still own the code.',
	},
];

export default function PricingPage() {
	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-16">
			<div className="text-center">
				<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
					Free to start. Pro when you need it.
				</h1>
				<p className="mx-auto mt-4 max-w-2xl text-fd-muted-foreground">
					The engine, all 12 controls, validation, dependencies, and the linear wizard are MIT and
					free forever. Pro adds repeating groups and branching wizards.
				</p>
			</div>

			<div className="mt-12 grid gap-5 md:grid-cols-2">
				<div className="flex flex-col rounded-2xl border border-fd-border bg-fd-card p-7">
					<h2 className="text-sm font-bold uppercase tracking-wider text-fd-muted-foreground">
						Free
					</h2>
					<p className="mt-3 text-4xl font-extrabold tracking-tight">
						$0
						<span className="ml-1 text-sm font-medium text-fd-muted-foreground">/ forever</span>
					</p>
					<ul className="mt-6 flex-1 space-y-2.5 text-sm text-fd-muted-foreground">
						{FREE_FEATURES.map((f) => (
							<li key={f} className="flex gap-2">
								<Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
								{f}
							</li>
						))}
					</ul>
					<Link
						href="/docs/quick-start"
						className="mt-7 rounded-lg border border-fd-border px-5 py-2.5 text-center text-sm font-semibold transition-colors hover:bg-fd-muted"
					>
						Get started
					</Link>
				</div>

				<div className="relative flex flex-col rounded-2xl border-2 border-fd-primary bg-fd-card p-7 shadow-sm">
					<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
						Recommended
					</span>
					<h2 className="text-sm font-bold uppercase tracking-wider text-fd-muted-foreground">
						Pro
					</h2>
					<p className="mt-3 text-4xl font-extrabold tracking-tight">
						$199
						<span className="ml-1 text-sm font-medium text-fd-muted-foreground">/ seat / year</span>
					</p>
					<ul className="mt-6 flex-1 space-y-2.5 text-sm text-fd-muted-foreground">
						{PRO_FEATURES.map((f) => (
							<li key={f} className="flex gap-2">
								<Check className="mt-0.5 h-4 w-4 shrink-0 text-fd-primary" aria-hidden="true" />
								{f}
							</li>
						))}
					</ul>
					<a
						href={POLAR_CHECKOUT}
						className="mt-7 inline-flex items-center justify-center gap-1.5 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground"
					>
						Buy Easy Forms Pro <ArrowRight className="h-4 w-4" aria-hidden="true" />
					</a>
				</div>
			</div>

			<div className="mt-5 flex flex-col gap-4 rounded-2xl border border-fd-border bg-fd-muted/40 p-7 sm:flex-row sm:items-center">
				<div className="flex-1">
					<h2 className="text-sm font-bold uppercase tracking-wider text-fd-muted-foreground">
						Enterprise
					</h2>
					<p className="mt-2 text-sm text-fd-muted-foreground">
						Volume seat pricing, invoicing and purchase orders, priority support, and help with your
						security review.
					</p>
				</div>
				<Link
					href="/contact"
					className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-fd-border bg-fd-card px-5 py-2.5 text-sm font-semibold"
				>
					Contact us <ArrowRight className="h-4 w-4" aria-hidden="true" />
				</Link>
			</div>

			<h2 className="mt-16 text-2xl font-bold tracking-tight">Compare</h2>
			<div className="mt-5 overflow-x-auto">
				{/* No min-width below `sm`: a 480px floor on a 375px screen escapes the
				    overflow-x container and scrolls the whole page sideways. From `sm`
				    up the container is wide enough for the floor to only ever govern
				    the inner scroll. */}
				<table className="w-full border-collapse text-sm sm:min-w-[480px]">
					<thead>
						<tr className="border-b border-fd-border text-left">
							<th className="py-2.5 pr-4 font-semibold">Feature</th>
							<th className="w-24 py-2.5 text-center font-semibold">Free</th>
							<th className="w-24 py-2.5 text-center font-semibold">Pro</th>
						</tr>
					</thead>
					<tbody>
						{COMPARISON.map((row) => (
							<tr key={row.feature} className="border-b border-fd-border/60">
								<td className="py-2.5 pr-4 text-fd-muted-foreground">{row.feature}</td>
								<td className="py-2.5 text-center">
									<Cell on={row.free} />
								</td>
								<td className="py-2.5 text-center">
									<Cell on={row.pro} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<h2 className="mt-16 flex items-center gap-2 text-2xl font-bold tracking-tight">
				<Sparkles className="h-5 w-5 text-fd-primary" aria-hidden="true" /> On the roadmap
			</h2>
			<p className="mt-2 text-sm text-fd-muted-foreground">
				Not yet available. Listed so you can plan adoption with full visibility.
			</p>
			<ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
				{ROADMAP.map((item) => (
					<li
						key={item}
						className="rounded-lg border border-dashed border-fd-border px-3.5 py-2.5 text-sm text-fd-muted-foreground"
					>
						{item}
					</li>
				))}
			</ul>

			<h2 className="mt-16 text-2xl font-bold tracking-tight">Questions</h2>
			<dl className="mt-5 divide-y divide-fd-border border-y border-fd-border">
				{FAQ.map((item) => (
					<div key={item.q} className="py-4">
						<dt className="font-semibold">{item.q}</dt>
						<dd className="mt-1.5 text-sm text-fd-muted-foreground">{item.a}</dd>
					</div>
				))}
			</dl>

			<div className="mt-16 rounded-2xl border border-fd-border bg-fd-card p-8 text-center">
				<h2 className="text-2xl font-bold tracking-tight">Still deciding?</h2>
				<p className="mx-auto mt-2 max-w-xl text-sm text-fd-muted-foreground">
					Build the whole thing on the free core first. Pro is a drop-in when you hit line items or
					branching flows.
				</p>
				<div className="mt-6 flex flex-wrap justify-center gap-3">
					<Link
						href="/docs/quick-start"
						className="rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground"
					>
						Start free
					</Link>
					<Link
						href="/contact"
						className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-semibold"
					>
						Talk to us
					</Link>
				</div>
			</div>
		</main>
	);
}

function Cell({ on }: { on: boolean }) {
	return on ? (
		<>
			<Check className="mx-auto h-4 w-4 text-emerald-500" aria-hidden="true" />
			<span className="sr-only">Included</span>
		</>
	) : (
		<>
			<Minus className="mx-auto h-4 w-4 text-fd-muted-foreground/50" aria-hidden="true" />
			<span className="sr-only">Not included</span>
		</>
	);
}
