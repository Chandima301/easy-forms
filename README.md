<div align="center">

<img src=".github/assets/logo.svg" alt="easy-forms" width="76" height="76" />

# easy-forms

### The React form engine you'd otherwise build yourself.

Hand it an **array of question objects**. It owns the whole workflow — rendering, validation, conditional logic, dirty/touched tracking, multi-step wizards, and submission. No `useForm`. No `register()`. No `Controller`. **The schema is the source of truth.**

[![npm version](https://img.shields.io/npm/v/@easy-forms/core.svg?color=2563eb)](https://www.npmjs.com/package/@easy-forms/core)
[![license](https://img.shields.io/npm/l/@easy-forms/core.svg?color=16a34a)](./LICENSE)
[![types](https://img.shields.io/npm/types/@easy-forms/core.svg)](https://www.npmjs.com/package/@easy-forms/core)

**[Documentation](https://easy-forms-docs.vercel.app/docs)** · **[Quick start](https://easy-forms-docs.vercel.app/docs/quick-start)** · **[Examples](https://easy-forms-docs.vercel.app/examples)**

<br />

<img src=".github/assets/hero.gif" alt="A schema array turning into a working multi-step form with conditional fields" width="760" />

</div>

---

## Why

You've built the same complicated React form more than once — the multi-step state, the fields that appear based on other fields, the validation that has to respect all of it, and getting the submitted data shape right. Then you built it again for the next project.

`react-hook-form` and Formik give you the **primitives** and you assemble the workflow every time. **easy-forms is the workflow.** You describe the form as data; the library renders it, wires up the dependencies, validates it, walks the wizard, and hands you clean values on submit.

## The whole idea, in one screen

This array **is** the form. Change the data, change the form — no JSX to rewire, no state to manage.

```tsx
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

        // This field only appears when `plan` is 'team'. No effect, no useState.
        { key: 'seats', label: 'Seats', control: 'number',
          validators: { required: true, min: 1 },
          dependents: {
            propsDependsOn: [{
              fieldNames: ['plan'],
              compute: ({ plan }) => ({ hidden: plan !== 'team' }),
            }],
          } },
      ],
    },
  ],
};
```

You get a rendered, validated form with a conditional field — from data alone.

## Install

```sh
npm install @easy-forms/core
```

The UI ships as an **own-the-code shadcn registry** (not a locked npm package). Add the namespace to `components.json` and pull the components with the shadcn CLI — they land in your repo, fully editable:

```jsonc
// components.json
{ "registries": { "@easy-forms": "https://chandima301.github.io/easy-forms/r/{name}.json" } }
```

```sh
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
      onSubmit={async (values) => { /* clean, typed values */ }}
    />
  );
}
```

## What you stop hand-rolling

- **Conditional fields & sections** — one `propsDependsOn` rule drives every dynamic prop: `hidden`, `required`, `readOnly`, `options`, `min`/`max`, dates, placeholder, and more. Adding a new dynamic behavior needs zero new plumbing.
- **Derived values** — `valueDependsOn` computes a field from others without flipping your dirty state.
- **Multi-step wizards** — per-step validation gating, step-level visibility, and resumable progress in `localStorage`. Steps are CSS-hidden, so **field state survives navigation** instead of unmounting.
- **Nested groups** — arbitrarily deep, not the usual "section + subsection" cap. Hiding a group preserves its descendants' state.
- **Validation that respects the whole form** — sync built-ins → custom → async, with race protection (stale async results are discarded) and hidden fields short-circuited.
- **A store that doesn't over-render** — a custom `useSyncExternalStore` engine with topic-based per-field subscriptions: changing one field wakes only that field's subscribers.
- **Swappable UI** — every control's renderer is a component you own and can edit. Cosmetic controls are MIT and free.
- **Loud failures in dev** — cycle detection catches field↔field / field↔group / group↔group dependency loops before they ship.

## Free core, paid Pro

The engine is **MIT and free, forever.** Pro exists for the genuinely hard cases that teams hit — the stuff you'd otherwise spend a sprint building and then maintaining.

| Tier | Package | What you get |
|---|---|---|
| **Core** (free, MIT) | [`@easy-forms/core`](https://www.npmjs.com/package/@easy-forms/core) | The engine, hooks, dependency system, wizard, plugins. |
| **UI** (free) | `@easy-forms` shadcn registry | `shadcn add @easy-forms/easy-form` — own-the-code renderers. |
| **Pro** | `@easy-forms/pro` | Repeating line-item groups, branching / non-linear wizards, an auto-review step. |

## Development

```sh
pnpm install
pnpm --filter playground dev   # interactive sandbox at http://localhost:5173
pnpm test                       # 58 tests across core
pnpm lint                       # biome
```

<details>
<summary><strong>Repo layout</strong></summary>

```
packages/
  core/         @easy-forms/core   (engine, types, hooks — the npm package)
  registry/     (private)          (shadcn registry source: renderers + <EasyForm> + chrome CSS)
apps/
  playground/   local Vite dev sandbox (shadcn consumer)
  docs/         Fumadocs site (migration onto the registry in progress)
```

</details>

## Status

`@easy-forms/core@0.1.1` is on npm; the UI is distributed as the `@easy-forms` shadcn registry (hosted on GitHub Pages); the [docs site](https://easy-forms-docs.vercel.app) is live and growing. The library is in active development — the engine is stable and tested (58 tests). If you build a lot of forms, I'd genuinely love your feedback — open an issue or a discussion.

If it saves you from hand-rolling one more wizard, a ⭐ helps others find it.

## License

Core is [MIT](./LICENSE). Built by [@Chandima301](https://github.com/Chandima301).
