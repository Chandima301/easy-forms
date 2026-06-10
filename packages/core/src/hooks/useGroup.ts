import { useCallback, useRef, useSyncExternalStore } from 'react';
import { useFormStoreContext } from '../context/useFormStoreContext';
import type { RuntimeProps } from '../types/dependencies';

/**
 * Subscribes to a group's runtime overrides — written by `propsDependsOn` rules
 * declared on the group's `dependents`. Returns a stable reference when the
 * override map hasn't changed, so consumers can use it as a dependency safely.
 */
export function useGroup(id: string | undefined): Partial<RuntimeProps> {
	const store = useFormStoreContext();
	const subscribe = useCallback(
		(cb: () => void) => {
			if (!id) return () => {};
			return store.subscribeGroup(id, cb);
		},
		[store, id]
	);
	const cachedRef = useRef<Partial<RuntimeProps>>({});
	const getSnapshot = useCallback((): Partial<RuntimeProps> => {
		if (!id) return cachedRef.current;
		const next = store.getGroupRuntimeProps(id);
		const cached = cachedRef.current;
		// Shallow-equal check — return same ref if nothing changed.
		const aKeys = Object.keys(next);
		const bKeys = Object.keys(cached);
		if (aKeys.length === bKeys.length) {
			let same = true;
			for (const k of aKeys) {
				if (
					!Object.is((next as Record<string, unknown>)[k], (cached as Record<string, unknown>)[k])
				) {
					same = false;
					break;
				}
			}
			if (same) return cached;
		}
		cachedRef.current = next;
		return next;
	}, [store, id]);
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
