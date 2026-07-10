import { describe, expect, it } from 'vitest';
import { buildDependencyGraph, defaultDependencyHandlers } from '../src/dependencies';
import {
	isContainerControl,
	registerContainerControl,
} from '../src/dependencies/containerControls';
import type { FormSchema, Question } from '../src/types';

describe('container control registry', () => {
	it('registers and reports a container control type', () => {
		expect(isContainerControl('someExoticContainer')).toBe(false);
		registerContainerControl('someExoticContainer');
		expect(isContainerControl('someExoticContainer')).toBe(true);
	});

	it('buildDependencyGraph collects the keys of registered container questions', () => {
		registerContainerControl('testContainer');
		const schema: FormSchema = {
			groups: [
				{
					id: 'root',
					questions: [
						{ key: 'plain', label: 'Plain', control: 'text' } as Question,
						{
							key: 'bankAccounts',
							label: 'Accounts',
							control: 'testContainer',
						} as unknown as Question,
					],
				},
			],
		};
		const graph = buildDependencyGraph(schema, defaultDependencyHandlers);
		expect(graph.containerKeys.has('bankAccounts')).toBe(true);
		expect(graph.containerKeys.has('plain')).toBe(false);
	});
});
