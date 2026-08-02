import { ContactForm } from '@/components/contact/ContactForm';
import { Bug, Building2, LifeBuoy, ShieldAlert } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Contact',
	description:
		'Talk to the Easy Forms team about pricing, enterprise licensing, support, or a security disclosure.',
};

const ROUTES = [
	{
		icon: Building2,
		title: 'Sales & Enterprise',
		body: 'Volume seats, invoicing and purchase orders, security review support.',
	},
	{
		icon: LifeBuoy,
		title: 'Technical support',
		body: 'Pro customers get email support. On the free core, GitHub Discussions is the fastest route.',
	},
	{
		icon: Bug,
		title: 'Report a bug',
		body: 'GitHub Issues gets a fix out quickest — it lands straight in the backlog.',
	},
	{
		icon: ShieldAlert,
		title: 'Security disclosure',
		body: 'Use the form and pick "Security disclosure". Please do not open a public issue.',
	},
];

export default function ContactPage() {
	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-16">
			<div className="text-center">
				<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Talk to us</h1>
				<p className="mx-auto mt-4 max-w-2xl text-fd-muted-foreground">
					Most questions are already answered in the docs — but a real person reads every message
					sent here.
				</p>
			</div>

			<div className="mt-12 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
				<div className="flex flex-col gap-3">
					{ROUTES.map((route) => (
						<div key={route.title} className="rounded-xl border border-fd-border bg-fd-card p-4">
							<h2 className="flex items-center gap-2 text-sm font-semibold">
								<route.icon className="h-4 w-4 text-fd-primary" aria-hidden="true" />
								{route.title}
							</h2>
							<p className="mt-1.5 text-sm text-fd-muted-foreground">{route.body}</p>
						</div>
					))}
					<p className="mt-1 text-xs text-fd-muted-foreground">
						What you send is emailed to the maintainers and used only to reply. It is not added to a
						mailing list.
					</p>
				</div>

				<ContactForm />
			</div>
		</main>
	);
}
