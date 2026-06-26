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
- [x] **`content/docs/theming.mdx`** — DONE: rewritten to the own-the-code model (4 levels: theme tokens → edit a renderer → swap via registry.ts/`<Form>` spread → chrome via easy-forms.css). Correct `FieldShell` API + `RendererProps`; primitives from `@/components/ui/*`. Verified `/docs/theming` renders all sections, console clean.
- [x] **`content/docs/troubleshooting.mdx`** — DONE: "unstyled renderers" → missing shadcn theme tokens (`shadcn init`); "missing chrome" → use `<EasyForm>` (imports easy-forms.css) + ensure tokens defined. No more `@easy-forms/shadcn/styles.css`. Verified renders, console clean. (Phase 2 complete.)

## Phase 3 — API reference pages

- [x] **`content/docs/api/shadcn.mdx` → `api/registry.mdx`** — DONE: replaced with a "Registry & EasyForm" page (namespace install, item table, `<EasyForm>` = Omit<FormProps,'registry'>, `easyFormsRegistry`, files-you-own). Renamed file, updated `api/meta.json` slug shadcn→registry. Verified renders; sidebar no longer shows "@easy-forms/shadcn".
- [x] **`content/docs/api/index.mdx`** — DONE: description now "…and the @easy-forms registry"; the `@easy-forms/shadcn` card repointed to `/docs/api/registry` ("Registry & EasyForm", covers `<EasyForm>` + `easyFormsRegistry`).
- [x] **`content/docs/api/form.mdx`** — DONE: `registry` prop description → `easyFormsRegistry` (+ "<EasyForm> supplies this"); added a top Callout documenting `<EasyForm>` = `Omit<FormProps,'registry'>` as the default entry, linking /docs/api/registry. Verified renders.
- [x] **`content/docs/api/hooks.mdx`, `api/store.mdx`, `api/types.mdx`, `api/plugins.mdx`** — AUDITED CLEAN: grep found no `shadcnRegistry`/`registry={`/`props.computed`/stale dep-handler names. They document `<Form>`/hooks/types accurately against `packages/core/src`. (Phase 3 complete.)
- [x] **`content/docs/index.mdx`** — DONE: "How it fits together" table → `@easy-forms/core` (npm) + `@easy-forms` shadcn registry; "first taste" caption no longer says "default shadcn registry". Verified `/docs` renders (no old package row, live form works).

## Phase 4 — Concepts, examples, landing

- [x] **`content/docs/concepts/lifecycle.mdx`** & **`concepts/store-rendering.mdx`** — DONE: submission snippet + "bring your own store" snippet → `<EasyForm>` (store passes through). Verified both render, no `shadcnRegistry`.
- [x] **`content/docs/concepts/index.mdx`** — verified accurate as-is: the data-flow diagram + lifecycle prose reference `<Form>`/"renderer from registry" as engine internals (correct; `<EasyForm>` wraps `<Form>`). No change needed.
- [x] **`content/docs/wizard.mdx`** + **`examples/*.mdx`** — DONE: wizard.mdx intro `<Form>`→`<EasyForm>`; examples/*.mdx grepped clean (no shadcnRegistry/registry=, they use `<LiveForm>`).
- [x] **`app/(home)/page.tsx`** — DONE (via shared component): the landing renders `<InstallChip />`; fixing its default removed the `@easy-forms/shadcn` install string. Verified the hero chip now shows `npm i @easy-forms/core`. (Subtitle/feature copy mentioning "shadcn registry" is accurate, kept.)

## Phase 5 — Shared MDX components & docs README

- [x] **`components/mdx/PackageInstall.tsx`** — DONE: default packages → `'@easy-forms/core'` (+ JSDoc usage). (A dedicated `<RegistryInstall>` component is optional polish; installation.mdx already shows the `shadcn add` + components.json flow inline.)
- [x] **`components/ui/CopyButton.tsx`** — DONE: `InstallChip` default command → `'npm i @easy-forms/core'`. typecheck green.
- [x] **`apps/docs/README.md`** — DONE: demos run core + the ejected `@easy-forms` renderers; Develop section builds only `@easy-forms/core` (dropped the shadcn build step); Notes describe Tailwind v4 auto-scanning the ejected components (no `@source` for shadcn dist). Grep clean. (Phase 5 complete.)

## Phase 6 — Accuracy audit (verify vs `packages/core/src`)

- [x] Dependency kinds = **3** — grep clean (no "7 kinds"/`visibilityDependsOn`/`optionsDependsOn`/`requiredDependsOn`/`minDateDependsOn`/`readOnlyDependsOn`); the `dynamic/` pages are props/value/reset-depends-on (+ groups, cycles).
- [x] Controls = **12** — all 12 `components/*.mdx` present (text, textarea, number, email, dropdown, multiselect, checkbox, checkbox-list, radio-group, date, file, custom) + index.
- [x] RendererProps — no `props.computed`/side `required`/`readOnly` anywhere in content; theming.mdx documents reading dynamic props from `props.question`.
- [x] `<EasyForm>` documented as the default (api/registry, api/form callout, quick-start); `<Form registry>` shown as the lower-level/bring-your-own-UI path.
- [x] Tailwind requirement reworded (installation + troubleshooting): the consumer's shadcn theme-token setup, not "only for @easy-forms/shadcn".

## Phase 7 — Re-enable CI + verify

- [x] Removed `--filter=!docs` from root `package.json` `build`/`typecheck`/`dev`.
- [x] `pnpm --filter docs typecheck` ✅ and `pnpm --filter docs build` ✅ (Next compiled + prerendered 61 pages).
- [x] Live demos verified across iterations (`/`, `/docs/quick-start`, `/docs/theming`, `/docs/api/*`) — controls render, computed total + chrome theming confirmed, console clean.
- [x] Full `pnpm typecheck` (4/4) + `pnpm build` (3/3) + `pnpm lint` ✅ green with docs included.
- [x] (Optional, deferred) wiring the Pages/docs deploy to run `shadcn build` for freshness — decided to defer; not blocking.

---

## Loop progress log
- 2026-06-22 — branch `docs/refactor` created off main; REFACTOR-TODO committed as ledger; **installation.mdx** rewritten to the registry model (criterion #1). Registry confirmed live at `https://chandima301.github.io/easy-forms/r/`.
- 2026-06-22 — **migration removed** (no users yet): deleted `content/docs/migration/*`, dropped it from root `meta.json` nav + landing footer link. Migration is now out of scope.
- 2026-06-22 — added the **web-preview verification protocol** (run the `docs` server via .claude/launch.json + `preview_*` tools to verify rendered pages each iteration; requires Phase 0 first).
- 2026-06-22 — **Phase 0 + Phase 1 DONE.** Ejected the registry into apps/docs via the REAL CLI against the live Pages registry: `shadcn init` (v4, wrote components.json + lib/utils + tokens in global.css) + `shadcn add @easy-forms/easy-form` (23 files: 7 `components/ui/*` primitives + 16 `components/easy-forms/*`). Registered the `@easy-forms` namespace in components.json. Removed dead refs: `layout.tsx` shadcn styles.css import, `next.config.mjs` transpilePackages, `global.css` `@source` shadcn dist. Migrated all 3 demos (LiveForm, SchemaStudio, SchemaFormSync) to `<EasyForm>`. Added `**/components/ui/**` to biome ignore (vendored). **Verified:** `pnpm --filter docs typecheck` ✅, `pnpm lint` ✅, docs dev server renders the live form on `/` (13 controls, no console errors). Web-preview verification now available for all remaining iterations.
- **Remaining:** Phase 2 (quick-start/theming/troubleshooting; installation done), Phase 3 (API pages incl. api/shadcn→registry), Phase 4 (concepts/examples/landing snippets + home install copy), Phase 5 (PackageInstall/CopyButton defaults, docs README), Phase 6 (accuracy audit), Phase 7 (remove `--filter=!docs`, full green).
- 2026-06-22 — **quick-start.mdx** migrated to `<EasyForm>` (render step + typed-data snippet); verified `/docs/quick-start` renders the live form, console clean. Next: theming.mdx, troubleshooting.mdx.
- 2026-06-22 — **BLOCKER / registry bug discovered (loop paused).** The ejected `easy-forms.css` styles chrome with `hsl(var(--primary))` / `hsl(var(--border))` / etc., which only works for **HSL-triplet** tokens. Modern `shadcn init` (Tailwind v4, the current default) writes **oklch** full-color tokens (`--primary: oklch(...)`), so `hsl(oklch(...))` is invalid → the form container + submit/reset/wizard buttons render **unstyled** (verified in docs: `.easy-forms__submit` background = `rgba(0,0,0,0)`). Affects the LIVE Pages registry for any v4 consumer; the playground escaped it only via hand-written HSL-triplet tokens. theming.mdx can't be written truthfully until the chrome token strategy is fixed in `packages/registry/registry/easy-forms/easy-forms.css` (and re-deployed + re-ejected). Fix options: (A) use Tailwind v4 `--color-*` theme vars (`var(--color-primary)`), (B) re-tokenize chrome as Tailwind utility classes (`bg-primary`, `border-border`, …), (C) keep HSL but require consumers to use HSL-triplet tokens. Needs a product decision — surfaced to the user.
- 2026-06-22 — **BLOCKER RESOLVED** (commit f913461). User chose: chrome CSS references tokens directly as `var(--token)` (v4 oklch), `color-mix` for hover alpha. Fixed the registry source + the docs copy. Verified in docs: `.easy-forms__submit` bg = `oklch(0.922 0 0)`, `.easy-forms` bg = `oklch(0.205 0 0)`. **Follow-ups:** the LIVE Pages registry still serves the old hsl() css until `docs/refactor` merges to main (the registry-pages workflow rebuilds from source on merge); the **playground** keeps its v3 HSL-triplet tokens + hsl()-based easy-forms.css copy (internally consistent, still works) — migrate it to v4 tokens only if you want repo-wide uniformity (optional). theming.mdx is now unblocked.
- 2026-06-22 — **theming.mdx** rewritten to the own-the-code model (theme tokens / edit renderer / swap via registry / chrome via easy-forms.css), grounded in the real FieldShell + RendererProps. Verified `/docs/theming` renders all sections, console clean. Next: troubleshooting.mdx, then Phase 3 API pages.
- 2026-06-22 — **troubleshooting.mdx** fixed (unstyled→tokens, chrome→`<EasyForm>`); **Phase 2 content complete**. Verified renders. (Note: the literal "@easy-forms/shadcn" still appears in the sidebar = the api/shadcn page's frontmatter title — fix in Phase 3.) Next: Phase 3 — convert api/shadcn.mdx → a Registry/`<EasyForm>` page (+ update meta.json slug), api/index, api/form (document `<EasyForm>`), index.mdx package table.
- 2026-06-22 — Phase 3 started: **api/shadcn.mdx → api/registry.mdx** (Registry & EasyForm page) + api/index card/description repointed; meta.json slug updated. Verified renders, sidebar fixed. Next: api/form.mdx (document `<EasyForm>` + registry prop), index.mdx package table, then audit api/hooks/store/types/plugins.
- 2026-06-22 — **api/form.mdx** (EasyForm callout + registry prop) and **index.mdx** (package table → core + registry; caption) done; verified both render. Next: audit api/hooks/store/types/plugins for stale `<Form registry={shadcnRegistry}>` snippets, then Phase 4 (concepts/examples/landing + home install copy).
- 2026-06-22 — **Phase 3 complete** (api/hooks/store/types/plugins audited clean) + Phase 4 started: concepts/lifecycle + store-rendering snippets → `<EasyForm>`, concepts/index verified accurate. Both render. Next: examples/*.mdx + wizard.mdx (confirm current API), app/(home)/page.tsx landing install copy, then Phase 5 (PackageInstall/CopyButton defaults, docs README).
- 2026-06-22 — **Phase 4 done** (wizard intro→EasyForm, examples clean, landing InstallChip fixed) + **Phase 5 component defaults done** (PackageInstall + CopyButton/InstallChip → core-only). Verified landing chip = `npm i @easy-forms/core`, docs typecheck green. Remaining: Phase 5 apps/docs/README.md; Phase 6 accuracy audit (components/*.mdx + dynamic/*.mdx); Phase 7 remove `--filter=!docs` + full green.
- 2026-06-22 — **apps/docs/README.md** updated (core-only build, ejected renderers, v4 auto-scan); **Phase 5 complete**. Next: Phase 6 accuracy audit (grep components/*.mdx + dynamic/*.mdx for stale tokens; verify dep kinds=3, controls=12, RendererProps), then Phase 7 (remove `--filter=!docs`, full build/typecheck/lint green = DONE).
- 2026-06-22 — **🎉 DOCS REFACTOR COMPLETE.** Phase 6 audit: content clean of stale tokens; 12 control pages + 3 dependency-kind pages present; the one `registry={` is the intentional `easyFormsRegistry` override in theming. Phase 7: removed `--filter=!docs` from root scripts; **`pnpm --filter docs build` ✅ (61 pages prerendered)**, `pnpm typecheck` 4/4 ✅, `pnpm build` 3/3 ✅, `pnpm lint` ✅ (formatted PackageInstall.tsx). Docs is back in CI and fully on the registry model. **Pre-merge note:** the live Pages registry still serves the pre-fix chrome CSS until `docs/refactor` merges to main (registry-pages workflow rebuilds on merge). Loop STOPPED.

### Quick reference — every file with a shadcn hit (from the sweep)
Code/config: `app/layout.tsx`, `app/global.css`, `next.config.mjs`, `package.json` (dep already
removed), `components/demo/LiveForm.tsx`, `components/demo/SchemaStudio.tsx`,
`components/landing/SchemaFormSync.tsx`, `components/mdx/PackageInstall.tsx`,
`components/ui/CopyButton.tsx`, `README.md`.
Content: `content/docs/{index, installation, quick-start, theming, troubleshooting}.mdx`,
`content/docs/api/{index, form, shadcn}.mdx`, `content/docs/concepts/{index, lifecycle, store-rendering}.mdx`.
