import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./tests/setup.ts'],
		coverage: {
			provider: 'v8',
			thresholds: { lines: 85, functions: 85, branches: 80, statements: 85 },
		},
	},
});
