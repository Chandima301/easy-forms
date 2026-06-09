import { describe, expect, it, vi } from 'vitest';
import { createFormStore } from '../src/store/createFormStore';
import {
	email,
	maxLength,
	max,
	minLength,
	min,
	pattern,
	required,
} from '../src/validation/builtIns';

describe('built-in validators', () => {
	it('required rejects empty string and accepts a value', () => {
		expect(required(true, '', {})).toBe('This field is required');
		expect(required(true, 'x', {})).toBeNull();
		expect(required(false, '', {})).toBeNull();
	});

	it('required uses custom message', () => {
		expect(required({ value: true, message: 'Need it' }, '', {})).toBe('Need it');
	});

	it('minLength counts strings and arrays', () => {
		expect(minLength(3, 'hi', {})).toBe('Must be at least 3 characters');
		expect(minLength(3, 'hey', {})).toBeNull();
		expect(minLength(2, [1], {})).toBe('Must be at least 2 characters');
		expect(minLength(2, [1, 2], {})).toBeNull();
	});

	it('maxLength', () => {
		expect(maxLength(3, 'hello', {})).toBe('Must be at most 3 characters');
		expect(maxLength(3, 'hey', {})).toBeNull();
	});

	it('min/max for numbers', () => {
		expect(min(10, 5, {})).toBe('Must be at least 10');
		expect(min(10, 10, {})).toBeNull();
		expect(max(10, 11, {})).toBe('Must be at most 10');
		expect(max(10, 10, {})).toBeNull();
	});

	it('pattern matches regex', () => {
		expect(pattern(/^\d+$/, 'abc', {})).toBe('Invalid format');
		expect(pattern(/^\d+$/, '123', {})).toBeNull();
		expect(pattern(/^\d+$/, '', {})).toBeNull();
	});

	it('email validates basic format', () => {
		expect(email(true, 'not-an-email', {})).toBe('Invalid email address');
		expect(email(true, 'a@b.co', {})).toBeNull();
		expect(email(false, 'not-an-email', {})).toBeNull();
	});
});

describe('validation pipeline', () => {
	it('collects all sync errors', async () => {
		const store = createFormStore();
		store.registerField({
			key: 'p',
			initialValue: 'a',
			validators: { required: true, minLength: 3, pattern: /^\d+$/ },
		});
		await store.validateField('p');
		const state = store.getFieldState('p');
		expect(Object.keys(state.errors)).toEqual(
			expect.arrayContaining(['minLength', 'pattern'])
		);
	});

	it('async custom result is not merged when a sync validator already failed', async () => {
		// The async custom is invoked once to get its promise, but if a sync
		// built-in already failed, the resolved async error must not override
		// the sync error.
		const asyncFn = vi.fn().mockResolvedValue('Async error');
		const store = createFormStore();
		store.registerField({
			key: 'name',
			initialValue: '',
			validators: { required: true, custom: asyncFn },
		});
		await store.validateField('name');
		expect(asyncFn).toHaveBeenCalledTimes(1);
		const state = store.getFieldState('name');
		expect(state.errors.required).toBe('This field is required');
		expect(state.errors.custom).toBeUndefined();
		expect(state.error).toBe('This field is required');
	});

	it('async customs run when sync passes', async () => {
		const asyncFn = vi.fn().mockResolvedValue('Async error');
		const store = createFormStore();
		store.registerField({
			key: 'name',
			initialValue: 'Ada',
			validators: { required: true, custom: asyncFn },
		});
		await store.validateField('name');
		expect(asyncFn).toHaveBeenCalledTimes(1);
		expect(store.getFieldState('name').error).toBe('Async error');
	});

	it('stale async results are dropped when a newer value arrives', async () => {
		let resolveFirst: (v: string | null) => void = () => {};
		const firstPromise = new Promise<string | null>((res) => {
			resolveFirst = res;
		});
		const asyncFn = vi
			.fn()
			.mockReturnValueOnce(firstPromise)
			.mockResolvedValue(null);
		const store = createFormStore();
		store.registerField({
			key: 'name',
			initialValue: 'Ada',
			validators: { custom: asyncFn },
		});
		const firstValidate = store.validateField('name');
		// Change value while the first async is still pending.
		store.setValue('name', 'Linus');
		// Resolve the first (stale) result with an error.
		resolveFirst('Stale error');
		await firstValidate;
		// Wait for the second validation triggered by setValue to complete.
		await store.validateField('name');
		expect(store.getFieldState('name').error).toBeNull();
	});

	it('hidden fields skip validation', async () => {
		const store = createFormStore();
		store.registerField({
			key: 'name',
			initialValue: '',
			validators: { required: true },
		});
		store.setRuntimeProps('name', { hidden: true });
		const ok = await store.validateField('name');
		expect(ok).toBe(true);
		expect(store.getFieldState('name').error).toBeNull();
	});

	it('named custom validators report under their name', async () => {
		const store = createFormStore();
		store.registerField({
			key: 'token',
			initialValue: 'xyz',
			validators: {
				custom: {
					exact: (v: unknown) => (v === 'xyz' ? null : 'Wrong token'),
					length: (v: unknown) => ((v as string).length > 2 ? null : 'Too short'),
				},
			},
		});
		await store.validateField('token');
		const state = store.getFieldState('token');
		expect(state.error).toBeNull();
		store.setValue('token', 'a');
		await store.validateField('token');
		const after = store.getFieldState('token');
		expect(after.errors.exact).toBe('Wrong token');
		expect(after.errors.length).toBe('Too short');
	});
});
