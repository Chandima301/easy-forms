# @easy-forms/core

Headless React form library. Hand it an array of question objects; it owns rendering, validation, conditional logic, dirty/touched tracking, multi-step navigation, and submission.

No `register()`. No `Controller`. No `useForm` boilerplate. The schema is the source of truth.

```sh
pnpm add @easy-forms/core
# plus a renderer kit:
pnpm add @easy-forms/shadcn
```

## Hello world

```tsx
import { Form, type FormSchema } from '@easy-forms/core';
import { shadcnRegistry } from '@easy-forms/shadcn';

interface Data extends Record<string, unknown> {
  email: string;
  password: string;
}

const schema: FormSchema<Data> = {
  title: 'Sign in',
  groups: [
    {
      questions: [
        { key: 'email', label: 'Email', control: 'email',
          validators: { required: true, email: true } },
        { key: 'password', label: 'Password', control: 'text', inputType: 'password',
          validators: { required: true, minLength: 8 } },
      ],
    },
  ],
};

export function App() {
  return (
    <Form<Data>
      schema={schema}
      registry={shadcnRegistry}
      initialValues={{ email: '', password: '' }}
      onSubmit={async (values) => { await fetch('/login', { method: 'POST', body: JSON.stringify(values) }); }}
    />
  );
}
```

## What's included

- **12 built-in controls**: text, textarea, number, email, dropdown, multiselect, checkbox, checkboxList, radioGroup, date, file, custom
- **3 categorical dependency kinds**: `propsDependsOn` (dynamic question/group props — hidden / required / readOnly / options / minDate / placeholder / …), `valueDependsOn` (derive a value), `resetDependsOn` (reset on rising edge)
- **Group-level dependencies** with CSS-hide that preserves descendant field state across show/hide
- **Multi-step wizard** with per-step validation, step-level visibility, and resumable state via `localStorage`
- **Plugin lifecycle** (`onInit / onChange / onSubmit / onDestroy`) with built-in `loggerPlugin` and `autosavePlugin`
- **Renderer registry** — every control's UI is swappable; default registry from `@easy-forms/shadcn`
- **Custom external store + `useSyncExternalStore`** — only the changed field's subscribers re-render
- **Async validators with race protection** — stale results are dropped if the value changed before they resolved
- **Cycle detection** in dev — field↔field, field↔group, group↔group dep loops fail loudly

## Question schema

```ts
interface FormSchema<TFormData> {
  title?: string;
  description?: string;
  groups: Group<TFormData>[];
  wizard?: WizardConfig<TFormData>;
}

interface Group<TFormData> {
  title?: string;
  layout?: 'stack' | 'grid';
  gridCols?: 1 | 2 | 3 | 4 | 6 | 12;
  dependents?: Dependency<TFormData>;   // group-level visibility
  questions?: Question<TFormData>[];
  groups?: Group<TFormData>[];          // recursive — arbitrary depth
}
```

Each `Question` is a discriminated union by `control` — narrowing happens automatically:

```ts
{
  key: 'age',
  label: 'Age',
  control: 'number',
  validators: { required: true, min: 13, max: 130 },  // typed for numbers
  prefix: '$',
}
```

Putting `validators.minLength: 3` on a number control is a TypeScript error.

## Validators

```ts
validators: {
  required: true,                       // or { value: true, message: 'Email is required' }
  minLength: 3,                         // strings & arrays
  maxLength: 200,
  min: 0,                               // numbers
  max: 100,
  pattern: /^[A-Z][a-z]+$/,
  email: true,
  custom: async (value, allValues) =>
    (await usernameTaken(value)) ? 'Already taken' : null,
}
```

`custom` can be a single function or a `Record<string, fn>` of named validators. Sync errors short-circuit async customs.

## Dependencies

Two categories, three built-in kinds:

**`propsDependsOn`** — Dynamic question/group props. One generic dep replaces what would otherwise need separate `visibilityDependsOn` / `requiredDependsOn` / `optionsDependsOn` / `minDateDependsOn` / `readOnlyDependsOn` handlers. The compute returns a `Partial<RuntimeProps>` and the engine merges it into the target's runtime override map. Adding a new dynamic prop (e.g. dynamic `placeholder`) costs zero new code.

```ts
// Cascading dropdown — set options + placeholder + disabled in ONE rule
{ key: 'state', control: 'dropdown', options: [],
  dependents: {
    propsDependsOn: [
      { fieldNames: ['country'], compute: (v) => ({
          options: STATES_BY_COUNTRY[v.country as string] ?? [],
          disabled: !v.country,
          placeholder: v.country ? 'Pick a state' : 'Pick a country first',
      }) },
    ],
  },
}

// Multiple independent rules — last write wins for the same prop
{ key: 'email', control: 'email', clearWhenHidden: true,
  dependents: {
    propsDependsOn: [
      { fieldNames: ['subscribe'], compute: (v) => ({
          hidden: v.subscribe !== true,
          required: v.subscribe === true,
      }) },
    ],
  },
}

// Group-level (hides the whole section; child field state preserved via CSS-hide)
{ id: 'marketing', title: 'Marketing preferences',
  dependents: {
    propsDependsOn: [
      { fieldNames: ['subscribe'], compute: (v) => ({ hidden: v.subscribe !== true }) },
    ],
  },
  questions: [...],
}
```

**`valueDependsOn`** — Derive a value from other fields. Deferred via `queueMicrotask`; does NOT flip the form's `isDirty`.

```ts
{ key: 'total', control: 'number',
  dependents: {
    valueDependsOn: {
      fieldNames: ['price', 'qty'],
      compute: (v) => Number(v.price) * Number(v.qty),
    }
  }
}
```

**`resetDependsOn`** — Reset a field to its `initialValue` when a predicate flips false → true.

```ts
{ key: 'shippingAddress', control: 'text',
  dependents: {
    resetDependsOn: {
      fieldNames: ['useBilling'],
      when: (v) => v.useBilling === true,
    },
  },
}
```

### Hide policy

A field's `clearWhenHidden: true` resets it on the false → true edge of its effective `hidden`. Same option on a group cascades the reset to every descendant. Default is off — state is preserved across show/hide.

### Cycle detection

In dev, the engine builds a dependency graph and runs DFS. Any field↔field, field↔group, or group↔group cycle throws with a `[group] a → b → [group] a` path. Production builds skip the check.

### Adding a custom dep kind

Drop down to the low-level `DependencyHandler { getDependencies, apply }` interface:

```ts
const myDep: DependencyHandler<MyConfig> = {
  getDependencies: (cfg) => cfg.fieldNames,
  apply(cfg, ctx) {
    if (ctx.target.kind !== 'field') return;
    // ... do something with ctx.store
  },
};

<Form
  schema={schema}
  registry={shadcnRegistry}
  dependencyHandlers={{ myDep }}
  onSubmit={save}
/>
```

## Wizard

Add `wizard.steps` to the schema and `<Form>` switches into wizard mode automatically:

```ts
const schema: FormSchema = {
  groups: [],
  wizard: {
    persistKey: 'signup-wizard',     // resumable across refresh
    steps: [
      { id: 'identity',  title: 'Identity',  groups: [...] },
      { id: 'address',   title: 'Address',   groups: [...] },
      { id: 'review',    title: 'Review',    groups: [...] },
    ],
  },
};
```

- All fields from every step are registered up-front; cross-step `valueDependsOn` works.
- `goNext` validates only the current step.
- Step-level `visibilityDependsOn` skips hidden steps in navigation.
- On successful submit, the `persistKey` is cleared.

Use the `useWizard()` hook inside the form tree for custom navigation UI.

## Plugins

```tsx
import { Form, loggerPlugin, autosavePlugin, definePlugin } from '@easy-forms/core';

const analyticsPlugin = definePlugin({
  name: 'analytics',
  onSubmit: (_ctx, values) => track('form-submitted', values),
});

<Form
  schema={schema}
  registry={shadcnRegistry}
  plugins={[
    loggerPlugin(),
    autosavePlugin({ key: 'draft' }),
    analyticsPlugin,
  ]}
  onSubmit={save}
/>
```

Lifecycle hooks: `onInit`, `onChange(key, value)`, `onSubmit(values)`, `onDestroy`.

## Renderer registry

Every control type maps to a renderer in the registry. Override individual controls:

```tsx
<Form registry={{ ...shadcnRegistry, dropdown: MyFancyDropdown }} ... />
```

A renderer is a React component with this prop shape:

```tsx
import type { RendererProps, TextQuestion } from '@easy-forms/core';

function MyTextRenderer(props: RendererProps<TextQuestion>) {
  return (
    <input
      value={props.value ?? ''}
      onChange={(e) => props.onChange(e.target.value)}
      onBlur={props.onBlur}
      aria-invalid={props.touched && !!props.error || undefined}
    />
  );
}
```

`props.required` reflects static `validators.required` OR dynamic `requiredDependsOn`. `props.readOnly` likewise. `props.computed` exposes anything the dependency engine wrote (options, minDate, maxDate, etc.).

## Hooks

| Hook | Use |
|---|---|
| `useField(key)` | Subscribe to one field's value/error/dirty — only re-renders for that field |
| `useFormState()` | Subscribe to form-wide `isDirty / isValid / isSubmitting / values / errors` |
| `useFormValues()` | Shortcut for `useFormState().values` |
| `useWatch(key)` / `useWatch(keys)` | Read one or more values without subscribing to the entire form |
| `useWizard()` | Inside a wizard form — current step, navigation, `submit()` |

## Headless usage

If you want full control of layout and rendering, skip `<Form>` and wire the store yourself:

```tsx
import { createFormStore, FormStoreProvider, useField } from '@easy-forms/core';

const store = createFormStore({ initialValues: { name: '' } });
store.registerField({ key: 'name', validators: { required: true } });

function App() {
  return (
    <FormStoreProvider store={store}>
      <NameField />
      <button onClick={() => store.submit(async (v) => console.log(v))}>Save</button>
    </FormStoreProvider>
  );
}

function NameField() {
  const { value, error, setValue, setTouched } = useField<string>('name');
  return <input value={value ?? ''} onChange={(e) => setValue(e.target.value)} onBlur={() => setTouched()} />;
}
```

## License

MIT
