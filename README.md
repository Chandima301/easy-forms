# easy-forms

A higher-level React form library. Hand it an **array of question objects**; it owns rendering, validation, conditional logic, dirty/touched tracking, multi-step navigation, and submission.

No `useForm`. No `register()`. No `Controller`. The schema is the source of truth.

## Packages & distribution

- **`@easy-forms/core`** — types, state engine, hooks, headless components, dependency engine, wizard, plugin lifecycle. Zero UI dependencies. The only npm package. ([Docs](packages/core/README.md))
- **The UI ships as an own-the-code shadcn registry** (`@easy-forms/*`), not an npm package. In a shadcn project, add the namespace to `components.json` and pull the components with the shadcn CLI:

```jsonc
// components.json
{ "registries": { "@easy-forms": "https://chandima301.github.io/easy-forms/r/{name}.json" } }
```
```sh
npm install @easy-forms/core
pnpm dlx shadcn@latest add @easy-forms/easy-form   # all renderers + a pre-wired <EasyForm>
```

## Quick start

```tsx
import type { FormSchema } from '@easy-forms/core';
import { EasyForm } from '@/components/easy-forms/easy-form'; // scaffolded by `shadcn add`

const schema: FormSchema = {
  title: 'Sign up',
  groups: [
    {
      layout: 'grid',
      gridCols: 2,
      questions: [
        { key: 'email', label: 'Email', control: 'email',
          validators: { required: true, email: true } },
        { key: 'password', label: 'Password', control: 'text', inputType: 'password',
          validators: { required: true, minLength: 8 } },
      ],
    },
  ],
};

export default function App() {
  return (
    <EasyForm
      schema={schema}
      initialValues={{ email: '', password: '' }}
      onSubmit={async (values) => { /* ... */ }}
    />
  );
}
```

## Highlights

- **12 built-in controls**: text, textarea, number, email, dropdown, multiselect, checkbox, checkboxList, radioGroup, date, file, custom
- **3 categorical dependency kinds**:
  - `propsDependsOn` — dynamic question/group props (hidden, required, readOnly, options, minDate, placeholder, …)
  - `valueDependsOn` — derive a value
  - `resetDependsOn` — reset on rising edge
  Plus a pluggable handler registry for adding your own kinds.
- **Group-level dependencies** with CSS-hide that preserves descendant field state across show/hide
- **Arbitrarily nested groups** (improvement over typical "section + subsection" caps)
- **Strongly typed schema** — validator/dependency types narrow per-control via a discriminated union
- **Multi-step wizard** with per-step validation gating, step-level visibility, and resumable state in `localStorage`
- **Plugin lifecycle** (`onInit / onChange / onSubmit / onDestroy`) with built-in `loggerPlugin` and `autosavePlugin`
- **Custom state engine** built on `useSyncExternalStore` — only the changed field's subscribers re-render
- **Async validators with race protection** — stale results discarded if the value changed before they resolved
- **Cycle detection** in dev — field↔field, field↔group, group↔group dep loops fail loudly
- **Renderer registry** — every control's UI is swappable; default renderers come from the `@easy-forms` shadcn registry (copied into your repo, fully editable)

## Repo layout

```
packages/
  core/         @easy-forms/core   (engine, types, hooks — the npm package)
  registry/     (private)          (shadcn registry source: renderers + <EasyForm> + chrome CSS)
apps/
  playground/   local Vite dev sandbox (shadcn consumer)
  docs/         Fumadocs site (refactor onto the registry pending)
```

## Development

```sh
pnpm install
pnpm --filter playground dev   # interactive sandbox at http://localhost:5173
pnpm test                       # 58 tests across core
pnpm --filter @easy-forms/registry registry:build   # build the registry JSON
pnpm lint                       # biome
```

## Status

`@easy-forms/core@0.1.1` is on npm. The UI is distributed as the `@easy-forms` shadcn registry (`packages/registry`, hosted on GitHub Pages). The former `@easy-forms/shadcn` package has been removed. `apps/docs` is mid-migration and does not currently build.

## License

MIT
