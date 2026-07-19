# @easy-forms/core

## 0.1.3

### Patch Changes

- 23096cd: Only reveal validation errors after submit/next. Editing or blurring a field no longer surfaces its error early; errors are now revealed when the user submits the form (or advances a wizard step), at which point every field in that scope is validated at once. Fields re-validate live after the first submit. No renderer or `RendererProps` changes, so already-ejected renderers get the fix too.

## 0.1.2

### Patch Changes

- cbd61fc: docs: give the package README a proper header — centered logo, one-line pitch,
  badges, and Documentation / Quick start / Examples / GitHub links pointing to the
  live docs site (easy-forms-docs.vercel.app), above the existing API reference.
  Also point the package `homepage` at the docs site. Docs-only; no runtime changes.

## 0.1.1

### Patch Changes

- afea861: docs: update README for the shadcn registry distribution model. Install the UI with `npx shadcn@latest add @easy-forms/*` (own-the-code; no `@easy-forms/shadcn` package), use the pre-wired `<EasyForm>` wrapper, and read all dynamic props from `props.question` (corrects the removed `props.computed` / side `required`/`readOnly` renderer API).
