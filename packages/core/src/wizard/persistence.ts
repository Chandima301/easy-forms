// Debounced localStorage persistence for the wizard.
//
// Persisted shape: `{ values, currentStepIndex }`. On mount, the wizard
// hydrates each value into the store and restores the step index. On
// successful submit, the key is cleared.
//
// SSR-safe: `window` is checked before any access.

export interface WizardPersistedState {
	values: Record<string, unknown>;
	currentStepIndex: number;
}

function hasLocalStorage(): boolean {
	return typeof window !== 'undefined' && !!window.localStorage;
}

export function loadPersisted(key: string): WizardPersistedState | null {
	if (!hasLocalStorage()) return null;
	try {
		const raw = window.localStorage.getItem(key);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as WizardPersistedState;
		if (
			typeof parsed === 'object' &&
			parsed !== null &&
			typeof parsed.currentStepIndex === 'number' &&
			parsed.values &&
			typeof parsed.values === 'object'
		) {
			return parsed;
		}
	} catch {
		/* corrupted — fall through to null */
	}
	return null;
}

export function savePersisted(key: string, state: WizardPersistedState): void {
	if (!hasLocalStorage()) return;
	try {
		window.localStorage.setItem(key, JSON.stringify(state));
	} catch {
		/* quota exceeded or disabled — silent ignore */
	}
}

export function clearPersisted(key: string): void {
	if (!hasLocalStorage()) return;
	try {
		window.localStorage.removeItem(key);
	} catch {
		/* ignore */
	}
}

export function createDebouncedSaver(
	key: string,
	delayMs = 250
): (state: WizardPersistedState) => void {
	let timer: ReturnType<typeof setTimeout> | null = null;
	let latest: WizardPersistedState | null = null;
	return (state) => {
		latest = state;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			if (latest) savePersisted(key, latest);
			timer = null;
		}, delayMs);
	};
}
