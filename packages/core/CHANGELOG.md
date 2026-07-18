# @easy-forms/core

## 0.1.2

### Patch Changes

- cbd61fc: docs: give the package README a proper header — centered logo, one-line pitch,
  badges, and Documentation / Quick start / Examples / GitHub links pointing to the
  live docs site (easy-forms-docs.vercel.app), above the existing API reference.
  Also point the package `homepage` at the docs site. Docs-only; no runtime changes.

## 0.1.1

### Patch Changes

- afea861: docs: update README for the shadcn registry distribution model. Install the UI with `npx shadcn@latest add @easy-forms/*` (own-the-code; no `@easy-forms/shadcn` package), use the pre-wired `<EasyForm>` wrapper, and read all dynamic props from `props.question` (corrects the removed `props.computed` / side `required`/`readOnly` renderer API).
