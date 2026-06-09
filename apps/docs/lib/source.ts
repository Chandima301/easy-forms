import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';
import { icons } from 'lucide-react';
import { createElement } from 'react';

// fumadocs-mdx 11.x's `toFumadocsSource()` returns `files` as a lazy function
// (`() => VirtualFile[]`), while fumadocs-core 15.x's `loader` expects
// `source.files` to be an array (it calls `files.map(...)` directly). Resolve the
// files eagerly to bridge the two, while preserving the inferred page-data type
// (so `page.data.body`, `.toc`, etc. stay typed) via the cast back to the source.
const mdxSource = docs.toFumadocsSource();
const resolvedSource = (
	typeof mdxSource.files === 'function'
		? { ...mdxSource, files: (mdxSource.files as () => unknown)() }
		: mdxSource
) as typeof mdxSource;

export const source = loader({
	baseUrl: '/docs',
	source: resolvedSource,
	icon(icon) {
		if (icon && icon in icons) {
			return createElement(icons[icon as keyof typeof icons]);
		}
	},
});
