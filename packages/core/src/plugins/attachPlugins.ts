// attachPlugins — wires a plugin list into a form store + schema. Returns
// a detach function suitable for a React useEffect cleanup.
//
// onChange dispatch:
//   - Walks the schema (including wizard steps) to collect every field key
//   - Subscribes per-key so plugins receive the changed key + value
//
// onSubmit dispatch:
//   - The current store doesn't expose a post-submit hook directly. Plugins
//     that need it should monkey-patch the store's submit OR consumers can
//     call `runOnSubmit` manually. For now we hook the form-topic change
//     stream and invoke onSubmit when submitCount increments.

import type { FormStore } from '../store/types';
import type { Group } from '../types/group';
import type { FormSchema } from '../types/schema';
import type { FormPlugin, PluginContext } from './types';

function walkGroup(group: Group, keys: string[]): void {
	for (const q of group.questions ?? []) keys.push(q.key);
	for (const child of group.groups ?? []) walkGroup(child, keys);
}

function collectAllFieldKeys(schema: FormSchema): string[] {
	const keys: string[] = [];
	for (const group of schema.groups) walkGroup(group, keys);
	if (schema.wizard) {
		for (const step of schema.wizard.steps) {
			for (const group of step.groups) walkGroup(group, keys);
		}
	}
	return keys;
}

export function attachPlugins(
	store: FormStore,
	// biome-ignore lint/suspicious/noExplicitAny: schema generic erased for plugins.
	schema: FormSchema<any>,
	plugins: FormPlugin[]
): () => void {
	const ctx: PluginContext = { store, schema };

	for (const plugin of plugins) plugin.onInit?.(ctx);

	const unsubs: Array<() => void> = [];

	// Per-field subscriptions for onChange. Each listener captures the key so
	// the plugin learns which field actually fired.
	const keys = collectAllFieldKeys(schema);
	for (const key of keys) {
		const unsub = store.subscribeField(key, () => {
			const value = store.getValue(key);
			for (const plugin of plugins) plugin.onChange?.(ctx, key, value);
		});
		unsubs.push(unsub);
	}

	// onSubmit dispatch — fires when submitCount changes and isSubmitting
	// just dropped to false (i.e., submit completed). We compare snapshots.
	let lastSubmitCount = store.getDerived().submitCount;
	let wasSubmitting = store.getDerived().isSubmitting;
	const formUnsub = store.subscribeForm(() => {
		const d = store.getDerived();
		// Detect submit completion: submitCount incremented AND not currently submitting.
		if (d.submitCount > lastSubmitCount && wasSubmitting && !d.isSubmitting) {
			lastSubmitCount = d.submitCount;
			for (const plugin of plugins) void plugin.onSubmit?.(ctx, d.values);
		}
		if (d.submitCount > lastSubmitCount) lastSubmitCount = d.submitCount;
		wasSubmitting = d.isSubmitting;
	});
	unsubs.push(formUnsub);

	return () => {
		for (const u of unsubs) u();
		for (const plugin of plugins) plugin.onDestroy?.(ctx);
	};
}
