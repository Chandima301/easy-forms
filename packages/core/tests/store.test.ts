import { describe, expect, it, vi } from 'vitest';
import { createFormStore } from '../src/store/createFormStore';

describe('createFormStore', () => {
	it('registers a field with an initial value', () => {
		const store = createFormStore();
		store.registerField({ key: 'name', initialValue: 'Ada' });
		expect(store.getValue('name')).toBe('Ada');
		expect(store.getFieldState('name').dirty).toBe(false);
		expect(store.getFieldState('name').touched).toBe(false);
	});

	it('falls back to options.initialValues when descriptor omits initialValue', () => {
		const store = createFormStore({ initialValues: { name: 'Grace' } });
		store.registerField({ key: 'name' });
		expect(store.getValue('name')).toBe('Grace');
	});

	it('setValue marks dirty + touched when requested', () => {
		const store = createFormStore();
		store.registerField({ key: 'name', initialValue: 'Ada' });
		store.setValue('name', 'Linus', { touch: true });
		const state = store.getFieldState('name');
		expect(state.value).toBe('Linus');
		expect(state.dirty).toBe(true);
		expect(state.touched).toBe(true);
	});

	it('setValue back to initial clears dirty', () => {
		const store = createFormStore();
		store.registerField({ key: 'name', initialValue: 'Ada' });
		store.setValue('name', 'Linus');
		expect(store.getFieldState('name').dirty).toBe(true);
		store.setValue('name', 'Ada');
		expect(store.getFieldState('name').dirty).toBe(false);
	});

	it('subscribeField only fires for that field', () => {
		const store = createFormStore();
		store.registerField({ key: 'a', initialValue: 1 });
		store.registerField({ key: 'b', initialValue: 2 });
		const aListener = vi.fn();
		const bListener = vi.fn();
		store.subscribeField('a', aListener);
		store.subscribeField('b', bListener);
		aListener.mockClear();
		bListener.mockClear();
		store.setValue('a', 10, { validate: false });
		expect(aListener).toHaveBeenCalledTimes(1);
		expect(bListener).not.toHaveBeenCalled();
	});

	it('subscribeKeyAndDescendants fires on the key and any descendant change', () => {
		const store = createFormStore();
		store.registerField({ key: 'bankAccounts', initialValue: [0] });
		store.registerField({ key: 'bankAccounts.0.currency', initialValue: 'USD' });
		store.registerField({ key: 'bankAccountsExtra', initialValue: 'x' });
		const listener = vi.fn();
		store.subscribeKeyAndDescendants('bankAccounts', listener);
		listener.mockClear();
		// Exact-key change (row add/remove on the container scalar).
		store.setValue('bankAccounts', [0, 1], { validate: false });
		expect(listener).toHaveBeenCalledTimes(1);
		// Descendant change (a row field edit) — must also fire.
		store.setValue('bankAccounts.0.currency', 'EUR', { validate: false });
		expect(listener).toHaveBeenCalledTimes(2);
		// A key that merely shares a string prefix (no dot boundary) must NOT fire.
		store.setValue('bankAccountsExtra', 'y', { validate: false });
		expect(listener).toHaveBeenCalledTimes(2);
	});

	it('subscribeForm fires on any field change', () => {
		const store = createFormStore();
		store.registerField({ key: 'a', initialValue: 1 });
		store.registerField({ key: 'b', initialValue: 2 });
		const listener = vi.fn();
		store.subscribeForm(listener);
		listener.mockClear();
		store.setValue('a', 10, { validate: false });
		store.setValue('b', 20, { validate: false });
		expect(listener).toHaveBeenCalledTimes(2);
	});

	it('getFieldState returns a stable placeholder for unregistered keys', () => {
		const store = createFormStore();
		const a = store.getFieldState('ghost');
		const b = store.getFieldState('ghost');
		expect(a).toBe(b);
	});

	it('returns a new field-state reference on every change', () => {
		const store = createFormStore();
		store.registerField({ key: 'n', initialValue: 1 });
		const before = store.getFieldState('n');
		store.setValue('n', 2, { validate: false });
		const after = store.getFieldState('n');
		expect(after).not.toBe(before);
		expect(after.value).toBe(2);
	});

	it('reset restores initial values and clears flags', () => {
		const store = createFormStore();
		store.registerField({ key: 'n', initialValue: 1 });
		store.setValue('n', 99, { touch: true });
		store.reset();
		const state = store.getFieldState('n');
		expect(state.value).toBe(1);
		expect(state.dirty).toBe(false);
		expect(state.touched).toBe(false);
	});

	it('reset with explicit values rebases initial', () => {
		const store = createFormStore();
		store.registerField({ key: 'n', initialValue: 1 });
		store.setValue('n', 99);
		store.reset({ n: 50 });
		const state = store.getFieldState('n');
		expect(state.value).toBe(50);
		expect(state.initialValue).toBe(50);
		expect(state.dirty).toBe(false);
	});

	it('derived state respects ignoreDirtyState', () => {
		const store = createFormStore();
		store.registerField({ key: 'tracked', initialValue: 'a' });
		store.registerField({ key: 'audit', initialValue: 'b', ignoreDirtyState: true });
		store.setValue('audit', 'changed', { validate: false });
		expect(store.getDerived().isDirty).toBe(false);
		store.setValue('tracked', 'changed', { validate: false });
		expect(store.getDerived().isDirty).toBe(true);
	});

	it('hidden fields (via runtimeOverrides) are excluded from getValues', () => {
		const store = createFormStore();
		store.registerField({ key: 'a', initialValue: 1 });
		store.registerField({ key: 'b', initialValue: 2 });
		store.setRuntimeProps('b', { hidden: true });
		expect(store.getValues()).toEqual({ a: 1 });
	});

	it('group-hidden fields are excluded from getValues', () => {
		const store = createFormStore();
		store.registerField({ key: 'a', initialValue: 1 });
		store.registerField({ key: 'b', initialValue: 2 });
		store.registerGroup({ id: 'g1' });
		store.setGroupFieldKeys('g1', ['b']);
		store.setGroupRuntimeProps('g1', { hidden: true });
		expect(store.getValues()).toEqual({ a: 1 });
	});

	it('resetField restores initialValue and clears flags', () => {
		const store = createFormStore();
		store.registerField({ key: 'a', initialValue: 'init' });
		store.setValue('a', 'changed', { touch: true });
		store.resetField('a');
		const state = store.getFieldState('a');
		expect(state.value).toBe('init');
		expect(state.dirty).toBe(false);
		expect(state.touched).toBe(false);
	});

	it('submit blocks when validation fails', async () => {
		const store = createFormStore();
		store.registerField({
			key: 'name',
			initialValue: '',
			validators: { required: true },
		});
		const handler = vi.fn();
		await store.submit(handler);
		expect(handler).not.toHaveBeenCalled();
		expect(store.getFieldState('name').error).toBe('This field is required');
	});

	it('submit calls handler with values when validation passes', async () => {
		const store = createFormStore();
		store.registerField({
			key: 'name',
			initialValue: 'Ada',
			validators: { required: true, minLength: 2 },
		});
		const handler = vi.fn();
		await store.submit(handler);
		expect(handler).toHaveBeenCalledWith({ name: 'Ada' });
	});

	it('getNestedValues assembles dotted keys into nested arrays/objects', () => {
		const store = createFormStore();
		store.registerField({ key: 'fullName', initialValue: 'Ada' });
		store.registerField({ key: 'bankAccounts.0.currency', initialValue: 'USD' });
		store.registerField({ key: 'bankAccounts.1.currency', initialValue: 'EUR' });
		expect(store.getNestedValues()).toEqual({
			fullName: 'Ada',
			bankAccounts: [{ currency: 'USD' }, { currency: 'EUR' }],
		});
	});

	it('getNestedValues excludes hidden fields like getValues', () => {
		const store = createFormStore();
		store.registerField({ key: 'bankAccounts.0.currency', initialValue: 'USD' });
		store.registerField({ key: 'bankAccounts.1.currency', initialValue: 'EUR' });
		store.setRuntimeProps('bankAccounts.1.currency', { hidden: true });
		expect(store.getNestedValues()).toEqual({
			bankAccounts: [{ currency: 'USD' }],
		});
	});

	it('submit passes nested values to the handler', async () => {
		const store = createFormStore();
		store.registerField({ key: 'bankAccounts.0.currency', initialValue: 'USD' });
		const handler = vi.fn();
		await store.submit(handler);
		expect(handler).toHaveBeenCalledWith({ bankAccounts: [{ currency: 'USD' }] });
	});

	it('validateAll marks every validated field touched (enters validation stage)', async () => {
		const store = createFormStore();
		store.registerField({ key: 'a', initialValue: '', validators: { required: true } });
		store.registerField({ key: 'b', initialValue: '', validators: { required: true } });
		expect(store.getFieldState('a').touched).toBe(false);
		expect(store.getFieldState('b').touched).toBe(false);
		await store.validateAll();
		expect(store.getFieldState('a').touched).toBe(true);
		expect(store.getFieldState('b').touched).toBe(true);
	});

	it('submit reveals errors on fields the user never touched', async () => {
		const store = createFormStore();
		store.registerField({ key: 'name', initialValue: '', validators: { required: true } });
		// No interaction at all — this is the "click submit without touching" case.
		await store.submit(vi.fn());
		const state = store.getFieldState('name');
		expect(state.touched).toBe(true);
		expect(state.error).toBe('This field is required');
	});

	it('validateAll(keys) only touches the given fields (wizard step scope)', async () => {
		const store = createFormStore();
		store.registerField({ key: 'step1', initialValue: '', validators: { required: true } });
		store.registerField({ key: 'step2', initialValue: '', validators: { required: true } });
		await store.validateAll(['step1']);
		expect(store.getFieldState('step1').touched).toBe(true);
		// step2 belongs to a later step — it must stay silent until its own submit.
		expect(store.getFieldState('step2').touched).toBe(false);
		expect(store.getFieldState('step2').error).toBe(null);
	});
});
