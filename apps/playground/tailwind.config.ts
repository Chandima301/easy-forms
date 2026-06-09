import type { Config } from 'tailwindcss';

export default {
	content: [
		'./index.html',
		'./src/**/*.{ts,tsx}',
		// Scan the shadcn renderers so their inline control classes (Input,
		// Select, Checkbox, FieldShell, …) are emitted. Form chrome no longer
		// needs scanning — it ships as plain CSS in `@easy-forms/shadcn/styles.css`.
		'../../packages/shadcn/src/**/*.{ts,tsx}',
	],
	theme: {
		extend: {},
	},
	plugins: [],
} satisfies Config;
