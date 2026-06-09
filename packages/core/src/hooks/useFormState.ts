import { useCallback, useRef, useSyncExternalStore } from 'react';
import { useFormStoreContext } from '../context/useFormStoreContext';
import type { FormDerivedState } from '../store/types';

/**
 * Subscribes to form-wide derived state (isDirty, isValid, isSubmitting, etc.).
 * Computed lazily on each form-topic emit. Use sparingly — every field change
 * causes a re-render of consumers of this hook.
 */
export function useFormState(): FormDerivedState {
	const store = useFormStoreContext();
	const subscribe = useCallback((cb: () => void) => store.subscribeForm(cb), [store]);
	// useRef gives us a stable cache across renders so useSyncExternalStore can
	// return the same reference when the derived state hasn't actually changed.
	const cachedRef = useRef<FormDerivedState | null>(null);
	const getSnapshot = useCallback((): FormDerivedState => {
		const next = store.getDerived();
		const cached = cachedRef.current;
		if (cached && shallowEqual(cached, next)) return cached;
		cachedRef.current = next;
		return next;
	}, [store]);
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function shallowEqual(a: FormDerivedState, b: FormDerivedState): boolean {
	return (
		a.isDirty === b.isDirty &&
		a.isValid === b.isValid &&
		a.isSubmitting === b.isSubmitting &&
		a.submitCount === b.submitCount &&
		keysShallowEqual(a.values, b.values) &&
		keysShallowEqual(a.dirtyFields, b.dirtyFields) &&
		keysShallowEqual(a.touchedFields, b.touchedFields) &&
		keysShallowEqual(a.errors, b.errors)
	);
}

function keysShallowEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);
	if (aKeys.length !== bKeys.length) return false;
	for (const k of aKeys) {
		if (!Object.is(a[k], b[k])) return false;
	}
	return true;
}
