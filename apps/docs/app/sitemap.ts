import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://easy-forms.dev';

export default function sitemap(): MetadataRoute.Sitemap {
	const docPages = source.getPages().map((page) => ({
		url: `${SITE_URL}${page.url}`,
		changeFrequency: 'weekly' as const,
		priority: 0.7,
	}));

	const staticPages = ['', '/playground', '/enterprise'].map((path) => ({
		url: `${SITE_URL}${path}`,
		changeFrequency: 'weekly' as const,
		priority: path === '' ? 1 : 0.8,
	}));

	return [...staticPages, ...docPages];
}
