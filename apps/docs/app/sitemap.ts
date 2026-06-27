import { exampleMeta } from '@/lib/examples-meta';
import { source } from '@/lib/source';
import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://easy-forms.dev';

export default function sitemap(): MetadataRoute.Sitemap {
	const docPages = source.getPages().map((page) => ({
		url: `${SITE_URL}${page.url}`,
		changeFrequency: 'weekly' as const,
		priority: 0.7,
	}));

	const examplePaths = ['/examples', ...exampleMeta.map((m) => `/examples/${m.slug}`)];
	const staticPages = ['', '/playground', '/enterprise', ...examplePaths].map((path) => ({
		url: `${SITE_URL}${path}`,
		changeFrequency: 'weekly' as const,
		priority: path === '' ? 1 : 0.8,
	}));

	return [...staticPages, ...docPages];
}
