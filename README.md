# easy-forms

A higher-level React form library. Hand it an **array of question objects**; it owns rendering, validation, conditional logic, dirty/touched tracking, multi-step navigation, and submission.

No `useForm`. No `register()`. No `Controller`. The schema is the source of truth.

## Packages

- **`@easy-forms/core`** — types, state engine, hooks, headless components, dependency engine, wizard, plugin lifecycle. Zero UI dependencies. ([Docs](packages/core/README.md))
- **`@easy-forms/shadcn`** — default renderer registry. Built on Radix UI primitives + Tailwind CSS, with vendored shadcn-style component source. ([Docs](packages/shadcn/README.md))

## Quick start

```tsx
import { Form, type FormSchema } from '@easy-forms/core';
import { shadcnRegistry } from '@easy-forms/shadcn';

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
    <Form
      schema={schema}
      registry={shadcnRegistry}
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
- **Renderer registry** — every control's UI is swappable; default registry from `@easy-forms/shadcn`

## Repo layout

```
packages/
  core/         @easy-forms/core      (engine, types, hooks)
  shadcn/       @easy-forms/shadcn    (default renderers)
apps/
  playground/   local Vite dev sandbox
```

## Development

```sh
pnpm install
pnpm --filter playground dev   # interactive sandbox at http://localhost:5173
pnpm test                       # 54 tests across core
pnpm typecheck                  # 5 workspace tasks
pnpm build                      # ESM + CJS + .d.ts for both packages
pnpm lint                       # biome
```

## Status

Pre-release. Phases 1–6 of the roadmap have landed: monorepo scaffold, type system, custom state engine, renderer registry with 12 controls, dependency engine with 7 built-in kinds, multi-step wizard with persistence, plugin lifecycle, and docs.

## License

MIT
