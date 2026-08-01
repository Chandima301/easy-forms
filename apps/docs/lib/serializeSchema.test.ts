import type { FormSchema } from '@easy-forms/core';
import { describe, expect, it } from 'vitest';
import { serializeSchema } from './serializeSchema';

describe('serializeSchema', () => {
	it('emits a typed const with tabs and single quotes', () => {
		const schema: FormSchema = {
			groups: [{ questions: [{ key: 'name', label: 'Name', control: 'text' }] }],
		};
		expect(serializeSchema(schema)).toBe(
			[
				'const schema: FormSchema = {',
				'\tgroups: [',
				'\t\t{',
				'\t\t\tquestions: [',
				'\t\t\t\t{',
				"\t\t\t\t\tkey: 'name',",
				"\t\t\t\t\tlabel: 'Name',",
				"\t\t\t\t\tcontrol: 'text',",
				'\t\t\t\t},',
				'\t\t\t],',
				'\t\t},',
				'\t],',
				'};',
			].join('\n')
		);
	});

	it('appends initialValues when provided', () => {
		const schema: FormSchema = { groups: [] };
		const out = serializeSchema(schema, { name: '' });
		expect(out).toContain('const schema: FormSchema = {');
		expect(out).toContain("const initialValues = {\n\tname: '',\n};");
	});

	it('renders empty arrays and objects inline', () => {
		expect(serializeSchema({ groups: [] })).toBe('const schema: FormSchema = {\n\tgroups: [],\n};');
	});

	it('omits undefined properties', () => {
		const schema = { groups: [], title: undefined } as unknown as FormSchema;
		expect(serializeSchema(schema)).not.toContain('title');
	});

	it('quotes keys that are not valid identifiers', () => {
		const schema = { groups: [], 'data-x': 1 } as unknown as FormSchema;
		expect(serializeSchema(schema)).toContain("'data-x': 1,");
	});

	it('escapes single quotes and backslashes in strings', () => {
		const schema = { groups: [], title: "Ada's \\ form" } as unknown as FormSchema;
		expect(serializeSchema(schema)).toContain("title: 'Ada\\'s \\\\ form',");
	});

	it('preserves null', () => {
		const out = serializeSchema({ groups: [] }, { country: null });
		expect(out).toContain('country: null,');
	});

	it('throws on a function, naming the path', () => {
		const schema = {
			groups: [
				{
					questions: [
						{ key: 'a', label: 'A', control: 'text', validators: { custom: () => null } },
					],
				},
			],
		} as unknown as FormSchema;
		expect(() => serializeSchema(schema)).toThrow(
			/schema\.groups\[0\]\.questions\[0\]\.validators\.custom/
		);
	});
});
