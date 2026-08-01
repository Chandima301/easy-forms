// Renders a FormSchema back to TSX source for the Code tab of a doc example.
//
// Inline MDX demos are server-rendered, so their schemas cannot contain functions
// (a `compute` or `custom` validator would not survive the RSC boundary). That
// makes them losslessly serializable, which is why the Code tab is derived from
// the same object that renders the Preview tab instead of being hand-authored.
//
// Demos that DO need functions live in components/demo/examples.tsx with a
// co-located `code` string — hence the throw rather than a placeholder.
import type { FormSchema } from '@easy-forms/core';

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function quote(value: string): string {
	return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function print(value: unknown, depth: number, path: string): string {
	if (typeof value === 'function') {
		throw new Error(
			`serializeSchema: cannot serialize a function at ${path}. Move this demo into components/demo/examples.tsx with a hand-authored code string.`
		);
	}
	if (value === null) return 'null';
	if (typeof value === 'string') return quote(value);
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);

	const pad = '\t'.repeat(depth);
	const inner = '\t'.repeat(depth + 1);

	if (Array.isArray(value)) {
		if (value.length === 0) return '[]';
		const items = value.map((item, i) => `${inner}${print(item, depth + 1, `${path}[${i}]`)}`);
		return `[\n${items.join(',\n')},\n${pad}]`;
	}

	if (typeof value === 'object') {
		const entries = Object.entries(value as Record<string, unknown>).filter(
			([, v]) => v !== undefined
		);
		if (entries.length === 0) return '{}';
		const body = entries.map(([key, v]) => {
			const name = IDENTIFIER.test(key) ? key : quote(key);
			return `${inner}${name}: ${print(v, depth + 1, `${path}.${key}`)}`;
		});
		return `{\n${body.join(',\n')},\n${pad}}`;
	}

	throw new Error(`serializeSchema: unsupported ${typeof value} at ${path}.`);
}

/** Render a schema (and optional initial values) as copy-pasteable TSX. */
export function serializeSchema(
	schema: FormSchema,
	initialValues?: Record<string, unknown>
): string {
	const parts = [`const schema: FormSchema = ${print(schema, 0, 'schema')};`];
	if (initialValues) {
		parts.push(`const initialValues = ${print(initialValues, 0, 'initialValues')};`);
	}
	return parts.join('\n\n');
}
