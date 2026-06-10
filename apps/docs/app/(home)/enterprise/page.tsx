import { ArrowRight, Building2, Check, FileCheck2, Headphones, Lock, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'Enterprise',
	description:
		'Adopt Easy Forms with confidence — a typed, headless core today, with a transparent roadmap for governance, compliance, and support.',
};

export default function EnterprisePage() {
	return (
		<main className="mx-auto w-full max-w-4xl px-4 py-16">
			<div className="text-center">
				<span className="inline-flex items-center gap-1.5 rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs font-medium text-fd-muted-foreground">
					<Building2 className="h-3.5 w-3.5 text-fd-primary" /> For teams &amp; platforms
				</span>
				<h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
					Forms infrastructure your team can standardize on
				</h1>
				<p className="mx-auto mt-4 max-w-2xl text-fd-muted-foreground">
					Easy Forms gives platform teams a single, typed, accessible way to build every form in the
					product — from a two-field login to a 12-step onboarding wizard. Below is an honest split
					of what ships today and what we are building next.
				</p>
				<div className="mt-7 flex flex-wrap justify-center gap-3">
					<Link
						href="mailto:enterprise@easy-forms.dev"
						className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground"
					>
						Talk to us <ArrowRight className="h-4 w-4" />
					</Link>
					<Link
						href="/docs/enterprise"
						className="inline-flex items-center gap-1.5 rounded-lg border border-fd-border px-5 py-2.5 text-sm font-semibold"
					>
						Read the enterprise docs
					</Link>
				</div>
			</div>

			<div className="mt-14 grid gap-4 sm:grid-cols-3">
				{[
					{
						icon: Lock,
						title: 'Headless & owned',
						body: 'You own the markup, theming, and a11y. No vendor UI lock-in.',
					},
					{
						icon: FileCheck2,
						title: 'Typed & predictable',
						body: 'A strict-TS schema and validators your team can review and trust.',
					},
					{
						icon: Headphones,
						title: 'Extensible',
						body: 'Add controls, validators, and dependency kinds without forking.',
					},
				].map((c) => (
					<div key={c.title} className="rounded-xl border border-fd-border bg-fd-card p-5">
						<c.icon className="h-5 w-5 text-fd-primary" />
						<h3 className="mt-3 font-semibold">{c.title}</h3>
						<p className="mt-1.5 text-sm text-fd-muted-foreground">{c.body}</p>
					</div>
				))}
			</div>

			<div className="mt-12 grid gap-8 rounded-2xl border border-fd-border bg-fd-card p-8 sm:grid-cols-2">
				<div>
					<h2 className="flex items-center gap-2 text-lg font-semibold">
						<Check className="h-5 w-5 text-emerald-500" /> Available today
					</h2>
					<ul className="mt-4 space-y-2.5 text-sm text-fd-muted-foreground">
						{[
							'Schema-driven forms with strict TypeScript types',
							'Type-narrowed validation (sync + async)',
							'Conditional logic, derived values, and resets',
							'Multi-step wizards with resumable persistence',
							'Accessible renderers built on Radix primitives',
							'Plugin lifecycle hooks (autosave, logging, audit)',
							'Swappable renderer registry for your design system',
							'Dual ESM/CJS builds, tree-shakeable, MIT licensed',
						].map((t) => (
							<li key={t} className="flex gap-2">
								<Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
								{t}
							</li>
						))}
					</ul>
				</div>
				<div>
					<h2 className="flex items-center gap-2 text-lg font-semibold text-fd-muted-foreground">
						<Sparkles className="h-5 w-5 text-fd-primary" /> On the roadmap
					</h2>
					<ul className="mt-4 space-y-2.5 text-sm text-fd-muted-foreground/80">
						{[
							'SSO / SAML-aware field packs',
							'First-party audit-log plugin',
							'SOC 2 posture & compliance documentation',
							'Private renderer registry distribution',
							'Priority support with response SLAs',
							'Design-system theming presets',
						].map((t) => (
							<li key={t} className="flex gap-2">
								<Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-fd-primary/60" />
								{t}
							</li>
						))}
					</ul>
					<p className="mt-4 text-xs text-fd-muted-foreground">
						Roadmap items are not yet available. We share them so you can plan adoption with full
						visibility.
					</p>
				</div>
			</div>
		</main>
	);
}
