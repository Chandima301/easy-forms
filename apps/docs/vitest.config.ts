import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		globals: true,
		include: ['lib/**/*.test.ts'],
	},
	resolve: {
		// fileURLToPath, not URL.pathname — on Windows the latter yields "/C:/…",
		// which Vite cannot resolve.
		alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
	},
});
