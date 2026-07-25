# @easy-forms/pro

## 1.0.0

### Major Changes

- a4207f4: Thin registry items: all behaviour moves into library hooks.

  Registry items now mirror the shadcn↔radix split — the library holds the behaviour and a
  registry item is a thin styled component you can restyle without being able to break form
  behaviour. **`@easy-forms/pro` now ships zero React components**: only hooks, controls,
  wizard routing, types and the license layer.

  ### Added

  - **`useFormRuntime(schema, options)`** (core) — the free form's host wiring as a hook. Owns
    the store, merges `defaultDependencyHandlers`, and attaches the dependency engine + plugins.
    `options`: `initialValues`, `store` (external store wins), `dependencyHandlers`, `plugins`.
    Returns `{ store }`.
  - **`useFormState(store?)`** (core) — now accepts an optional store, for a hook that creates a
    store and renders the provider below itself. Existing no-arg callers are unaffected.
  - **`useRepeatingGroupItem({ groupKey, index, groups, defaultItem })`** (pro) — one repeated
    row's engine: the memoised key/id prefixing and the per-row dependency engine. Returns
    `{ groups }` for a renderer to draw.
  - **`UseAdvancedWizardResult.store`** (pro) — the store the wizard created; provide it via
    `<FormStoreProvider>`.

  ### Breaking

  **core**

  - Removed `ChromeRegistryContext`, `ChromeRegistry` and `useChromeRegistry`. With no Pro
    components left, every `GroupRenderer` call site is itself a registry file, so it imports
    `GroupRenderer` directly instead of receiving it through a context.
    `GroupRendererProps` is **kept** — the ejected `group-renderer.tsx` still uses it.

    ```diff
    - <ChromeRegistryContext.Provider value={{ GroupRenderer }}>{children}</ChromeRegistryContext.Provider>
    + import { GroupRenderer } from '@/components/easy-forms/group-renderer';
    ```

    Drop the `easyFormsChromeRegistry` export from your ejected `registry.ts`.

  **pro**

  - Removed the `AdvancedWizardPanel` and `RepeatingGroupItem` components (and their prop
    types). Their markup now lives in the ejectable `advanced-wizard.tsx` /
    `repeating-group-renderer.tsx`; re-run `npx shadcn@latest add @easy-forms/advanced-wizard
@easy-forms/repeating-group` to pick up the new versions, or move the markup yourself and
    call `useRepeatingGroupItem` from an in-file `<Row>` component (a component is required —
    hooks cannot run inside a `.map()` callback).
  - Removed `AdvancedWizardContext` and `useAdvancedWizardContext`. The wizard's sub-components
    are direct children of one registry file, so they take `wizard` as a prop.
  - **`useAdvancedWizard` now creates its own store.** It no longer reads an ambient
    `FormStoreContext`, so it must not be called below the provider it is meant to drive —
    call it first, then provide `wizard.store`. It also accepts `initialValues`,
    `dependencyHandlers` and `plugins`, and attaches the dependency engine + plugins itself
    (the old host-side `EngineBridge` is no longer needed).

    ```diff
    - <FormStoreProvider store={store}>
    -   <Inner />   {/* calls useAdvancedWizard, reading the store from context */}
    - </FormStoreProvider>
    + const wizard = useAdvancedWizard(config, { onSubmit, initialValues, dependencyHandlers, plugins });
    + return <FormStoreProvider store={wizard.store}>{/* … */}</FormStoreProvider>;
    ```

  - The peer range on `@easy-forms/core` is raised: pro calls `useFormState(store)`, which
    older core versions do not have.

  No visual or styling changes — markup and class names moved verbatim. The one exception is
  the advanced wizard's step panel, whose class is now `easy-forms-adv-wizard__panel` (was
  `easy-forms-wizard__panel`) for prefix consistency; the free linear wizard keeps
  `easy-forms-wizard__panel`.

### Patch Changes

- Updated dependencies [a4207f4]
  - @easy-forms/core@0.2.0

## 0.3.1

### Patch Changes

- cbd61fc: docs: give the Pro package README a branded header (logo, pitch, badges,
  Documentation / Install / Get a license links to the live docs site) and correct
  the status — repeating groups and the branching wizard have shipped; auto-review is
  on the roadmap, not yet available. Also point `homepage` at the docs site and trim
  the unshipped feature from the package description. Docs/metadata only.
- Updated dependencies [cbd61fc]
  - @easy-forms/core@0.1.2

## 0.3.0

### Minor Changes

- c2c6b87: License keys now use a **release-date gate** instead of wall-clock expiry: a key
  is valid for any `@easy-forms/pro` version built on or before the key's expiry
  (matching AG Grid / MUI X). A lapsed subscription no longer watermarks an
  already-shipped app — only upgrading to a version published after the key's
  expiry re-triggers the watermark. Registry-token validation is unchanged
  (wall-clock). Also adds a `license:issue` maintainer CLI that mints the license +
  registry token pair in a single command.

## 0.2.0

### Minor Changes

- d87b5fa: Add `verifyRegistryToken` and a `registry` token audience: registry tokens gate
  fetching the premium renderer source and are rejected as license keys (and vice
  versa). New `license:sign-registry` maintainer CLI mints them.

## 0.1.0

### Minor Changes

- ee043fe: Enforce the Pro license in production: the unlicensed watermark and the one-time
  console warning now fire in production builds, not just development. First public
  release of the Pro engine.
