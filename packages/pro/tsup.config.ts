import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	dts: true,
	sourcemap: true,
	clean: true,
	treeshake: true,
	external: ['react', 'react-dom', '@easy-forms/core'],
	target: 'es2022',
	define: { __EF_PRO_BUILD_TIME__: JSON.stringify(new Date().toISOString()) },
});
