import './global.css';
import { cn } from '@/lib/utils';
import { RootProvider } from 'fumadocs-ui/provider';
import { Geist, Inter } from 'next/font/google';
import type { ReactNode } from 'react';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://easy-forms.dev';

export const metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: 'Easy Forms — Forms are just data',
		template: '%s · Easy Forms',
	},
	description:
		'A schema-driven React form library. Hand it an array of question objects and it owns rendering, validation, conditional logic, multi-step wizards, and submission.',
	openGraph: {
		title: 'Easy Forms — Forms are just data',
		description:
			'Schema-driven React forms: rendering, validation, conditional logic, wizards, and submission — from one typed array of question objects.',
		url: SITE_URL,
		siteName: 'Easy Forms',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Easy Forms — Forms are just data',
		description:
			'Schema-driven React forms with validation, conditional logic, and wizards built in.',
	},
};

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			className={cn(inter.className, 'font-sans', geist.variable)}
			suppressHydrationWarning
		>
			<body className="flex flex-col min-h-screen" suppressHydrationWarning>
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}
