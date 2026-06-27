# CLAUDE.md — easy-forms

Context for AI agents working in this repo. Read this first.

## What this is

`easy-forms` is a **schema-driven React form library**. The consumer hands it an
**array of question objects** and the library owns the whole workflow: rendering,
validation, conditional logic (dependencies), dirty/touched tracking, multi-step
wizard navigation, and submission. It is a higher-level alternative to
react-hook-form — there is **no `useForm` / `register` / `Controller`** exposed;
the schema is the source of truth.

One published package + a registry source + dev apps:

| Path | Package | Role |
|---|---|---|
| `packages/core` | `@easy-forms/core` | Headless engine: types, custom store, hooks, components, dependency engine, wizard, plugins. Zero UI deps. **The only npm-published package.** |
| `packages/registry` | (private) | Source of the `@easy-forms` **shadcn registry**: ejectable renderers + `field-shell` + the pre-wired `<EasyForm>` wrapper + re-tokenized chrome CSS (`easy-forms.css`). Built with `shadcn build` → `public/r/*.json`, hosted on GitHub Pages. Consumers install with `shadcn add @easy-forms/*`. |
| `apps/playground` | `playground` (private) | Vite sandbox; a representative shadcn consumer using the ejected components + `<EasyForm>`. |
| `apps/docs` | `docs` (private) | Fumadocs site, mid-refactor onto the registry (landing refactor in progress). **`pnpm lint` (`biome check .`) covers `apps/docs`** — keep these files lint-clean. Still excluded from `pnpm build` / `pnpm typecheck`. |

## Monorepo / tooling

pnpm workspaces + Turborepo. Build: **tsup** (dual ESM/CJS + .d.ts). Test:
**vitest** + Testing Library (jsdom). Lint/format: **biome** (tabs, single
quotes). Versioning: **changesets**.

## Commands

> **Machine caveat:** `pnpm` is not on PATH here. Prefix PowerShell commands with:
> `$env:PATH = "$(npm config get prefix);$env:PATH";`

```sh
pnpm install
pnpm dev                          # turbo: watch-builds core, runs playground
pnpm --filter playground dev      # playground only (see dist gotcha below)
pnpm test                         # core tests (58)
pnpm --filter @easy-forms/core test
pnpm typecheck                    # per-package tsc (apps/docs excluded via --filter=!docs)
pnpm build                        # core + playground (apps/docs excluded until refactored)
pnpm lint                         # biome
pnpm --filter @easy-forms/registry registry:build   # build the shadcn registry JSON
```

## Architecture (mental model)

- **Custom external store** via `useSyncExternalStore` — **not** RHF, **not**
  Zustand. Topic-based per-field subscriptions: changing one field only wakes
  that field's subscribers + the form-state subscriber. See
  `packages/core/src/store/createFormStore.ts` + `store/listeners.ts`.
- **Three React contexts**: `FormStoreContext`, `RendererRegistryContext`,
  `WizardContext`.
- **Mount order matters**: `<Field>` registers itself with the store in a
  `useEffect`. `<Form>` attaches the dependency engine + plugins in its own
  `useEffect`, which runs *after* all children's effects — so the engine sees
  every registered field on first run.
- **Renderer registry**: `<Field>` reads `question.control` and dispatches to a
  renderer component. UI is fully swappable; the default renderers are the
  ejectable components in `packages/registry/registry/easy-forms/*`, assembled
  into `easyFormsRegistry` and wired by the scaffolded `<EasyForm>` wrapper.

### Dependencies — 3 categorical kinds (recent redesign — important)

Declared on a question's (or group's) `dependents`:

1. **`propsDependsOn`** — array of `{ fieldNames, compute }` rules. `compute`
   returns `Partial<RuntimeProps>`; the engine merges it into the target's
   `runtimeOverrides`. This ONE dep covers every dynamic display/behavior prop:
   `hidden`, `required`, `readOnly`, `disabled`, `options`, `min`, `max`,
   `minDate`, `maxDate`, `placeholder`, `prefix`, `suffix`, `description`,
   `label`, `className`. **Adding a new dynamic prop = zero new handler code** —
   just return it from a compute. (Replaced the old visibility/options/required/
   readOnly/minMaxDate handlers.)
2. **`valueDependsOn`** — derive a field's value from others. Deferred via
   `queueMicrotask`; written with `markDirty:false` so derived writes don't flip
   `isDirty`.
3. **`resetDependsOn`** — reset target to `initialValue` on the false→true
   rising edge of `when`.

`<Field>` merges the static question with `runtimeOverrides` into an
`effectiveQuestion` and passes that as `props.question`. **Renderers read
everything from `props.question`** — there is no separate `computed` map and no
side `required`/`readOnly` props on `RendererProps`.

### Groups

- Groups participate in the engine. `DependencyTarget` is a discriminated union:
  `{ kind:'field', key, question }` | `{ kind:'group', id, group }`.
- A group using `dependents` **must have a stable `id`** — `buildDependencyGraph`
  throws otherwise.
- `GroupRenderer` **CSS-hides** (`display:none`) a hidden group rather than
  unmounting it, so descendant field state is preserved across show/hide.
- The store keeps `hiddenByGroup` (descendant keys whose ancestor group is
  hidden) + `groupFieldKeysIndex`; hidden descendants drop out of `getValues()`
  and skip validation.
- `clearWhenHidden` (on a field or a group) resets on the hide rising edge.

### Other engine pieces

- **Cycle detection** (dev only): DFS over composite `field:x` / `group:y` node
  keys; throws with the cycle path. `dependencies/detectCycle.ts`.
- **Wizard**: single shared store, all step panels mounted (CSS-hidden), per-step
  validation gating, step-level visibility via `propsDependsOn`, `persistKey`
  for localStorage resume. `components/Wizard.tsx`.
- **Plugins**: `onInit / onChange / onSubmit / onDestroy`; built-in
  `loggerPlugin`, `autosavePlugin`. `plugins/`.
- **Validation pipeline**: sync built-ins → sync customs → async customs,
  token-guarded against races; hidden fields short-circuit.
  `validation/runValidators.ts`.

## Conventions

- biome formatting (tabs, single quotes, semicolons). TS strict.
- `as never` casts appear ONLY at the handler-dispatch boundary (registry is
  keyed by string, handler configs are validated at the type layer).
- `Group<any>` / `FormSchema<any>` variance dodges are intentional in
  engine-facing code (the engine iterates structure, never reads the typed
  values shape).
- One concern per file; barrel `index.ts` per folder.
- End commit messages with the `Co-Authored-By` trailer.

## Gotchas (read before debugging)

1. **The playground imports `@easy-forms/core` from its built `dist`, not
   `src`.** Editing `packages/core/src` will NOT show in the playground until
   core is rebuilt (`pnpm --filter @easy-forms/core build`) or you run
   `pnpm dev` from the root (turbo watch-builds it). **Tests are unaffected** —
   vitest imports from `src`, so logic changes are validated by tests even
   without a rebuild.
2. **Renderers ship as an own-the-code shadcn registry, not a built package.**
   Source is in `packages/registry/registry/easy-forms/*`; consumers run
   `shadcn add @easy-forms/*` to copy them into their repo. The renderers use
   shadcn theme-token utilities (`border-input`, `bg-background`,
   `text-muted-foreground`, `ring-ring`, `text-destructive`) and depend on the
   consumer's canonical shadcn primitives in `@/components/ui/*`. Form *chrome*
   (container, footer, group grid, wizard nav) is rendered by core and styled by
   the re-tokenized `easy-forms.css` shipped via the registry. Keep the theme-token
   blocks (`:root` / `.dark`) **OUTSIDE** `@layer base` so Tailwind doesn't
   tree-shake the `.dark` rule (it did, in the playground), and don't put chrome
   classes in a Tailwind `@layer components` block.
3. **Two Tailwind versions** (v3 + v4) are installed in the workspace; the
   playground resolves **v3**, `apps/docs` uses **v4**.
4. **Group layout class goes on the inner content `<div>`, not the
   `<section>`.** If the grid class is on the section, the group title becomes
   the first grid cell and misaligns every field. See `GroupRenderer.tsx`.

## File map — "to change X, edit Y"

| Change | File(s) |
|---|---|
| Question schema / control configs | `packages/core/src/types/controls.ts` |
| Validators (types + impl) | `types/validators.ts`, `validation/builtIns.ts`, `validation/runValidators.ts` |
| Dependency types (`RuntimeProps`, the 3 kinds) | `types/dependencies.ts` |
| Store internals | `store/createFormStore.ts`, `store/listeners.ts`, `store/types.ts` |
| Dependency handlers | `dependencies/handlers/{propsDependsOn,valueDependsOn,resetDependsOn}.ts` |
| Graph build / cycles / engine | `dependencies/{buildGraph,detectCycle,engine}.ts` |
| Form / Field / Group / Wizard | `components/{Form,Field,GroupRenderer,Wizard}.tsx` |
| Hooks | `hooks/{useField,useGroup,useFormState,useFormValues,useWatch}.ts` |
| Plugins | `plugins/` |
| Control renderers (visual) | `packages/registry/registry/easy-forms/*-renderer.tsx` |
| Form chrome styling | `packages/registry/registry/easy-forms/easy-forms.css` |
| Registry manifest / items + `<EasyForm>` | `packages/registry/registry.json`, `packages/registry/registry/easy-forms/{registry.ts,easy-form.tsx}` |

## Status

`@easy-forms/core@0.1.1` is published to npm. UI ships via the `@easy-forms`
shadcn registry (`packages/registry`), hosted on GitHub Pages; consumers
`shadcn add @easy-forms/easy-form`. The old `@easy-forms/shadcn` package has been
removed (deleted from the repo and unpublished from npm). **58 core tests pass**;
core + playground typecheck/lint are green. **`apps/docs` is mid-refactor onto the
registry** — it is linted by CI (`biome check .` covers the whole repo) so its files
must stay lint-clean, but it is still excluded from `pnpm build` / `pnpm typecheck`.
