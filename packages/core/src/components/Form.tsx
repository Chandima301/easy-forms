// Form — the top-level component. Creates a FormStore (unless one is supplied),
// provides the store and renderer registry via context, walks the schema, and
// renders a submit button at the bottom. Wizard support lands in Phase 6.

import { useEffect, useMemo } from 'react';
import { FormStoreProvider } from '../context/FormStoreProvider';
import {
	attachDependencyEngine,
	defaultDependencyHandlers,
	type DependencyHandlerRegistry,
} from '../dependencies';
import { useFormState } from '../hooks/useFormState';
import { attachPlugins, type FormPlugin } from '../plugins';
import { createFormStore } from '../store/createFormStore';
import type { FormStore } from '../store/types';
import type { FormSchema } from '../types/schema';
import type { RendererRegistry } from '../types/renderer';
import { GroupRenderer } from './GroupRenderer';
import { RendererRegistryContext } from './RegistryContext';
import { Wizard } from './Wizard';

export interface FormProps<TFormData extends Record<string, unknown> = Record<string, unknown>> {
	schema: FormSchema<TFormData>;
	registry: RendererRegistry;
	initialValues?: Partial<TFormData>;
	onSubmit: (values: TFormData) => void | Promise<void>;
	/** Provide an external store; otherwise one is created internally. */
	store?: FormStore;
	/** Additional or replacement dependency handlers. Merged on top of defaults. */
	dependencyHandlers?: DependencyHandlerRegistry;
	/** Plugins (logger, autosave, custom). Lifecycle hooks fire across the form. */
	plugins?: FormPlugin[];
	submitLabel?: string;
	resetLabel?: string;
	showReset?: boolean;
	className?: string;
	/** When the schema has `wizard`, override these labels on the Wizard navigation. */
	wizardNextLabel?: string;
	wizardPreviousLabel?: string;
}

export function Form<TFormData extends Record<string, unknown> = Record<string, unknown>>(
	props: FormProps<TFormData>
) {
	const {
		schema,
		registry,
		initialValues,
		onSubmit,
		store: externalStore,
		dependencyHandlers,
		plugins,
		submitLabel = 'Submit',
		resetLabel = 'Reset',
		showReset = false,
		className,
		wizardNextLabel,
		wizardPreviousLabel,
	} = props;

	const store = useMemo(
		() =>
			externalStore ??
			createFormStore({ initialValues: initialValues as Record<string, unknown> | undefined }),
		// Schema identity changes on each render in some setups, so we only re-create
		// the store when the externalStore reference or initialValues object changes.
		// Consumers expecting full re-init on schema change can lift the store outside.
		[externalStore, initialValues]
	);

	const handlers = useMemo(
		() => ({ ...defaultDependencyHandlers, ...dependencyHandlers }),
		[dependencyHandlers]
	);

	// Attach the dependency engine after fields have had a chance to register
	// on first mount. Fields call store.registerField in their own useEffect,
	// so the engine — also a useEffect — runs after them in commit order.
	useEffect(() => {
		const attached = attachDependencyEngine(store, schema, handlers);
		return attached.detach;
	}, [store, schema, handlers]);

	// Attach plugins (logger, autosave, etc.). Lifecycle hooks own their own
	// subscriptions; this just dispatches init / destroy and wires onChange.
	useEffect(() => {
		if (!plugins || plugins.length === 0) return;
		return attachPlugins(store, schema, plugins);
	}, [plugins, store, schema]);

	const isWizard = !!schema.wizard;

	return (
		<FormStoreProvider store={store}>
			<RendererRegistryContext.Provider value={registry}>
				<form
					className={['easy-forms', className].filter(Boolean).join(' ')}
					onSubmit={(e) => {
						e.preventDefault();
						// Wizard owns its own submit flow; only the non-wizard form
						// submits through the native form element.
						if (isWizard) return;
						void store.submit((values) => onSubmit(values as TFormData));
					}}
					noValidate
				>
					{schema.title ? (
						<header className="easy-forms__header">
							<h2 className="easy-forms__title">{schema.title}</h2>
							{schema.description ? (
								<p className="easy-forms__description">{schema.description}</p>
							) : null}
						</header>
					) : null}
					{isWizard && schema.wizard ? (
						<Wizard
							wizard={schema.wizard}
							onSubmit={(values) => onSubmit(values as TFormData)}
							nextLabel={wizardNextLabel}
							previousLabel={wizardPreviousLabel}
							submitLabel={submitLabel}
						/>
					) : (
						<>
							<div className="easy-forms__body">
								{schema.groups.map((group, index) => (
									<GroupRenderer
										key={group.id ?? group.title ?? `root-${index}`}
										group={group}
									/>
								))}
							</div>
							<FormFooter
								submitLabel={submitLabel}
								resetLabel={resetLabel}
								showReset={showReset}
								onReset={() => store.reset()}
							/>
						</>
					)}
				</form>
			</RendererRegistryContext.Provider>
		</FormStoreProvider>
	);
}

interface FormFooterProps {
	submitLabel: string;
	resetLabel: string;
	showReset: boolean;
	onReset: () => void;
}

function FormFooter({ submitLabel, resetLabel, showReset, onReset }: FormFooterProps) {
	const { isDirty, isValid, isSubmitting } = useFormState();
	const disabled = !isDirty || !isValid || isSubmitting;
	return (
		<footer className="easy-forms__footer">
			{showReset ? (
				<button
					type="button"
					className="easy-forms__reset"
					onClick={onReset}
					disabled={isSubmitting || !isDirty}
				>
					{resetLabel}
				</button>
			) : null}
			<button type="submit" className="easy-forms__submit" disabled={disabled}>
				{isSubmitting ? '...' : submitLabel}
			</button>
		</footer>
	);
}
