# Docs landing-page refactor (Phase 1) — loop ledger

**Why:** The docs site is functionally complete (see `REFACTOR-TODO.md` — that loop is
done) but the landing page + examples need a visual/UX pass, using
[MagicUI](https://magicui.design/) as the north star. Requirements come from the
Obsidian note *"Easy forms docs landing page refactoring.md"* (10 screenshots reviewed).

**Definition of done:** every example renders in a MagicUI-style **Preview/Code** tabbed
shell; the Playground/Schema Studio is fully removed; the examples page is a visual
gallery of **10** live-preview cards; the landing schema/preview cards are aligned; the
comparison table's "manual" cell is centered; the Hero + Performance sections (and a
shared scroll-reveal) are animated; `pnpm --filter docs typecheck` + `build` + `pnpm lint`
green; docs stays in CI.

## Verification protocol — verify in the running docs site (web preview)

Each iteration that touches a page/component:
1. Load preview tools if deferred (ToolSearch `mcp__Claude_Preview__preview_*`), then
   `preview_start` name **`docs`** (`.claude/launch.json` → Next dev on
   `http://localhost:3942`; reuses a running server).
2. Navigate: `preview_eval` → set `window.location.href` to the changed page (or reload;
   HMR usually picks up TSX/MDX edits).
3. `preview_console_logs` (level `error`) must be clean; `preview_snapshot` to confirm
   structure; `preview_click`/`preview_fill` to exercise tabs/gallery/forms;
   `preview_resize` for dark mode + responsive.
4. `preview_screenshot` the finished section as proof before committing.

Keep the docs server running across iterations.

---

## Phase 0 — Ledger + branch (loop setup)
- [x] Branch `docs/landing-refactor` off `main`.
- [x] Create this ledger (`apps/docs/LANDING-REFACTOR-TODO.md`).
- [x] Start the `docs` preview server.

## Phase 1 — Reusable `<ComponentPreview>` (MagicUI Preview/Code primitive)
- [x] New `components/demo/ComponentPreview.tsx`: tabbed shell ("Preview" | "Code").
  - Preview tab → renders `children` on the `DemoFrame` window surface.
  - Code tab → `CodePane` (`components/code/CodePane.tsx`) + filename bar + copy
    (`components/ui/CopyButton.tsx`); takes a `code` string + optional `filename`.
  - Reuse `DemoFrame`/`LiveBadge` chrome (`components/demo/DemoFrame.tsx`).
- [x] Register in `mdx-components.tsx`.

## Phase 2 — Retrofit demos to Preview/Code tabs
- [x] Landing `CodeShowcase` (`components/landing/CodeShowcase.tsx`) → `<ComponentPreview>`
  tabs (keep the presets bar).
- [x] `dynamic/*` + example/wizard demos → Preview/Code tabs. Each named client demo in
  `components/demo/examples.tsx` now **self-wraps** in `<ComponentPreview>` with a
  co-located `code` snippet, so every `<XDemo />` usage (examples, dynamic, wizard) gets
  the tabs from one edit. Removed the now-redundant full-schema block under
  `examples/signup.mdx`.
  **Scope change:** field-level component docs (`content/docs/components/*.mdx`)
  **intentionally stay plain `<LiveForm>` previews**, not Preview/Code tabs. Their inline
  schemas are trivial, fully serializable, and already documented by the adjacent
  `<PropsTable>`; a hand-authored `code` string would duplicate the schema in-file with no
  single source of truth → drift risk (see loop log). `CheckboxRequiredDemo` (used only in
  the checkbox component doc) likewise renders plain.

## Phase 3 — Examples gallery redesign + 6 new examples
- [x] Replace `<Cards>` in `content/docs/examples/index.mdx` with a visual gallery
  (`components/demo/ExampleGallery.tsx`): grid of cards, each a **live mini-preview**
  (genuine engine, clipped/scaled, `pointer-events-none` + gradient fade) → links to the
  detail page. Introduced `components/demo/example-registry.tsx` as the **single source**
  (schema + `code` + meta per example) consumed by both the gallery mini-preview and the
  detail demos; refactored the 4 example demos in `examples.tsx` to thin registry wrappers.
- [x] Detail pages render via `<ComponentPreview>` (Preview/Code tabs) — registry demos
  self-wrap, so every detail page gets the tabs.
- [x] Existing 4: `examples/{signup,checkout-wizard,dependent-dropdowns,order-calculator}.mdx`
  — now registry-backed; verified order-calculator's `valueDependsOn` total computes (19.99).
- [ ] Add 6 new (each = demo in `examples.tsx` + `code` snippet + detail `.mdx` + card; total = 10):
  - [ ] **Contact form** — text + email + textarea + required.
  - [ ] **Async username check** — custom **async** validator (availability).
  - [ ] **Survey / feedback** — `radioGroup` + `multiselect` + conditional "Other → text" via `propsDependsOn`.
  - [ ] **Job application** — `file` upload + `date` + grouped layout + validation.
  - [ ] **Newsletter preferences** — conditional **groups** (adapt `ConditionalGroupsDemo`).
  - [ ] **Change password** — custom cross-field "passwords must match" + `minLength`.
- [ ] Update examples nav (`content/docs/examples/meta.json` if present).

## Phase 4 — Remove Playground / Schema Studio (everywhere)
- [ ] Delete `app/(home)/playground/page.tsx`, `components/demo/SchemaStudio.tsx`,
  `lib/studio-presets.ts`.
- [ ] Strip links: `app/layout.config.tsx` nav; Hero "Open the playground" CTA in
  `app/(home)/page.tsx` → repoint to `/docs/examples`; Footer + `FinalCta` links;
  `content/docs/examples/index.mdx` "Schema Studio" line; `app/sitemap.ts`;
  `app/not-found.tsx`; `content/docs/index.mdx` mention.
- [ ] `pnpm --filter docs typecheck` — no dead imports / broken routes.

## Phase 5 — Alignment fixes
- [ ] `SchemaFormSync.tsx`: equal-height columns (full schema visible — drop/raise the
  `max-h-[460px]` clip) + **vertically center** the form in the preview card.
- [ ] Comparison `Cell` in `app/(home)/page.tsx`: center the "manual" partial
  (`text-center` on the `<td>`s / match the icon centering).

## Phase 6 — Animations (make it "more live")
- [ ] Hero: staggered reveal (badge → headline → subtitle → CTAs → install chip);
  reuse the unused `ef-fade-up` keyframe in `app/global.css`.
- [ ] Performance: animate the 24-cell grid in; pulse the highlighted cell.
- [ ] Shared scroll-reveal for Features + Comparison (IntersectionObserver /
  `tw-animate-css`). **Respect `prefers-reduced-motion`** (pattern in `SchemaFormSync.tsx`).

## Phase 7 — Verify + finish
- [ ] Full preview pass: `/`, `/docs/examples`, an example detail, 2–3 component pages;
  dark mode + responsive; console clean.
- [ ] `pnpm --filter docs typecheck` + `pnpm --filter docs build` + `pnpm lint` green.
- [ ] Update the Loop progress log; finish the branch (PR).

## Deferred refactors (post-landing)
- [ ] **Auto-derive Code tab for field-level component docs.** Field-doc schemas
  (`components/*.mdx`) are pure data (no functions/regex), so a small schema pretty-printer
  could feed `<ComponentPreview>`'s Code tab **from the live schema object** — giving those
  pages real Preview/Code tabs with a single source of truth (no hand-written `code` string,
  no drift). This is the proper way to add field-level Code tabs; deferred so the landing
  refactor isn't blocked. NB: this is viable *only* for function-free schemas — the named
  example demos must keep their hand-authored `code` because functions don't serialize.

---

## Loop progress log
- 2026-06-27 — Branch `docs/landing-refactor` created off main; this ledger committed.
  Plan approved (6 requirements + 6 new examples → gallery of 10). Next: Phase 0 start
  docs server, then Phase 1 `<ComponentPreview>`.
- 2026-06-27 — Phase 0 + Phase 1 done. Started `docs` preview server (port 3942).
  Built `components/demo/ComponentPreview.tsx` (MagicUI Preview/Code segmented tabs over
  the `DemoFrame`/`LiveBadge` chrome; Code tab = `CodePane` + filename bar + `CopyButton`)
  and registered it in `mdx-components.tsx`. Verified live via a throwaway `/preview-test`
  page (basic preset): both tabs render, toggle works, console clean, `docs` typecheck
  green; temp page removed. Next: Phase 2 — retrofit `CodeShowcase` + demos to the tabs.
- 2026-06-27 — Phase 2 (landing `CodeShowcase`) done. Refactored it to render the active
  preset through `<ComponentPreview>` (keyed by preset id) while keeping the presets bar;
  dropped the side-by-side twin `DemoFrame`s. Verified on `/`: presets switch, Preview tab
  shows the live form + Live badge, Code tab shows `schema.tsx` + copy, console clean,
  `docs` typecheck green. Next: Phase 2 — wrap the 12 component docs + dynamic/example demos.
- 2026-06-27 — Phase 2 (demo retrofit) done, with a **deliberate scope reduction** after a
  design discussion. Made every named client demo in `examples.tsx` self-wrap in
  `<ComponentPreview>` (co-located `code` const next to its schema), upgrading all example +
  dynamic + wizard `<XDemo />` usages to Preview/Code tabs in one edit; dropped the
  redundant code block in `examples/signup.mdx`. **Did NOT** wrap the field-level component
  docs (`components/*.mdx`): forcing a `code` prop there means hand-writing the inline schema
  a second time as a string in the same file (Preview needs the live object, Code needs a
  string) with nothing keeping them in sync — silent drift, and those pages already document
  the API via `<PropsTable>`. So component docs keep plain `<LiveForm>` previews;
  `CheckboxRequiredDemo` reverted to plain too. Verified live: signup + props-depends-on show
  tabs, checkbox shows a plain preview, console clean, `docs` typecheck green. Next: Phase 3
  — examples gallery redesign + 6 new examples.
- 2026-06-27 — Phase 3 (gallery + existing 4) done. Added `components/demo/example-registry.tsx`
  as the single source for gallery examples (schema + `code` + meta), and
  `components/demo/ExampleGallery.tsx` (live, clipped, non-interactive engine mini-previews in
  window-chrome cards linking to detail pages). Refactored the 4 example demos in
  `examples.tsx` to thin registry wrappers (no duplicated schema/code). Swapped `<Cards>` →
  `<ExampleGallery />` in `examples/index.mdx` and dropped the dead Schema Studio `/playground`
  link (pre-empts Phase 4). Registered `ExampleGallery` in `mdx-components`. **Infra note:**
  Windows reserved TCP 3906–4005 this boot, so the `docs` server can no longer bind 3942 —
  moved it to **port 3850** in `.claude/launch.json` (use `http://localhost:3850` from here on).
  Verified: gallery shows 4 live mini-previews + working card links; order-calculator detail
  page renders Preview/Code tabs with the derived total = 19.99; console clean; `docs` typecheck
  green. Next: Phase 3 — add the 6 new examples (start with Contact form).
