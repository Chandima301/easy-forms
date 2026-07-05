# easy-forms — Improvement Backlog

Project-wide backlog of deferred improvements, addressed in later versions. Add new items
here as they come up — this is the common, long-lived list for the whole monorepo (core,
pro, registry, apps).

**These are not defects.** Current behaviour is correct and shipped; each entry is a future
enhancement or a consciously-postponed v2 seam. Anything where current behaviour is *wrong*
is a bug — fix it or track it as one, don't park it here.

> **Format:** group by area. Each item: a short title, why it's deferred, and what it'd take.
> When you pick one up, move the detail into a dated design spec under
> `docs/superpowers/specs/` and link it back here.

---

## Core (`@easy-forms/core`)

_(none yet)_

## Pro controls (`@easy-forms/pro`)

### `repeatingGroup`
Headline control shipped 2026-07-04 (registry-pattern refactor + shadcn styling). See
`docs/superpowers/specs/2026-06-28-easy-forms-pro-task-list.md` (#5) for shipped scope.

Reference (current dependency directions):
- ✅ **Same-row** deps work — a row field depending on another field in the *same* row
  (per-row scoped engine + `prefixItemGroups`).
- ✅ **Outside → inside** (#C1) and **inside → outside** (#C2) now work — shipped 2026-07-04,
  see `docs/superpowers/specs/2026-07-04-repeating-group-cross-boundary-deps.md`.

---

- **Styled variants** — additive; no engine changes. Multiple ejectable renderers
  (card / table / accordion / compact) over the same `useRepeatingGroup` hook +
  `RepeatingGroupItem`, each a Pro registry item.
  - **Files:** copy `packages/registry/registry/easy-forms/repeating-group-renderer.tsx` →
    `repeating-group-<variant>-renderer.tsx` (only the markup differs — call the same hook +
    `<RepeatingGroupItem>`); add a `registry.json` item per variant (`registryDependencies`
    per what the markup uses, e.g. `button`, `table`); mirror each into
    `apps/playground/src/components/easy-forms/` and wire in the playground registry to demo.
  - **Effort:** S each. Keep the watermark ownership in `RepeatingGroupItem` untouched.

- **Row reorder** — unimplemented feature; needs a `renameField` store primitive.
  - **Why not trivial:** row IDs (the index in `bankAccounts.<index>.<field>`) are permanent
    and never renumbered (sparse-monotonic design that dodges the field-array remove bug).
    `assembleNested.ts` builds output arrays by **numeric ID order**, not display order — so
    reordering the index list moves rows on screen but **not** in submitted data.
  - **Approach A (recommended):** add `renameField(oldKey, newKey)` to the store — move the
    field's value, errors, touched, dirty flag, `runtimeOverrides`, and re-point subscriptions
    from the old topic to the new. Then `useRepeatingGroup` exposes `move(from, to)` that
    renumbers the affected rows, and the renderer adds a drag handle.
  - **Approach B:** teach `getNestedValues()` / `assembleNested` to honour the container's
    index-list order (couples the generic transform to `repeatingGroup` semantics — avoid).
  - **Files:** `packages/core/src/store/{createFormStore,listeners,types}.ts` (primitive);
    `packages/pro/src/hooks/useRepeatingGroup.ts` (+`move`); renderer (drag UI). **Effort:** L.

- ✅ **#C1 Outside → inside** and **#C2 Inside → outside** — **shipped 2026-07-04** (commit
  `ff281bb`). #C1: form-level field reads the group as an array of row objects
  (`fieldNames: ['bankAccounts']`, empty → `[]`) via a core container-control registry +
  `pickValues` + `store.subscribeKeyAndDescendants`. #C2: `$root.` escape marker
  (`fieldNames: ['$root.accountType']`) in a row field's `dependents`. Detail:
  `docs/superpowers/specs/2026-07-04-repeating-group-cross-boundary-deps.md`.

- **Item-field typing** — inline item fields are loosely `Question`-typed. The
  `ControlTypeExtensions` augmentation registers `repeatingGroup` without a generic (TS module
  augmentation can't be generic), so item `key`s aren't checked against `TItem` (no
  autocomplete / unknown-key errors).
  - **Approach:** a typed factory `repeatingGroup<TItem>(config): Question` that returns a
    well-typed question — revisits the "declarative control, no factory" decision.
  - **Files:** `packages/pro/src/controls/repeatingGroup.ts`. **Effort:** M.

## Registry / renderers

- **`DropdownRenderer` clobbers a default value to `''` on mount** — the shadcn dropdown
  renderer resets a preset value to `''` on mount, wiping a seeded default. Visible inside
  `repeatingGroup` rows (Country dropdown seeded from `defaultItem`), but the fix is in the
  renderer, not the control.
  - **Approach:** find the mount effect / controlled-value sync in the dropdown renderer that
    writes `''` when the incoming value is already set, and guard it.
  - **Files:** `packages/registry/registry/easy-forms/dropdown-renderer.tsx` (+ mirror in
    `apps/playground/src/components/easy-forms/`). **Effort:** S.

## Apps (playground / docs)

_(none yet)_
