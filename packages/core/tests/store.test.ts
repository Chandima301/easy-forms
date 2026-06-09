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
});
