// Topic-based listener primitives. Each topic is a string (field key, or the
// special form-wide topic). Listeners are stored in a Set per topic; notifying
// a topic only wakes its subscribers — O(1) for unrelated fields.

export interface ListenerHub {
	on(topic: string, listener: () => void): () => void;
	/**
	 * Subscribe to a `prefix` key AND every descendant key (`prefix.*`, at any
	 * depth). Fires whenever `emit(topic)` runs for `prefix` itself or for any
	 * dot-boundary descendant of it. Used for container fields (e.g. a
	 * `repeatingGroup`) so a dependent wakes on both add/remove (the container
	 * scalar) and edits to any row field (`prefix.0.field`). Does not disturb
	 * exact-key `on`/`emit` semantics.
	 */
	onSubtree(prefix: string, listener: () => void): () => void;
	emit(topic: string): void;
	clear(): void;
}

export function createListenerHub(): ListenerHub {
	const topics = new Map<string, Set<() => void>>();
	// Separate registry keyed by prefix; only consulted during `emit` when a
	// subtree listener exists, so exact-key subscribers pay nothing.
	const subtrees = new Map<string, Set<() => void>>();

	function addTo(map: Map<string, Set<() => void>>, key: string, listener: () => void): () => void {
		let set = map.get(key);
		if (!set) {
			set = new Set();
			map.set(key, set);
		}
		set.add(listener);
		return () => {
			const s = map.get(key);
			if (!s) return;
			s.delete(listener);
			if (s.size === 0) map.delete(key);
		};
	}

	function on(topic: string, listener: () => void): () => void {
		return addTo(topics, topic, listener);
	}

	function onSubtree(prefix: string, listener: () => void): () => void {
		return addTo(subtrees, prefix, listener);
	}

	function notify(set: Set<() => void> | undefined): void {
		if (!set) return;
		// Snapshot to allow listeners to unsubscribe during iteration.
		for (const listener of [...set]) {
			listener();
		}
	}

	function emit(topic: string): void {
		notify(topics.get(topic));
		// Notify subtree listeners registered on `topic` or any of its ancestors
		// (walking dot boundaries: `a.0.x` → `a.0` → `a`). Skipped entirely when
		// no subtree listeners exist.
		if (subtrees.size === 0) return;
		let key = topic;
		while (true) {
			notify(subtrees.get(key));
			const dot = key.lastIndexOf('.');
			if (dot < 0) break;
			key = key.slice(0, dot);
		}
	}

	function clear(): void {
		topics.clear();
		subtrees.clear();
	}

	return { on, onSubtree, emit, clear };
}

export const FORM_TOPIC = '__easy_forms_form__';
