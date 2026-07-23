// renderForm — TEST-ONLY mount helper. NOT exported from src/index.ts, NOT
// shipped in the published package.
//
// Replicates exactly what the deleted `<Form>` (see git history prior to
// commit 843696a) did for tests, MINUS all rendered chrome: creates/accepts a
// store, merges dependency handlers, attaches the dependency engine and
// plugins in the same after-children-effects mount order the real Form used
// (Field registers itself in its own useEffect; the engine-attach effect here
// runs after every child's effect in commit order, so it sees every
// registered field on first run), and provides the three contexts a schema
// tree needs to render (FormStoreContext, RendererRegistryContext,
// ChromeRegistryContext).
//
// The inline TestGroupRenderer preserves the exact semantics the deleted
// `components/GroupRenderer.tsx` had that the dependency/plugin test suites
// depend on: it reads `useGroup(group.id)` for runtime overrides, renders
// `group.questions` via core's `Field`, recurses into `group.groups`, and
// CSS-hides (`display: none`) rather than unmounts when the group's
// effective `hidden` is true — so descendant field state/registration
// survives hide/show (cascade-hidden, clearWhenHidden, getValues-exclusion
// tests all rely on this). Layout lives on an inner `<div>`, matching the
// old "grid class goes on the content div, not the section" contract.
//
// This is a drop-in replacement for `<Form schema registry initialValues
// plugins dependencyHandlers store onSubmit />` — only the mount mechanism
// changed, not the prop shape. No submit button is rendered: no test in this
// suite clicks a submit control, so submission (where exercised) should be
// driven directly via `store.submit(...)`.
//
// `renderWizard` below is the wizard-flavored sibling: it mounts every
// step's groups (via the same `TestGroupRenderer`) so their fields register,
// attaches the dependency engine against a synthetic `{ groups: [], wizard }`
// schema (mirrors how `buildDependencyGraph` walks `schema.wizard.steps`),
// and calls `useWizardRuntime` to drive navigation — exposing the returned
// `WizardContextValue` via `getContext()` so tests can act on it directly
// instead of clicking chrome that no longer exists in core.

import { type RenderResult, render } from '@testing-library/react';
import { useEffect, useMemo } from 'react';
import { Field } from '../../src/components/Field';
import { RendererRegistryContext } from '../../src/components/RegistryContext';
import { ChromeRegistryContext } from '../../src/context/ChromeRegistryContext';
import { FormStoreProvider } from '../../src/context/FormStoreProvider';
import {
	type DependencyHandlerRegistry,
	attachDependencyEngine,
	defaultDependencyHandlers,
} from '../../src/dependencies';
import { useGroup } from '../../src/hooks/useGroup';
import { type FormPlugin, attachPlugins } from '../../src/plugins';
import { createFormStore } from '../../src/store/createFormStore';
import type { FormStore } from '../../src/store/types';
import type { Group } from '../../src/types/group';
import type { RendererRegistry } from '../../src/types/renderer';
import type { FormSchema, WizardConfig } from '../../src/types/schema';
import type { WizardContextValue } from '../../src/wizard/WizardContext';
import { useWizardRuntime } from '../../src/wizard/useWizardRuntime';

export interface RenderFormProps<
	TFormData extends Record<string, unknown> = Record<string, unknown>,
> {
	schema: FormSchema<TFormData>;
	registry: RendererRegistry;
	initialValues?: Partial<TFormData>;
	/** Provide an external store; otherwise one is created internally. */
	store?: FormStore;
	/** Additional or replacement dependency handlers. Merged on top of defaults. */
	dependencyHandlers?: DependencyHandlerRegistry;
	/** Plugins (logger, autosave, custom). Lifecycle hooks fire across the form. */
	plugins?: FormPlugin[];
	/** Accepted for API parity with the old `<Form>`; not wired to any UI here. */
	onSubmit?: (values: TFormData) => void | Promise<void>;
}

interface TestGroupRendererProps {
	// Same variance dodge the deleted GroupRenderer used: Group is generic in
	// TFormData but this renderer only iterates structure.
	// biome-ignore lint/suspicious/noExplicitAny: see comment above.
	group: Group<any>;
	depth?: number;
}

function TestGroupRenderer({ group, depth = 0 }: TestGroupRendererProps) {
	const overrides = useGroup(group.id);
	const hidden = overrides.hidden === true;
	const style = hidden ? { display: 'none' as const } : undefined;

	return (
		<section data-depth={depth} style={style} aria-hidden={hidden || undefined}>
			<div>
				{group.questions?.map((question) => (
					<Field key={question.key} question={question} />
				))}
				{group.groups?.map((child, index) => (
					<TestGroupRenderer
						key={child.id ?? child.title ?? `group-${depth}-${index}`}
						group={child}
						depth={depth + 1}
					/>
				))}
			</div>
		</section>
	);
}

function TestForm<TFormData extends Record<string, unknown> = Record<string, unknown>>(
	props: RenderFormProps<TFormData>
) {
	const {
		schema,
		registry,
		initialValues,
		store: externalStore,
		dependencyHandlers,
		plugins,
	} = props;

	const store = useMemo(
		() =>
			externalStore ??
			createFormStore({ initialValues: initialValues as Record<string, unknown> | undefined }),
		[externalStore, initialValues]
	);

	const handlers = useMemo(
		() => ({ ...defaultDependencyHandlers, ...dependencyHandlers }),
		[dependencyHandlers]
	);

	// Attach the dependency engine after fields have had a chance to register
	// on first mount — same sibling-effect mount-order contract the real
	// Form/AdvancedWizard rely on. Fields call store.registerField in their
	// own useEffect, so this engine-attach effect (also a useEffect) runs
	// after them in commit order.
	useEffect(() => {
		const attached = attachDependencyEngine(store, schema, handlers);
		return attached.detach;
	}, [store, schema, handlers]);

	useEffect(() => {
		if (!plugins || plugins.length === 0) return;
		return attachPlugins(store, schema, plugins);
	}, [plugins, store, schema]);

	return (
		<FormStoreProvider store={store}>
			<RendererRegistryContext.Provider value={registry}>
				<ChromeRegistryContext.Provider value={{ GroupRenderer: TestGroupRenderer }}>
					<FormBody schema={schema} />
				</ChromeRegistryContext.Provider>
			</RendererRegistryContext.Provider>
		</FormStoreProvider>
	);
}

// biome-ignore lint/suspicious/noExplicitAny: same variance dodge as Group<any> — this component only iterates structure, never reads the typed values shape.
function FormBody({ schema }: { schema: FormSchema<any> }) {
	return (
		<>
			{schema.groups.map((group, index) => (
				<TestGroupRenderer key={group.id ?? group.title ?? `root-${index}`} group={group} />
			))}
		</>
	);
}

/** Mounts a schema exactly like the old `<Form>` did, minus chrome. Returns the RTL render result. */
export function renderForm<TFormData extends Record<string, unknown> = Record<string, unknown>>(
	props: RenderFormProps<TFormData>
): RenderResult {
	return render(<TestForm {...props} />);
}

export interface RenderWizardProps<
	TFormData extends Record<string, unknown> = Record<string, unknown>,
> {
	wizard: WizardConfig<TFormData>;
	registry: RendererRegistry;
	initialValues?: Partial<TFormData>;
	/** Provide an external store; otherwise one is created internally. */
	store?: FormStore;
	onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
}

export interface RenderWizardResult extends RenderResult {
	store: FormStore;
	/** Latest `WizardContextValue` returned by `useWizardRuntime` — read after
	 * an `act(...)`-wrapped interaction so pending state updates have flushed. */
	getContext: () => WizardContextValue;
}

// Renders every step's groups (all steps mounted, matching the deleted
// `<Wizard>`'s "everything registered, only display toggles" contract) and
// drives `useWizardRuntime`, stashing the latest context on `ctxBox` on every
// render so the test can read it after an interaction settles.
function WizardInner<TFormData extends Record<string, unknown>>({
	wizard,
	onSubmit,
	store,
	ctxBox,
}: {
	wizard: WizardConfig<TFormData>;
	onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
	store: FormStore;
	ctxBox: { current: WizardContextValue | null };
}) {
	// Synthetic schema so `buildDependencyGraph`/`attachDependencyEngine` walk
	// the wizard's step groups exactly as the real engine does for `<Form>`.
	const schema = useMemo<FormSchema<TFormData>>(() => ({ groups: [], wizard }), [wizard]);

	useEffect(() => {
		const attached = attachDependencyEngine(store, schema, defaultDependencyHandlers);
		return attached.detach;
	}, [store, schema]);

	// biome-ignore lint/suspicious/noExplicitAny: WizardConfig<TFormData> vs WizardConfig<any> — same variance dodge useWizardRuntime itself uses.
	const ctx = useWizardRuntime(wizard as WizardConfig<any>, { onSubmit });
	ctxBox.current = ctx;

	return (
		<>
			{wizard.steps.map((step) => (
				<div key={step.id} data-step-id={step.id}>
					{step.groups.map((group, gi) => (
						<TestGroupRenderer key={group.id ?? group.title ?? `${step.id}-${gi}`} group={group} />
					))}
				</div>
			))}
		</>
	);
}

/**
 * Mounts a `WizardConfig` exactly like the old `<Wizard>` did (every step's
 * groups rendered, fields registered), minus chrome — driving
 * `useWizardRuntime` directly instead of Next/Back buttons. Use
 * `getContext()` (after wrapping interactions in `act`/`await`) to read
 * navigation state and call `goNext`/`goPrevious`/`goTo`/`submit`.
 */
export function renderWizard<TFormData extends Record<string, unknown> = Record<string, unknown>>(
	props: RenderWizardProps<TFormData>
): RenderWizardResult {
	const { wizard, registry, initialValues, store: externalStore, onSubmit } = props;
	const store =
		externalStore ??
		createFormStore({ initialValues: initialValues as Record<string, unknown> | undefined });
	const ctxBox: { current: WizardContextValue | null } = { current: null };

	const result = render(
		<FormStoreProvider store={store}>
			<RendererRegistryContext.Provider value={registry}>
				<ChromeRegistryContext.Provider value={{ GroupRenderer: TestGroupRenderer }}>
					<WizardInner wizard={wizard} onSubmit={onSubmit} store={store} ctxBox={ctxBox} />
				</ChromeRegistryContext.Provider>
			</RendererRegistryContext.Provider>
		</FormStoreProvider>
	);

	return {
		...result,
		store,
		getContext: () => {
			if (!ctxBox.current) {
				throw new Error('renderWizard: WizardContextValue not ready yet.');
			}
			return ctxBox.current;
		},
	};
}
