// Topic-based listener primitives. Each topic is a string (field key, or the
// special form-wide topic). Listeners are stored in a Set per topic; notifying
// a topic only wakes its subscribers — O(1) for unrelated fields.

export interface ListenerHub {
	on(topic: string, listener: () => void): () => void;
	emit(topic: string): void;
	clear(): void;
}

export function createListenerHub(): ListenerHub {
	const topics = new Map<string, Set<() => void>>();

	function on(topic: string, listener: () => void): () => void {
		let set = topics.get(topic);
		if (!set) {
			set = new Set();
			topics.set(topic, set);
		}
		set.add(listener);
		return () => {
			const s = topics.get(topic);
			if (!s) return;
			s.delete(listener);
			if (s.size === 0) topics.delete(topic);
		};
	}

	function emit(topic: string): void {
		const set = topics.get(topic);
		if (!set) return;
		// Snapshot to allow listeners to unsubscribe during iteration.
		for (const listener of [...set]) {
			listener();
		}
	}

	function clear(): void {
		topics.clear();
	}

	return { on, emit, clear };
}

export const FORM_TOPIC = '__easy_forms_form__';
