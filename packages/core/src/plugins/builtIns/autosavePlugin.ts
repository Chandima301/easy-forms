import { type FormPlugin, definePlugin } from '../types';

export interface AutosavePluginOptions {
	/** localStorage key. */
	key: string;
	/** Debounce delay in ms. Default 500. */
	delayMs?: number;
	/** Clear the persisted entry after a successful submit. Default true. */
	clearOnSubmit?: boolean;
}

/**
 * Debounces form values into localStorage under `key`. Combine with explicit
 * hydration on form mount if you want resume-from-draft semantics.
 *
 * (For wizard forms, prefer `WizardConfig.persistKey` — that one also tracks
 * the current step index.)
 */
export function autosavePlugin(options: AutosavePluginOptions): FormPlugin {
	const { key, delayMs = 500, clearOnSubmit = true } = options;
	let timer: ReturnType<typeof setTimeout> | null = null;

	function hasLocalStorage(): boolean {
		return typeof window !== 'undefined' && !!window.localStorage;
	}

	function schedule(values: Record<string, unknown>): void {
		if (!hasLocalStorage()) return;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			try {
				window.localStorage.setItem(key, JSON.stringify(values));
			} catch {
				/* quota / disabled — silent */
			}
			timer = null;
		}, delayMs);
	}

	return definePlugin({
		name: 'autosavePlugin',
		onChange: (ctx) => schedule(ctx.store.getValues()),
		onSubmit: () => {
			if (!clearOnSubmit || !hasLocalStorage()) return;
			try {
				window.localStorage.removeItem(key);
			} catch {
				/* ignore */
			}
		},
		onDestroy: () => {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
		},
	});
}
