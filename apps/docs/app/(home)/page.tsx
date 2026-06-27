import { CodeShowcase } from '@/components/landing/CodeShowcase';
import { Reveal } from '@/components/landing/Reveal';
import { SchemaFormSync } from '@/components/landing/SchemaFormSync';
import { InstallChip } from '@/components/ui/CopyButton';
import {
	Accessibility,
	ArrowRight,
	Blocks,
	BookOpen,
	Boxes,
	Check,
	GitBranch,
	ListChecks,
	type LucideIcon,
	Minus,
	Plug,
	ShieldCheck,
	Sparkles,
	Workflow,
	Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
	return (
		<main className="flex flex-col">
			<Hero />
			<Section
				eyebrow="See it in motion"
				title="Write the schema. Watch the form build itself."
				subtitle="The pane on the right is the genuine library — the same engine you ship. Switch presets to see conditional logic and derived values react live."
			>
				<SchemaFormSync />
			</Section>
			<Reveal>
				<Features />
			</Reveal>
			<Reveal>
				<Comparison />
			</Reveal>
			<Section
				eyebrow="Real, interactive"
				title="Every example is a working form"
				subtitle="No screenshots. No mocks. These run @easy-forms/core with the shadcn renderer registry, right here."
			>
				<CodeShowcase />
			</Section>
			<Performance />
			<Enterprise />
			<FinalCta />
			<Footer />
		</main>
	);
}

/* -------------------------------------------------------------------------- */

function Hero() {
	return (
		<section className="relative overflow-hidden border-b border-fd-border">
			<div className="pointer-events-none absolute inset-0 ef-grid-bg" />
			<div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] ef-hero-glow" />
			<div className="ef-stagger relative mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:py-28">
				<span className="inline-flex items-center gap-1.5 rounded-full border border-fd-border bg-fd-card/70 px-3 py-1 text-xs font-medium text-fd-muted-foreground backdrop-blur">
					<Sparkles className="h-3.5 w-3.5 text-fd-primary" />
					Schema-driven forms for React
				</span>
				<h1 className="mt-6 text-balance text-5xl font-bold tracking-tight sm:text-6xl">
					Forms are just <span className="text-fd-primary">data</span>.
				</h1>
				<p className="mt-6 max-w-xl text-balance text-lg text-fd-muted-foreground">
					Hand Easy Forms an array of question objects. It owns rendering, validation, conditional
					logic, multi-step wizards, and submission — so you don't wire any of it by hand.
				</p>
				<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
					<Link
						href="/docs"
						className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground transition-transform hover:scale-[1.02]"
					>
						Get started
						<ArrowRight className="h-4 w-4" />
					</Link>
					<Link
						href="/examples"
						className="inline-flex items-center gap-1.5 rounded-lg border border-fd-border bg-fd-card px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-fd-accent"
					>
						Browse examples
					</Link>
				</div>
				<div className="mt-8">
					<InstallChip />
				</div>
				<div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-fd-muted-foreground">
					{[
						'TypeScript-first',
						'WCAG-minded',
						'Zero core UI deps',
						'Tree-shakeable',
						'MIT licensed',
					].map((t) => (
						<span key={t} className="inline-flex items-center gap-1.5">
							<Check className="h-3.5 w-3.5 text-fd-primary" />
							{t}
						</span>
					))}
				</div>
			</div>
		</section>
	);
}

function Section({
	eyebrow,
	title,
	subtitle,
	children,
}: {
	eyebrow: string;
	title: string;
	subtitle: string;
	children: React.ReactNode;
}) {
	return (
		<section className="border-b border-fd-border px-4 py-20">
			<div className="mx-auto max-w-5xl">
				<div className="mx-auto mb-10 max-w-2xl text-center">
					<p className="text-sm font-semibold uppercase tracking-wider text-fd-primary">
						{eyebrow}
					</p>
					<h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
					<p className="mt-3 text-fd-muted-foreground">{subtitle}</p>
				</div>
				{children}
			</div>
		</section>
	);
}

const FEATURES: { icon: LucideIcon; title: string; body: string; span?: boolean }[] = [
	{
		icon: Boxes,
		title: 'Schema-driven',
		body: 'One array of question objects is the source of truth. No useForm, register, or Controller wiring.',
		span: true,
	},
	{
		icon: Blocks,
		title: 'Headless + swappable renderers',
		body: 'The engine is UI-agnostic. Ship the shadcn registry or drop in your own design system.',
	},
	{
		icon: ShieldCheck,
		title: 'Type-narrowed validation',
		body: 'Validators are typed by the field value — minLength on a checkbox is a compile error.',
	},
	{
		icon: Workflow,
		title: 'Three dependency kinds',
		body: 'propsDependsOn, valueDependsOn, resetDependsOn cover every dynamic prop, derived value, and reset.',
	},
	{
		icon: ListChecks,
		title: 'Multi-step wizards',
		body: 'Per-step validation, step-level visibility, and resumable localStorage persistence out of the box.',
	},
	{
		icon: Zap,
		title: 'Surgical re-renders',
		body: 'A custom topic-based store wakes only the field you changed — not the whole form.',
		span: true,
	},
	{
		icon: Plug,
		title: 'Plugin lifecycle',
		body: 'onInit / onChange / onSubmit / onDestroy hooks. Logger and autosave ship built-in.',
	},
	{
		icon: GitBranch,
		title: 'Extend without forking',
		body: 'Module augmentation adds custom controls, validators, and dependency kinds — fully typed.',
	},
];

function Features() {
	return (
		<Section
			eyebrow="Why Easy Forms"
			title="A higher-level form library, not another hook"
			subtitle="Everything a production form needs — declarative, typed, and accessible — without the boilerplate."
		>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{FEATURES.map((f) => (
					<div
						key={f.title}
						className={[
							'group rounded-xl border border-fd-border bg-fd-card p-5 transition-colors hover:border-fd-primary/40',
							f.span ? 'lg:col-span-1' : '',
						].join(' ')}
					>
						<div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary">
							<f.icon className="h-5 w-5" />
						</div>
						<h3 className="font-semibold">{f.title}</h3>
						<p className="mt-1.5 text-sm text-fd-muted-foreground">{f.body}</p>
					</div>
				))}
			</div>
		</Section>
	);
}

const COMPARE: {
	feature: string;
	ef: boolean;
	rhf: 'partial' | boolean;
	formik: 'partial' | boolean;
	hand: boolean;
}[] = [
	{ feature: 'Schema as the source of truth', ef: true, rhf: false, formik: false, hand: false },
	{
		feature: 'Conditional logic built-in',
		ef: true,
		rhf: 'partial',
		formik: 'partial',
		hand: false,
	},
	{ feature: 'Derived / computed values', ef: true, rhf: 'partial', formik: false, hand: false },
	{ feature: 'Multi-step wizard + persistence', ef: true, rhf: false, formik: false, hand: false },
	{ feature: 'Accessible renderers by default', ef: true, rhf: false, formik: false, hand: false },
	{ feature: 'Per-field surgical re-renders', ef: true, rhf: true, formik: false, hand: false },
	{
		feature: 'Swappable renderer registry',
		ef: true,
		rhf: 'partial',
		formik: 'partial',
		hand: true,
	},
];

function Cell({ v }: { v: 'partial' | boolean }) {
	if (v === true) return <Check className="mx-auto h-4 w-4 text-emerald-500" />;
	if (v === 'partial')
		return <span className="mx-auto block text-xs font-medium text-amber-500">manual</span>;
	return <Minus className="mx-auto h-4 w-4 text-fd-muted-foreground/40" />;
}

function Comparison() {
	return (
		<Section
			eyebrow="How it compares"
			title="Built-in where others leave you wiring"
			subtitle="Easy Forms owns the workflow. Honest comparison — others are excellent libraries, with a different scope."
		>
			<div className="overflow-x-auto rounded-xl border border-fd-border">
				<table className="w-full min-w-[640px] border-collapse text-sm">
					<thead>
						<tr className="border-b border-fd-border bg-fd-muted/40">
							<th className="px-4 py-3 text-left font-medium">Capability</th>
							<th className="px-4 py-3 text-center font-semibold text-fd-primary">Easy Forms</th>
							<th className="px-4 py-3 text-center font-medium text-fd-muted-foreground">
								React Hook Form
							</th>
							<th className="px-4 py-3 text-center font-medium text-fd-muted-foreground">Formik</th>
							<th className="px-4 py-3 text-center font-medium text-fd-muted-foreground">
								Hand-rolled
							</th>
						</tr>
					</thead>
					<tbody>
						{COMPARE.map((row, i) => (
							<tr key={row.feature} className={i % 2 ? 'bg-fd-muted/20' : ''}>
								<td className="px-4 py-3 text-left">{row.feature}</td>
								<td className="px-4 py-3 text-center">
									<Cell v={row.ef} />
								</td>
								<td className="px-4 py-3 text-center">
									<Cell v={row.rhf} />
								</td>
								<td className="px-4 py-3 text-center">
									<Cell v={row.formik} />
								</td>
								<td className="px-4 py-3 text-center">
									<Cell v={row.hand} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Section>
	);
}

function Performance() {
	return (
		<section className="border-b border-fd-border px-4 py-20">
			<div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
				<div>
					<p className="text-sm font-semibold uppercase tracking-wider text-fd-primary">
						Performance
					</p>
					<h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
						One field changes. One field re-renders.
					</h2>
					<p className="mt-4 text-fd-muted-foreground">
						Easy Forms is built on a custom external store with topic-based, per-field subscriptions
						via{' '}
						<code className="rounded bg-fd-muted px-1.5 py-0.5 text-sm">useSyncExternalStore</code>.
						Typing in one input wakes only that field's subscribers and the form-state subscriber —
						not the entire form. Hundred-field forms stay smooth without manual memoization.
					</p>
					<Link
						href="/docs/performance"
						className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-fd-primary"
					>
						How the store works
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>
				<div className="grid grid-cols-4 gap-2 rounded-xl border border-fd-border bg-fd-card p-5 sm:grid-cols-6">
					{Array.from({ length: 24 }).map((_, i) => (
						<div
							key={`cell-${i}`}
							className={[
								'aspect-square rounded-md border',
								i === 9
									? 'border-fd-primary bg-fd-primary/20 shadow-[0_0_16px] shadow-fd-primary/40'
									: 'border-fd-border bg-fd-muted/40',
							].join(' ')}
						/>
					))}
					<p className="col-span-full mt-1 text-center text-xs text-fd-muted-foreground">
						24 fields rendered — editing one repaints just the highlighted cell.
					</p>
				</div>
			</div>
		</section>
	);
}

function Enterprise() {
	const grounded = [
		'Fully typed schema & validators (TS strict)',
		'Headless control — own your markup & a11y',
		'Plugin hooks for autosave, logging, audit trails',
		'Extend with custom controls, validators, deps',
		'Dual ESM/CJS builds, tree-shakeable, MIT',
	];
	const roadmap = [
		'SSO/SAML field packs',
		'Audit-log plugin',
		'SOC 2 & compliance docs',
		'Priority support SLAs',
	];
	return (
		<section className="border-b border-fd-border px-4 py-20">
			<div className="mx-auto max-w-5xl rounded-2xl border border-fd-border bg-gradient-to-b from-fd-card to-fd-background p-8 sm:p-12">
				<div className="grid gap-10 lg:grid-cols-2">
					<div>
						<p className="text-sm font-semibold uppercase tracking-wider text-fd-primary">
							Enterprise-ready
						</p>
						<h2 className="mt-2 text-3xl font-bold tracking-tight">Adopt with confidence</h2>
						<p className="mt-3 text-fd-muted-foreground">
							A predictable, typed core your team can reason about — plus a transparent roadmap for
							the governance features large orgs ask for.
						</p>
						<div className="mt-6 flex flex-wrap gap-3">
							<Link
								href="/enterprise"
								className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary px-4 py-2 text-sm font-semibold text-fd-primary-foreground"
							>
								Talk to us
								<ArrowRight className="h-4 w-4" />
							</Link>
							<Link
								href="/docs/security"
								className="inline-flex items-center gap-1.5 rounded-lg border border-fd-border px-4 py-2 text-sm font-semibold"
							>
								<ShieldCheck className="h-4 w-4" />
								Security model
							</Link>
						</div>
					</div>
					<div className="grid gap-6 sm:grid-cols-2">
						<div>
							<h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
								<Check className="h-4 w-4 text-emerald-500" /> Available today
							</h3>
							<ul className="space-y-2 text-sm text-fd-muted-foreground">
								{grounded.map((g) => (
									<li key={g} className="flex gap-2">
										<Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
										{g}
									</li>
								))}
							</ul>
						</div>
						<div>
							<h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-fd-muted-foreground">
								<Sparkles className="h-4 w-4 text-fd-primary" /> On the roadmap
							</h3>
							<ul className="space-y-2 text-sm text-fd-muted-foreground/80">
								{roadmap.map((r) => (
									<li key={r} className="flex gap-2">
										<Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-fd-primary/60" />
										{r}
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function FinalCta() {
	return (
		<section className="px-4 py-24 text-center">
			<div className="mx-auto max-w-2xl">
				<h2 className="text-balance text-4xl font-bold tracking-tight">
					Ship your next form in minutes.
				</h2>
				<p className="mt-4 text-fd-muted-foreground">
					Install the packages, paste a schema, render a form. The 5-minute quick start gets you to
					a working, validated, accessible form.
				</p>
				<div className="mt-8 flex flex-col items-center gap-4">
					<InstallChip />
					<div className="flex flex-wrap items-center justify-center gap-3">
						<Link
							href="/docs/quick-start"
							className="inline-flex items-center gap-1.5 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground"
						>
							<BookOpen className="h-4 w-4" />
							Quick start
						</Link>
						<Link
							href="/examples"
							className="inline-flex items-center gap-1.5 rounded-lg border border-fd-border px-5 py-2.5 text-sm font-semibold"
						>
							Browse examples
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}

function Footer() {
	const cols: { title: string; links: { label: string; href: string }[] }[] = [
		{
			title: 'Product',
			links: [
				{ label: 'Documentation', href: '/docs' },
				{ label: 'Examples', href: '/examples' },
				{ label: 'Enterprise', href: '/enterprise' },
			],
		},
		{
			title: 'Learn',
			links: [
				{ label: 'Quick start', href: '/docs/quick-start' },
				{ label: 'Core concepts', href: '/docs/concepts' },
				{ label: 'API reference', href: '/docs/api' },
			],
		},
		{
			title: 'Resources',
			links: [
				{ label: 'Accessibility', href: '/docs/accessibility' },
				{ label: 'Performance', href: '/docs/performance' },
				{ label: 'Security', href: '/docs/security' },
				{ label: 'Troubleshooting', href: '/docs/troubleshooting' },
			],
		},
	];
	return (
		<footer className="border-t border-fd-border bg-fd-card/40 px-4 py-12">
			<div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
				<div>
					<span className="inline-flex items-center gap-2 font-semibold">
						<span className="grid h-6 w-6 place-items-center rounded-md bg-fd-primary text-fd-primary-foreground text-[13px] font-bold">
							E
						</span>
						Easy Forms
					</span>
					<p className="mt-3 flex items-center gap-1.5 text-sm text-fd-muted-foreground">
						<Accessibility className="h-4 w-4" />
						Accessible, typed, schema-driven.
					</p>
				</div>
				{cols.map((c) => (
					<div key={c.title}>
						<h3 className="mb-3 text-sm font-semibold">{c.title}</h3>
						<ul className="space-y-2 text-sm text-fd-muted-foreground">
							{c.links.map((l) => (
								<li key={l.href}>
									<Link href={l.href} className="hover:text-fd-foreground">
										{l.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
			<div className="mx-auto mt-10 max-w-5xl border-t border-fd-border pt-6 text-xs text-fd-muted-foreground">
				MIT licensed · © {new Date().getFullYear()} Easy Forms
			</div>
		</footer>
	);
}
