import type { Group } from '@easy-forms/core';
import { describe, expect, it } from 'vitest';
import { prefixItemGroups } from '../src/controls/prefixItemGroups';

describe('prefixItemGroups', () => {
	it('prefixes question keys and (nested) group ids', () => {
		const groups: Group[] = [
			{
				id: 'sec',
				questions: [{ key: 'country', label: 'Country', control: 'text' }],
				groups: [{ id: 'inner', questions: [{ key: 'city', label: 'City', control: 'text' }] }],
			},
		];
		const [g] = prefixItemGroups(groups, 'a.0.');
		expect(g?.id).toBe('a.0.sec');
		expect(g?.questions?.[0]?.key).toBe('a.0.country');
		expect(g?.groups?.[0]?.id).toBe('a.0.inner');
		expect(g?.groups?.[0]?.questions?.[0]?.key).toBe('a.0.city');
	});

	it('seeds defaultItem values by item-relative key', () => {
		const groups: Group[] = [{ questions: [{ key: 'currency', label: 'C', control: 'text' }] }];
		const [g] = prefixItemGroups(groups, 'a.0.', { currency: 'USD' });
		expect((g?.questions?.[0] as { defaultValue?: unknown }).defaultValue).toBe('USD');
	});

	it('prefixes propsDependsOn fieldNames and feeds compute item-relative values', () => {
		const groups: Group[] = [
			{
				questions: [
					{
						key: 'routing',
						label: 'Routing',
						control: 'text',
						dependents: {
							propsDependsOn: [
								{ fieldNames: ['country'], compute: (v) => ({ hidden: v.country !== 'US' }) },
							],
						},
					},
				],
			},
		];
		const [g] = prefixItemGroups(groups, 'a.0.');
		// biome-ignore lint/suspicious/noExplicitAny: reaching into the transformed rule for assertions.
		const rule = (g?.questions?.[0] as any).dependents.propsDependsOn[0];
		expect(rule.fieldNames).toEqual(['a.0.country']);
		expect(rule.compute({ 'a.0.country': 'US' })).toEqual({ hidden: false });
		expect(rule.compute({ 'a.0.country': 'CA' })).toEqual({ hidden: true });
	});
});
