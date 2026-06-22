# Docs refactor — gap analysis & TODO

**Why:** `@easy-forms/shadcn` was removed (UI now ships via the `@easy-forms` shadcn
**registry**: `shadcn add @easy-forms/*` + the pre-wired `<EasyForm>` wrapper, hosted on
GitHub Pages at `https://chandima301.github.io/easy-forms/r/{name}.json`). `apps/docs`
still imports the deleted package, so it **does not build** and is currently excluded from
CI (`--filter=!docs` in root `package.json` `build`/`typecheck`/`dev`).

**Good news (already current — do NOT rewrite):** the dependency model (`dynamic/` =
`propsDependsOn` / `valueDependsOn` / `resetDependsOn`), the renderer-props shape (read from
`props.question`; no `props.computed`/`required`/`readOnly`), control count (12), and the
hooks/plugins/validation pages had **no** stale-token hits in the sweep. Audit, don't assume.

**Definition of done:** docs builds & typechecks; live demos render via the ejected
registry; all install/usage content reflects `shadcn add @easy-forms/*` + `<EasyForm>`;
`--filter=!docs` removed so docs rejoins CI.

**Out of scope — migration guides.** The library has no users yet, so there is **no**
migration section. The `content/docs/migration/` folder, its nav entry, and the landing
footer link were deleted. Do NOT add migration content, pages, or links.

## Verification protocol — verify in the running docs site (web preview)

The loop must **see the rendered docs in a browser**, not only typecheck them. The docs dev
server is preconfigured in `.claude/launch.json` as **`docs`** (Next dev → `http://localhost:3942`).

Every iteration that touches a page/component (after Phase 0 makes docs compile):
1. Load the preview tools if deferred (ToolSearch `mcp__Claude_Preview__preview_*`), then `preview_start` with name **`docs`** (reuses the server if already running).
2. Navigate to the page you changed: `preview_eval` → `window.location.href = 'http://localhost:3942/docs/<slug>'` (or reload; HMR usually picks up MDX/TSX edits).
3. `preview_console_logs` (level `error`) must be clean; `preview_snapshot` to confirm the expected headings/text/components rendered.
4. For live demos (`LiveForm`, `SchemaStudio`, `SchemaFormSync`): `preview_click` / `preview_fill` / `preview_eval` to exercise a control, then `preview_snapshot` / `preview_screenshot` to confirm it actually works (e.g. country→region options, order total, dark mode via `preview_resize`).
5. If broken: read source → fix → re-check from step 2. `preview_screenshot` the finished page as proof before committing.

**Prerequisite & ordering:** the site only renders **after Phase 0** (eject registry + fix
`layout.tsx` CSS import + migrate the demo components). So do **Phase 0 first** to get a
running docs server; until then verification is limited to `pnpm --filter docs typecheck` +
MDX sanity. From Phase 0 onward, web-preview verification is **required** for every
content/demo iteration, and the docs server should be kept running across iterations.

---

## Phase 0 — Make docs a shadcn consumer (UNBLOCKS THE BUILD)

Docs is **Tailwind v4** + Next.js (not v3 like the playground), so use the v4 shadcn setup.
Preferred path is to dogfood the real registry; manual is the fallback.

- [ ] **Eject the registry into docs.** Once Pages is live (or serving `packages/registry/public` locally), in `apps/docs`:
  - [ ] `shadcn init` (v4) → creates `apps/docs/components.json`, writes shadcn theme tokens into `app/global.css`, adds `@/lib/utils` (`cn`). Add the `@easy-forms` registry to `components.json` `registries`.
  - [ ] `shadcn add @easy-forms/easy-form` → pulls `components/easy-forms/*` (renderers + `field-shell` + `registry.ts` + `easy-form.tsx` + `easy-forms.css`) and the canonical `components/ui/*` primitives (input, select, checkbox, radio-group, popover, label, textarea).
  - [ ] Fallback if not hosted yet: copy from `packages/registry/registry/easy-forms/*` + hand-add the 7 shadcn v4 primitives (the playground’s `apps/playground/src/components/ui/*` are v3 references — re-generate for v4, don’t copy verbatim).
- [ ] **`app/global.css`** ([app/global.css](apps/docs/app/global.css)):
  - [ ] Add shadcn v4 theme tokens (`--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`) for `:root` + `.dark`. The new renderers are token-driven (`border-input`, `bg-background`, `text-muted-foreground`, `ring-ring`, `text-destructive`) and render unstyled without them.
  - [ ] Fix the `@source` scan: drop `'../../../packages/shadcn/dist/**/*.js'` (line 8); add a scan for the ejected `components/easy-forms/**` + `components/ui/**` so their utility classes are generated.
  - [ ] Keep the `:root`/`.dark` token blocks where Tailwind won’t tree-shake the `.dark` rule (v4: tokens live in CSS, generally safe — verify dark mode actually flips).
- [ ] **`app/layout.tsx`** line 2 ([app/layout.tsx](apps/docs/app/layout.tsx)): remove `import '@easy-forms/shadcn/styles.css';`. Chrome CSS now comes from `<EasyForm>` importing `./easy-forms.css` — but the docs demos render `<Form>` directly, so either switch demos to `<EasyForm>` (preferred) or import the ejected `components/easy-forms/easy-forms.css` here.
- [ ] **`next.config.mjs`** line 8 ([next.config.mjs](apps/docs/next.config.mjs)): remove `'@easy-forms/shadcn'` from `transpilePackages` (keep `@easy-forms/core`).

## Phase 1 — Migrate the live-demo components (TS, build-breaking)

Each imports `shadcnRegistry` and renders `<Form registry={shadcnRegistry}>`. Switch to the
ejected `easyFormsRegistry` (or `<EasyForm>`), importing from `@/components/easy-forms/*`.

- [ ] **`components/demo/LiveForm.tsx`** ([LiveForm.tsx](apps/docs/components/demo/LiveForm.tsx)) — lines 3-4, 35-37. Replace with `<EasyForm schema initialValues showReset onSubmit>` (drops the `registry` prop).
- [ ] **`components/demo/SchemaStudio.tsx`** ([SchemaStudio.tsx](apps/docs/components/demo/SchemaStudio.tsx)) — lines 5-6, 146-153. Same swap; keep the `key={code.length}` remount.
- [ ] **`components/landing/SchemaFormSync.tsx`** ([SchemaFormSync.tsx](apps/docs/components/landing/SchemaFormSync.tsx)) — lines 6-7, 204-212. Uses a `store` prop + `createFormStore`; keep `createFormStore` from core and either `<EasyForm store=...>` or `<Form registry={easyFormsRegistry} store=...>`.
- [ ] **`components/demo/examples.tsx`**, **`components/demo/DemoFrame.tsx`**, **`components/code/CodePane.tsx`**, **`components/landing/CodeShowcase.tsx`** — audit for any shadcn import / `<Form registry>` usage and code-sample strings that show the old API.
- [ ] **`lib/studio-presets.ts`** / **`lib/demo-schemas.ts`** — schema presets are fine (schema-only), but check any embedded code strings that reference `shadcnRegistry`.

## Phase 2 — Install / distribution content (MDX rewrites)

The core message everywhere: install `@easy-forms/core` from npm + add the UI via the
shadcn registry (`components.json` namespace → `shadcn add @easy-forms/*`) + use `<EasyForm>`.

- [x] **`content/docs/installation.mdx`** — DONE: rewritten to the registry model (install core, `shadcn init`, register `@easy-forms` namespace, `shadcn add @easy-forms/easy-form`, peer deps, you-own-the-files callout). Old shadcn package/styles.css/`@source` content removed.
- [x] **`content/docs/quick-start.mdx`** — DONE: render step + "Type your form data" snippets now use `<EasyForm>` (no registry prop); added a Callout noting `<Form registry>` is the lower-level path. Verified `/docs/quick-start` renders the live form, no console errors.
- [ ] **`content/docs/theming.mdx`** — rewrite (lines 18-19, 26-31, 36-40, 61). Old story = override `shadcnRegistry` + import primitives from `@easy-forms/shadcn` + chrome CSS in `@easy-forms/shadcn/styles.css`. New story = you OWN the files: edit `components/easy-forms/*-renderer.tsx`, theme via shadcn CSS tokens (`--primary`, `--ring`, dark mode), chrome via the ejected `easy-forms.css`. Replace the primitives-import section.
- [ ] **`content/docs/troubleshooting.mdx`** — line 23: the `import '@easy-forms/shadcn/styles.css'` fix → the ejected `easy-forms.css` / `<EasyForm>`.

## Phase 3 — API reference pages

- [ ] **`content/docs/api/shadcn.mdx`** — entire page documents the removed package (`shadcnRegistry`, `styles.css`, primitives import). **Replace** with a "Registry / `<EasyForm>`" page: the `@easy-forms` namespace, the item list (`easy-form`, `select`, `text`, …), `shadcn add` usage, `easyFormsRegistry`, and how the ejected files map to controls. Update `meta.json` + any nav/slug (`api/shadcn` → e.g. `api/registry`).
- [ ] **`content/docs/api/index.mdx`** — line 3 description ("…and @easy-forms/shadcn"), line 15 Card for `@easy-forms/shadcn`. Repoint to the new registry page; add an `<EasyForm>` card.
- [ ] **`content/docs/api/form.mdx`** — line 15 `registry` prop description mentions `shadcnRegistry`. Keep documenting `<Form>`’s `registry` prop, but add/point to **`<EasyForm>`** (the pre-wired wrapper = `Omit<FormProps, 'registry'>`) as the default entry point.
- [ ] **`content/docs/api/hooks.mdx`, `api/store.mdx`, `api/types.mdx`, `api/plugins.mdx`** — audit for `<Form registry>` snippets (plugins.mdx lines 29/39 use `<Form plugins>` which is fine) and confirm types/hooks match `packages/core/src` (RendererProps, RendererRegistry, EasyFormProps).
- [ ] **`content/docs/index.mdx`** — line 58 package table row for `@easy-forms/shadcn`; line 16 `<Form>` mention. Update the package/distribution table to core + registry.

## Phase 4 — Concepts, examples, landing

- [ ] **`content/docs/concepts/lifecycle.mdx`** (lines 30-32) & **`concepts/store-rendering.mdx`** (line 69): `<Form registry={shadcnRegistry}>` → `<EasyForm>` (or `<Form registry={easyFormsRegistry}>` where the store prop is being shown).
- [ ] **`content/docs/concepts/index.mdx`** — line 13 data-flow diagram & line 39 mention reference “registry”; verify wording still accurate (renderer comes from the ejected registry).
- [ ] **`content/docs/wizard.mdx`** (line 7) + **`examples/*.mdx`** — confirm snippets use `<EasyForm>`/current API; examples are schema-driven so mostly fine, but check any `registry=` usage.
- [ ] **`app/(home)/page.tsx`** — audit the landing install copy/CTA for `@easy-forms/shadcn` (it renders `<SchemaFormSync>` + likely an install command).

## Phase 5 — Shared MDX components & docs README

- [ ] **`components/mdx/PackageInstall.tsx`** line 24 default `'@easy-forms/core @easy-forms/shadcn'` → `'@easy-forms/core'`; consider a new `<RegistryInstall>` component that renders the `shadcn add @easy-forms/easy-form` block + the `components.json` snippet (reused across pages).
- [ ] **`components/ui/CopyButton.tsx`** line 29 default `'npm i @easy-forms/core @easy-forms/shadcn'` → `'npm i @easy-forms/core'`.
- [ ] **`apps/docs/README.md`** lines 5, 15 — drop `@easy-forms/shadcn` / `pnpm --filter @easy-forms/shadcn build`; describe the registry-consumer setup.

## Phase 6 — Accuracy audit (verify vs `packages/core/src`)

- [ ] Dependency kinds = **3** (`propsDependsOn`/`valueDependsOn`/`resetDependsOn`) everywhere — grep docs for any “7 kinds”/old handler names (`visibilityDependsOn`, `optionsDependsOn`, `requiredDependsOn`, `minDateDependsOn`, `readOnlyDependsOn`).
- [ ] Controls = **12** and per-control configs in `components/*.mdx` match `packages/core/src/types/controls.ts` (props like `inputType`, `decimalScale`, `enableSelectAll`, `view`, `accept`, etc.).
- [ ] RendererProps doc = `{ question, value, onChange, onBlur, error, errors, touched, dirty }`, all dynamic props read from `props.question` (no `computed`/side `required`/`readOnly`).
- [ ] `<EasyForm>` documented as the default; `<Form registry>` documented as the lower-level/bring-your-own-UI path.
- [ ] Tailwind requirement reworded: it’s the consumer’s shadcn/Tailwind setup (renderers use theme tokens), not “only for @easy-forms/shadcn”.

## Phase 7 — Re-enable CI + verify

- [ ] Remove `--filter=!docs` from root [`package.json`](package.json) `build`, `typecheck`, `dev`.
- [ ] `pnpm --filter docs typecheck` and `pnpm --filter docs build` pass.
- [ ] `pnpm --filter docs dev`: click through `LiveForm`, `SchemaStudio`, `SchemaFormSync` — controls render, dependency demos work (country→region, order total), dark mode flips chrome + fields.
- [ ] Full `pnpm typecheck` + `pnpm build` green with docs included; CI green.
- [ ] (Optional) have the Pages workflow / docs deploy run `shadcn build` so the hosted registry the docs reference stays fresh.

---

## Loop progress log
- 2026-06-22 — branch `docs/refactor` created off main; REFACTOR-TODO committed as ledger; **installation.mdx** rewritten to the registry model (criterion #1). Registry confirmed live at `https://chandima301.github.io/easy-forms/r/`.
- 2026-06-22 — **migration removed** (no users yet): deleted `content/docs/migration/*`, dropped it from root `meta.json` nav + landing footer link. Migration is now out of scope.
- 2026-06-22 — added the **web-preview verification protocol** (run the `docs` server via .claude/launch.json + `preview_*` tools to verify rendered pages each iteration; requires Phase 0 first).
- 2026-06-22 — **Phase 0 + Phase 1 DONE.** Ejected the registry into apps/docs via the REAL CLI against the live Pages registry: `shadcn init` (v4, wrote components.json + lib/utils + tokens in global.css) + `shadcn add @easy-forms/easy-form` (23 files: 7 `components/ui/*` primitives + 16 `components/easy-forms/*`). Registered the `@easy-forms` namespace in components.json. Removed dead refs: `layout.tsx` shadcn styles.css import, `next.config.mjs` transpilePackages, `global.css` `@source` shadcn dist. Migrated all 3 demos (LiveForm, SchemaStudio, SchemaFormSync) to `<EasyForm>`. Added `**/components/ui/**` to biome ignore (vendored). **Verified:** `pnpm --filter docs typecheck` ✅, `pnpm lint` ✅, docs dev server renders the live form on `/` (13 controls, no console errors). Web-preview verification now available for all remaining iterations.
- **Remaining:** Phase 2 (quick-start/theming/troubleshooting; installation done), Phase 3 (API pages incl. api/shadcn→registry), Phase 4 (concepts/examples/landing snippets + home install copy), Phase 5 (PackageInstall/CopyButton defaults, docs README), Phase 6 (accuracy audit), Phase 7 (remove `--filter=!docs`, full green).
- 2026-06-22 — **quick-start.mdx** migrated to `<EasyForm>` (render step + typed-data snippet); verified `/docs/quick-start` renders the live form, console clean. Next: theming.mdx, troubleshooting.mdx.

### Quick reference — every file with a shadcn hit (from the sweep)
Code/config: `app/layout.tsx`, `app/global.css`, `next.config.mjs`, `package.json` (dep already
removed), `components/demo/LiveForm.tsx`, `components/demo/SchemaStudio.tsx`,
`components/landing/SchemaFormSync.tsx`, `components/mdx/PackageInstall.tsx`,
`components/ui/CopyButton.tsx`, `README.md`.
Content: `content/docs/{index, installation, quick-start, theming, troubleshooting}.mdx`,
`content/docs/api/{index, form, shadcn}.mdx`, `content/docs/concepts/{index, lifecycle, store-rendering}.mdx`.
