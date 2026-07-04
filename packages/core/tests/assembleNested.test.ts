import { describe, expect, it } from 'vitest';
import { assembleNestedValues } from '../src/store/assembleNested';

describe('assembleNestedValues', () => {
	it('leaves flat dot-free keys untouched', () => {
		expect(assembleNestedValues({ name: 'Ada', age: 36 })).toEqual({
			name: 'Ada',
			age: 36,
		});
	});

	it('assembles numeric segments into an array of objects', () => {
		const flat = {
			'bankAccounts.0.currency': 'USD',
			'bankAccounts.1.currency': 'EUR',
		};
		expect(assembleNestedValues(flat)).toEqual({
			bankAccounts: [{ currency: 'USD' }, { currency: 'EUR' }],
		});
	});

	it('assembles non-numeric segments into nested objects', () => {
		const flat = { 'address.street': 'Main', 'address.city': 'Lund' };
		expect(assembleNestedValues(flat)).toEqual({
			address: { street: 'Main', city: 'Lund' },
		});
	});

	it('lets indexed children win over a scalar at the same key', () => {
		const flat = {
			bankAccounts: [0, 1], // container scalar (the active-index list) — dropped
			'bankAccounts.0.currency': 'USD',
			'bankAccounts.1.currency': 'EUR',
		};
		expect(assembleNestedValues(flat)).toEqual({
			bankAccounts: [{ currency: 'USD' }, { currency: 'EUR' }],
		});
	});

	it('emits the container scalar for an empty repeating group (no children)', () => {
		expect(assembleNestedValues({ bankAccounts: [] })).toEqual({
			bankAccounts: [],
		});
	});

	it('compacts sparse indices left by a removed middle row', () => {
		const flat = {
			'bankAccounts.0.currency': 'USD',
			'bankAccounts.2.currency': 'GBP', // index 1 was removed
		};
		expect(assembleNestedValues(flat)).toEqual({
			bankAccounts: [{ currency: 'USD' }, { currency: 'GBP' }],
		});
	});

	it('handles multiple fields per item and mixed top-level keys', () => {
		const flat = {
			fullName: 'Ada',
			'bankAccounts.0.bank': 'Acme',
			'bankAccounts.0.currency': 'USD',
			'bankAccounts.1.bank': 'Globex',
			'bankAccounts.1.currency': 'EUR',
		};
		expect(assembleNestedValues(flat)).toEqual({
			fullName: 'Ada',
			bankAccounts: [
				{ bank: 'Acme', currency: 'USD' },
				{ bank: 'Globex', currency: 'EUR' },
			],
		});
	});
});
