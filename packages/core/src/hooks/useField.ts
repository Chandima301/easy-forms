import { useCallback, useSyncExternalStore } from 'react';
import { useFormStoreContext } from '../context/useFormStoreContext';
import type { FieldState } from '../store/types';
import type { RuntimeProps } from '../types/dependencies';

export interface UseFieldReturn<T = unknown> {
	value: T;
	error: string | null;
	errors: Record<string, string>;
	touched: boolean;
	dirty: boolean;
	validating: boolean;
	/** Dynamic prop overrides from `propsDependsOn`. Merged into effective question by <Field>. */
	runtimeOverrides: Partial<RuntimeProps>;
	/** True when an ancestor group has set `hidden: true` (cascade). */
	hiddenByAncestor: boolean;
	/** True if the field is effectively hidden (own override OR ancestor). */
	hidden: boolean;
	setValue: (value: T) => void;
	setTouched: (touched?: boolean) => void;
	validate: () => Promise<boolean>;
}

export function useField<T = unknown>(key: string): UseFieldReturn<T> {
	const store = useFormStoreContext();
	const subscribe = useCallback((cb: () => void) => store.subscribeField(key, cb), [store, key]);
	const getSnapshot = useCallback((): FieldState => store.getFieldState(key), [store, key]);
	const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
	const setValue = useCallback((v: T) => store.setValue(key, v, { touch: true }), [store, key]);
	const setTouched = useCallback((touched = true) => store.setTouched(key, touched), [store, key]);
	const validate = useCallback(() => store.validateField(key), [store, key]);
	return {
		value: state.value as T,
		error: state.error,
		errors: state.errors,
		touched: state.touched,
		dirty: state.dirty,
		validating: state.validating,
		runtimeOverrides: state.runtimeOverrides,
		hiddenByAncestor: state.hiddenByAncestor,
		hidden: state.runtimeOverrides.hidden === true || state.hiddenByAncestor,
		setValue,
		setTouched,
		validate,
	};
}
