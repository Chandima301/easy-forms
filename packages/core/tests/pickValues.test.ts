import { describe, expect, it } from 'vitest';
import type { DependencyContext } from '../src/dependencies';
import { pickValues } from '../src/dependencies/pickValues';

function makeCtx(over: Partial<DependencyContext>): DependencyContext {
	return {
		store: {} as never,
		getValues: () => ({}),
		getNestedValues: () => ({}),
		containerKeys: new Set<string>(),
		target: { kind: 'field', key: 't', question: {} as never },
		...over,
	};
}

describe('pickValues', () => {
	it('picks flat values for non-container names', () => {
		const ctx = makeCtx({ getValues: () => ({ name: 'Ada', age: 42 }) });
		expect(pickValues(ctx, ['name', 'age'])).toEqual({ name: 'Ada', age: 42 });
	});

	it('picks the nested assembly for a container name', () => {
		const ctx = makeCtx({
			getValues: () => ({ bankAccounts: [0, 1], name: 'Ada' }),
			getNestedValues: () => ({
				bankAccounts: [{ currency: 'USD' }, { currency: 'EUR' }],
				name: 'Ada',
			}),
			containerKeys: new Set(['bankAccounts']),
		});
		expect(pickValues(ctx, ['name', 'bankAccounts'])).toEqual({
			name: 'Ada',
			bankAccounts: [{ currency: 'USD' }, { currency: 'EUR' }],
		});
	});

	it('yields [] for a container with no assembled value (empty group)', () => {
		const ctx = makeCtx({
			getValues: () => ({}),
			getNestedValues: () => ({}),
			containerKeys: new Set(['bankAccounts']),
		});
		expect(pickValues(ctx, ['bankAccounts'])).toEqual({ bankAccounts: [] });
	});
});
