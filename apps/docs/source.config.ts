import { defineConfig, defineDocs, frontmatterSchema } from 'fumadocs-mdx/config';
import { z } from 'zod';

export const docs = defineDocs({
	dir: 'content/docs',
	docs: {
		// `pro: true` marks a page as documenting a Pro-only feature. lib/source.ts
		// reads it to attach the PRO chip in the sidebar.
		schema: frontmatterSchema.extend({
			pro: z.boolean().optional(),
		}),
	},
});

export default defineConfig();
