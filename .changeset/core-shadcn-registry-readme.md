---
"@easy-forms/core": patch
---

docs: update README for the shadcn registry distribution model. Install the UI with `npx shadcn@latest add @easy-forms/*` (own-the-code; no `@easy-forms/shadcn` package), use the pre-wired `<EasyForm>` wrapper, and read all dynamic props from `props.question` (corrects the removed `props.computed` / side `required`/`readOnly` renderer API).
