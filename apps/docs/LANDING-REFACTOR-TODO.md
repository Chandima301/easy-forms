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
> **Redesigned 2026-06-27** after review: the gallery is a **full-width page outside docs**
> (no side nav), with **masonry cards sized to each form** (not uniform). Cards are
> **compact** — the genuine `.easy-forms` surface (which already has its own border/padding/
> shadow) *is* the card, with only a small text label above; no second card chrome, no
> clip/scale/gradient. Forms are static (`pointer-events-none`); the whole tile links out.
- [x] Full-width route in the home group (navbar only): `app/(home)/examples/page.tsx`
  (gallery) + `app/(home)/examples/[slug]/page.tsx` (detail, `generateStaticParams` + SEO).
- [x] `components/demo/ExampleGallery.tsx` → CSS **columns masonry**
  (`columns-1 sm:columns-2 xl:columns-3`, `break-inside-avoid`); each card = compact label +
  the real form at natural size, static, linking to `/examples/{slug}`.
- [x] `components/demo/ExampleDetail.tsx` (client) → back-link + title + intro +
  `<ComponentPreview>` (Preview/Code) + optional "see also". Detail pages full-width.
- [x] Data split for RSC: `lib/examples-meta.ts` (server-safe text: title/description/intro/
  seeAlso) for the route handlers; `components/demo/example-registry.tsx` (client: schema +
  `code`) for the live form. Tied by `slug`. No duplicated schema.
- [x] **Dropped** `content/docs/examples/*` (5 MDX + meta.json) and the old `<XDemo />`
  wrappers + their `mdx-components` registration. Old `/docs/examples/*` URLs now 404 (no
  redirects, per decision). Repointed nav/footer/hero CTA → `/examples`; updated `sitemap.ts`
  + root `content/docs/meta.json`. Regenerated fumadocs `.source` after the deletions.
- [x] Existing 4 (`signup`, `checkout-wizard`, `dependent-dropdowns`, `order-calculator`)
  ported to the registry; verified order-calculator's `valueDependsOn` total = 19.99.
- [x] Add 6 new (each = `examples-meta` entry + `example-registry` entry {schema, code}; the
  gallery card + `/examples/{slug}` detail page are then automatic — **total = 10**):
  - [x] **Contact form** — text + email + textarea + required.
  - [x] **Async username check** — custom **async** validator (availability).
  - [x] **Survey / feedback** — `radioGroup` + `multiselect` + conditional "Other → text" via `propsDependsOn`.
  - [x] **Job application** — `file` upload + `date` + grouped layout + validation.
  - [x] **Newsletter preferences** — conditional **groups** (adapt `ConditionalGroupsDemo`).
  - [x] **Change password** — custom cross-field "passwords must match" + `minLength`.

## Phase 4 — Remove Playground / Schema Studio (everywhere)
- [x] Delete `app/(home)/playground/page.tsx`, `components/demo/SchemaStudio.tsx`,
  `lib/studio-presets.ts`.
- [x] Strip links: `app/layout.config.tsx` nav ("Playground"); Hero CTA in `app/(home)/page.tsx`
  → "Browse examples" `/examples`; Footer link removed; `app/sitemap.ts` (`/playground`);
  `app/not-found.tsx` (reworded → examples); `content/docs/index.mdx` card → Examples;
  `content/docs/concepts/schema.mdx` Playground link reworded; `lib/demo-schemas.ts` + docs
  `README.md` comments updated. Old `/playground` now **404s (no redirect)**.
- [x] `pnpm --filter docs typecheck` — green; grep confirms no `playground`/`SchemaStudio`/
  `studio-presets` refs outside the historical `*REFACTOR-TODO.md` ledgers.

## Phase 5 — Alignment fixes
- [x] `SchemaFormSync.tsx`: both panes now `h-[500px]` (equal-height columns); code pane
  `overflow-auto` so the full schema is reachable (was `max-h-[460px] overflow-hidden`);
  preview body `flex flex-col justify-center` to **vertically center** the form.
- [x] Comparison `Cell` in `app/(home)/page.tsx`: added `text-center` to the four value
  `<td>`s so the amber "manual" label centers like the check/dash icons + the headers.

## Phase 6 — Animations (make it "more live")
- [x] Hero: staggered reveal (badge → headline → subtitle → CTAs → install chip + feature
  pills). Added an `.ef-stagger` utility in `global.css` that animates direct children with
  `ef-fade-up` + incremental `nth-child` delays (`backwards` fill); applied to the hero
  content div. CSS-only, reduced-motion-disabled.
- [x] Performance: extracted the grid into `components/landing/PerformanceGrid.tsx` (client).
  The 24 cells stagger in on scroll-in (IntersectionObserver → per-cell `transitionDelay`,
  opacity/scale), and the highlighted cell (index 9) pulses via a new `.ef-pulse` keyframe
  (currentColor glow). Reduced-motion: cells show immediately (`motion-reduce` + JS), pulse off.
- [x] Shared scroll-reveal for Features + Comparison. Added an `.ef-reveal`/`.is-visible`
  utility + a `components/landing/Reveal.tsx` client wrapper (IntersectionObserver, one-shot,
  unobserves after reveal); wrapped `<Features />` + `<Comparison />`. **Respects
  `prefers-reduced-motion`** (reveals immediately).

## Phase 7 — Verify + finish
- [x] Full preview pass: `/` (hero stagger + scroll-reveal + perf pulse), `/examples`,
  `/examples/job-application`, `/docs/components/date`, `/docs/dynamic/props-depends-on`;
  light mode + mobile (375px); console clean. Fixed a mobile nit: gallery card title now
  `shrink-0 whitespace-nowrap` so it doesn't wrap (description truncates instead).
- [x] `pnpm --filter docs typecheck` ✅ + `pnpm --filter docs build` ✅ (**docs builds now** —
  66 static pages incl. `/examples` static + all 10 `/examples/[slug]` SSG; docs tree free of
  the old examples). `pnpm lint`: **`apps/docs` is clean** (0 errors, 7 style warnings; fixed
  my `PerformanceGrid` array-index-key). The 4 workspace `biome check .` errors are
  **pre-existing in `packages/core`** (e.g. `delete errors._manual` at
  `store/createFormStore.ts:137`) — present on `main`, untouched by this branch (diff =
  `apps/docs` + `.claude/launch.json` only). Out of scope for the docs refactor.
- [ ] Update the Loop progress log; finish the branch (PR) — **paused for user: confirm PR +
  decide whether to also fix the pre-existing core lint errors**.

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
- 2026-06-27 — **Examples gallery redesigned per user feedback** (the first cut was wrong:
  uniform card sizes + heavy card chrome doubled on top of the form + lived inside docs with a
  side nav). Brainstormed + approved a new design, then rebuilt: gallery moved to a **full-width
  page outside docs** at `/examples` (home group, navbar only) with `[slug]` detail pages;
  **masonry** cards (CSS columns) sized to each form; **compact** cards where the genuine
  `.easy-forms` surface *is* the card (it already has border/padding/shadow — the old wrapper
  doubled it) with just a small label above; forms static, tile links out. Split data for RSC:
  `lib/examples-meta.ts` (server-safe text) + `example-registry.tsx` (client schema/code).
  Deleted `content/docs/examples/*` + the old `<XDemo />` wrappers + their registration; old
  `/docs/examples/*` URLs now **404 (no redirects, per decision)**; repointed nav/footer/hero →
  `/examples`; fixed `sitemap.ts` + root docs `meta.json`; regenerated fumadocs `.source` (its
  stale codegen had thrown ENOENT for the deleted MDX until regen). Verified on 3850: full-width
  gallery (no `<aside>`), 4 compact masonry cards, detail page tabs + derived total 19.99,
  `/docs/examples/signup` → 404, console clean, `docs` typecheck green. Next: add the 6 new
  examples (Contact form first).
- 2026-06-27 — Added 2 of the 6 new examples: **Contact form** (text + email + textarea +
  required) and **Newsletter preferences** (conditional group revealed by a subscribe
  checkbox; `radioGroup` frequency + `checkboxList` topics). Each was *just* an
  `examples-meta` entry + an `example-registry` entry — no other wiring — which validated the
  new architecture: the gallery now shows **6** cards and `/examples/{contact,
  newsletter-preferences}` detail pages exist automatically. Verified on 3850: 6 masonry cards
  (3 cols at 1280px), newsletter detail hides the prefs group until subscribe is checked then
  reveals Frequency + Topics, console clean, `docs` typecheck green. Next: remaining 4 new
  examples (async username check, survey/feedback, job application, change password) — these
  need an API check first (async-validator shape, file/date controls, cross-field validator).
- 2026-06-27 — Added the final **4 new examples** → **Phase 3 complete (10 examples)**. Checked
  the core APIs first: `custom: (value, allValues) => result | Promise` covers both **async**
  (return a Promise) and **cross-field** (read `allValues`); `file` takes `accept`/`maxSizeMB`,
  `date` takes `minDate`/`maxDate`. Implemented as meta + registry entries: **Async username
  check** (async availability validator), **Survey/feedback** (`radioGroup` + `multiselect` +
  conditional "Other → text" via `propsDependsOn`), **Job application** (`file` PDF upload +
  `date` not-in-past via `minDate` fn + grouped layout), **Change password** (cross-field
  "passwords must match" reading `allValues.newPassword` + `minLength`). Verified on 3850 by
  driving each form: gallery = 10 cards; `ada` → "already taken" (async fires); mismatched
  confirm → "Passwords must match"; job-application renders the file + date controls in grouped
  sections; survey reveals "Tell us more" on picking Other; console clean; `docs` typecheck
  green. Next: Phase 4 — remove Playground / Schema Studio.
- 2026-06-27 — **Phase 4 complete** — removed the Playground / Schema Studio everywhere.
  Deleted `app/(home)/playground/page.tsx`, `components/demo/SchemaStudio.tsx`,
  `lib/studio-presets.ts`. Stripped the `/playground` nav link, repointed the hero CTA to
  "Browse examples" `/examples`, removed the footer link, dropped `/playground` from
  `sitemap.ts`, reworded `not-found.tsx` + `concepts/schema.mdx`, swapped the docs-index
  Playground card for an Examples card, and fixed stale comments in `demo-schemas.ts` +
  `README.md`. Old `/playground` now **404s (no redirect, consistent with the dropped example
  URLs)**. `demo-schemas.ts` stays (still feeds `SchemaFormSync` + the landing code showcase).
  Verified on 3850: nav = Docs · Examples · Enterprise (no Playground), hero + footer →
  `/examples`, `/playground` → 404, console clean, `docs` typecheck green; grep confirms no
  lingering refs outside the historical ledgers. Next: Phase 5 — alignment fixes
  (`SchemaFormSync` equal-height/centering; comparison "manual" cell centering).
- 2026-06-27 — **Phase 5 complete** — alignment fixes. `SchemaFormSync`: both panes set to
  `h-[500px]` (equal-height columns, measured 538 vs 547px incl. title bars), code pane
  switched to `overflow-auto` so the full schema scrolls (was `max-h-[460px] overflow-hidden`
  which clipped longer presets), and the preview body is now `flex flex-col justify-center`
  to vertically center the form. Comparison table: added `text-center` to the four value
  `<td>`s so the amber "manual" label centers like the ✓/– icons + the column headers
  (computed `text-align: center` confirmed). Verified on 3850 at 1280px: equal columns side by
  side, "manual" cells centered, console clean, `docs` typecheck green. Next: Phase 6 —
  animations (hero stagger, performance grid, shared scroll-reveal).
- 2026-06-27 — Phase 6 (2 of 3): **hero stagger** + **shared scroll-reveal**. Added two
  reduced-motion-aware utilities to `global.css`: `.ef-stagger` (reuses the previously-unused
  `ef-fade-up` keyframe; `nth-child` delays 0.05→0.45s, `backwards` fill) applied to the hero
  content div, and `.ef-reveal`/`.is-visible` driven by a new `components/landing/Reveal.tsx`
  (IntersectionObserver, one-shot) wrapping `<Features />` + `<Comparison />`. Verified on
  3850: all 6 hero children animate `ef-fade-up` with staggered delays and settle to opacity 1;
  both reveal sections start at opacity 0 and become visible on scroll-in; console clean;
  `docs` typecheck green. Next: Phase 6 last item — Performance grid animate-in + pulse.
- 2026-06-27 — **Phase 6 complete** — Performance grid. Extracted the 24-cell grid into
  `components/landing/PerformanceGrid.tsx` (client): cells stagger in on scroll
  (IntersectionObserver → `shown` state → per-cell `transitionDelay` + opacity/scale), and the
  highlighted cell (index 9) pulses via a new `.ef-pulse` keyframe (currentColor glow, the cell
  is `text-fd-primary`). Reduced-motion: cells reveal immediately (`motion-reduce:` + JS short
  circuit), pulse disabled. Verified on 3850: 24 cells start hidden (opacity 0), all reach
  opacity 1 after scroll-in, cell 9 runs `ef-pulse` (screenshot shows the glow); console clean;
  `docs` typecheck green. Next: **Phase 7** — full preview pass + `build` + `lint` + finish (PR).
- 2026-06-27 — Phase 7 verification (PR step paused for the user). Full preview pass clean
  across `/`, `/examples`, an example detail, a component page + a dynamic page; light mode +
  mobile good; fixed a gallery-card title wrap on mobile (`shrink-0 whitespace-nowrap`).
  **`pnpm --filter docs build` succeeds** — the headline: docs was previously non-building, and
  it now produces 66 static pages including `/examples` (static) + 10 `/examples/[slug]` (SSG),
  with the docs tree free of the removed examples. `docs` typecheck green; `apps/docs` lint
  clean (fixed my `PerformanceGrid` index-key; 7 style warnings remain). Root `pnpm lint`
  (`biome check .`) still reports 4 errors, all **pre-existing in `packages/core` on `main`**
  (e.g. `delete errors._manual`), which this branch never touches. **Paused before the PR** to
  confirm with the user + decide whether the pre-existing core lint errors are in scope.
