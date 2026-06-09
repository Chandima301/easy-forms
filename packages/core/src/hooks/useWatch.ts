import { useEffect, useState } from 'react';
import { useFormStoreContext } from '../context/useFormStoreContext';

/**
 * Subscribes to one or more field values. Re-renders only when one of the
 * watched keys' value changes.
 */
export function useWatch<T = unknown>(key: string): T;
export function useWatch<T extends Record<string, unknown>>(keys: string[]): T;
export function useWatch(input: string | string[]): unknown {
	const store = useFormStoreContext();
	const keys = Array.isArray(input) ? input : [input];
	const [, force] = useState(0);

	useEffect(() => {
		const unsubs = keys.map((k) => store.subscribeField(k, () => force((n) => n + 1)));
		return () => {
			for (const u of unsubs) u();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [store, keys.join('|')]);

	if (Array.isArray(input)) {
		const out: Record<string, unknown> = {};
		for (const k of input) out[k] = store.getValue(k);
		return out;
	}
	return store.getValue(input);
}
