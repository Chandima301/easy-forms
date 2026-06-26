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
- [ ] Landing `CodeShowcase` (`components/landing/CodeShowcase.tsx`) → `<ComponentPreview>`
  tabs (keep the presets bar).
- [ ] 12 component docs (`content/docs/components/*.mdx`) + `dynamic/*` + example demos:
  wrap each `<LiveForm>`/named demo in `<ComponentPreview>` with an explicit `code`
  snippet. (Function-bearing schemas = named client demos in `components/demo/examples.tsx`;
  inline-schema pages like `text.mdx` get a hand-authored `code` string.)

## Phase 3 — Examples gallery redesign + 6 new examples
- [ ] Replace `<Cards>` in `content/docs/examples/index.mdx` with a visual gallery
  (`components/demo/ExampleGallery.tsx`): grid of cards, each a **live mini-preview**
  (genuine engine, scaled/contained) → links to the detail page.
- [ ] Detail pages render via `<ComponentPreview>` (Preview/Code tabs).
- [ ] Existing 4: `examples/{signup,checkout-wizard,dependent-dropdowns,order-calculator}.mdx`.
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
