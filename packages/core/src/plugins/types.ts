// Plugin system — lifecycle hooks for cross-cutting concerns (logging,
// autosave, analytics, etc.). Plugins are attached on `<Form plugins={[...]} />`.

import type { FormStore } from '../store/types';
import type { FormSchema } from '../types/schema';

export interface PluginContext {
	store: FormStore;
	// biome-ignore lint/suspicious/noExplicitAny: schema generic erased for plugin api.
	schema: FormSchema<any>;
}

export interface FormPlugin {
	/** Stable identifier (used for cleanup tracking / debugging). */
	name: string;
	/** Called once when the plugin attaches. */
	onInit?(ctx: PluginContext): void;
	/** Called whenever a registered field's value changes. */
	onChange?(ctx: PluginContext, key: string, value: unknown): void;
	/** Called when the form submits successfully. */
	onSubmit?(ctx: PluginContext, values: Record<string, unknown>): void | Promise<void>;
	/** Called when the plugin detaches (Form unmount, schema change). */
	onDestroy?(ctx: PluginContext): void;
}

/** Identity helper — convenience for users defining plugins inline with TS inference. */
export function definePlugin(plugin: FormPlugin): FormPlugin {
	return plugin;
}
