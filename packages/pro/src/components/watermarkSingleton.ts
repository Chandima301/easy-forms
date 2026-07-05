import { useEffect, useState } from 'react';

// A module-level owner registry so that, no matter how many Pro items mount a
// <ProWatermark>, only ONE badge renders at a time. The first mounted instance
// becomes the owner; when it unmounts, ownership hands off to the next mounted
// instance. This keeps the watermark inside Pro-owned code (the item, not the
// ejectable renderer) while avoiding N stacked badges when a repeating group
// has many rows.

const mounted: symbol[] = [];
let owner: symbol | null = null;
const listeners = new Set<() => void>();

function emit(): void {
	for (const listener of listeners) listener();
}

function register(id: symbol): () => void {
	mounted.push(id);
	if (owner === null) {
		owner = id;
		emit();
	}
	return () => {
		const at = mounted.indexOf(id);
		if (at >= 0) mounted.splice(at, 1);
		if (owner === id) {
			owner = mounted[0] ?? null;
			emit();
		}
	};
}

/**
 * Returns `true` for exactly one mounted caller at a time. Used by
 * `RepeatingGroupItem` so a multi-row group shows a single watermark, with
 * automatic hand-off when the owning row is removed.
 */
export function useWatermarkSingleton(): boolean {
	const [isOwner, setIsOwner] = useState(false);

	useEffect(() => {
		const id = Symbol('easy-forms-pro-watermark');
		const update = () => setIsOwner(owner === id);
		listeners.add(update);
		const unregister = register(id);
		update();
		return () => {
			listeners.delete(update);
			unregister();
		};
	}, []);

	return isOwner;
}
