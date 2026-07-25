// Host wiring for a form, as a hook: owns the store, the merged dependency
// handlers, and the engine + plugin attachment. An ejectable <EasyForm> calls this
// and renders only chrome, so nothing behavioural lives in the ejected file.
import { useEffect, useMemo } from 'react';
import {
	type DependencyHandlerRegistry,
	attachDependencyEngine,
	defaultDependencyHandlers,
} from '../dependencies';
import { type FormPlugin, attachPlugins } from '../plugins';
import { createFormStore } from '../store/createFormStore';
import type { FormStore } from '../store/types';
import type { FormSchema } from '../types/schema';

export interface UseFormRuntimeOptions {
	initialValues?: Record<string, unknown>;
	/** Provide an external store; otherwise one is created internally. */
	store?: FormStore;
	/** Additional or replacement dependency handlers, merged over the defaults. */
	dependencyHandlers?: DependencyHandlerRegistry;
	plugins?: FormPlugin[];
}

export interface UseFormRuntimeResult {
	/** The store this form is driving. Provide it via <FormStoreProvider>. */
	store: FormStore;
}

export function useFormRuntime(
	// FormSchema is generic in TFormData; the runtime only walks structure.
	// biome-ignore lint/suspicious/noExplicitAny: variance dodge, matches engine.
	schema: FormSchema<any>,
	options: UseFormRuntimeOptions = {}
): UseFormRuntimeResult {
	const { initialValues, store: externalStore, dependencyHandlers, plugins } = options;

	const store = useMemo(
		() => externalStore ?? createFormStore({ initialValues }),
		[externalStore, initialValues]
	);
	const handlers = useMemo(
		() => ({ ...defaultDependencyHandlers, ...dependencyHandlers }),
		[dependencyHandlers]
	);

	// Attaches after descendant <Field>s have registered (child effects run first),
	// so the engine's initial pass sees every field.
	useEffect(() => {
		const attached = attachDependencyEngine(store, schema, handlers);
		return attached.detach;
	}, [store, schema, handlers]);
	useEffect(() => {
		if (!plugins || plugins.length === 0) return;
		return attachPlugins(store, schema, plugins);
	}, [store, schema, plugins]);

	return { store };
}
