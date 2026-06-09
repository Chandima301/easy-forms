# @easy-forms/shadcn

Default renderer registry for [`@easy-forms/core`](../core). Built on [Radix UI](https://www.radix-ui.com/) primitives + [Tailwind CSS](https://tailwindcss.com/), with shadcn-style component source vendored under `src/primitives/`.

```sh
pnpm add @easy-forms/shadcn @easy-forms/core
```

## Setup (two steps)

**1. Import the chrome stylesheet** once in your app entry. This is plain CSS —
no Tailwind processing required — and styles the form container, header, footer,
submit/reset buttons, group titles, grid layout, and wizard navigation:

```ts
// main.tsx / index.tsx
import '@easy-forms/shadcn/styles.css';
```

**2. Configure Tailwind** to scan this package so the control inputs (text,
dropdown, checkbox, …) get their inline utility classes emitted:

```ts
// tailwind.config.ts
export default {
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/@easy-forms/shadcn/dist/**/*.js',
  ],
};
```

That's it. Step 1 covers the form *chrome* (rendered by `@easy-forms/core`);
step 2 covers the *controls* (rendered by this package's Tailwind components).
You do NOT need to scan `@easy-forms/core` — its chrome ships as plain CSS in
step 1.

### Requirements

- React 18+
- Tailwind CSS 3.4+ (for the control inputs)

### Re-theming

Every chrome class (`.easy-forms__submit`, `.easy-forms-group__title`,
`.easy-forms-wizard__next`, …) is a single-class selector. Load your own
stylesheet after `styles.css`, or add Tailwind utilities, to override.

## Usage

```tsx
import { Form } from '@easy-forms/core';
import { shadcnRegistry } from '@easy-forms/shadcn';

<Form schema={schema} registry={shadcnRegistry} onSubmit={save} />
```

## What it ships

**Renderers** (one per built-in control type)

| Control | Renderer | Built on |
|---|---|---|
| `text` | `TextRenderer` | Native input |
| `textarea` | `TextAreaRenderer` | Native textarea |
| `number` | `NumberRenderer` | Native input + decimal-mode keyboard, optional thousand separators |
| `email` | `EmailRenderer` | Native email input |
| `dropdown` | `DropdownRenderer` | `@radix-ui/react-select` |
| `multiselect` | `MultiSelectRenderer` | `@radix-ui/react-popover` + checkbox list |
| `checkbox` | `CheckboxRenderer` | `@radix-ui/react-checkbox` |
| `checkboxList` | `CheckboxListRenderer` | Group of checkboxes |
| `radioGroup` | `RadioGroupRenderer` | `@radix-ui/react-radio-group` |
| `date` | `DateRenderer` | Native `<input type="date">` |
| `file` | `FileRenderer` | Native file input, custom trigger |
| `custom` | `CustomRenderer` | Delegates to user component |

All renderers wire `aria-invalid`, `aria-describedby`, and the required `*` indicator (dynamic — reflects `requiredDependsOn` too).

**Primitives** — exposed so you can compose your own renderers without re-implementing the shadcn look:

`Button`, `Input`, `Textarea`, `Label`, `Checkbox`, `RadioGroup` + `RadioGroupItem`, `Select` + `SelectTrigger` + `SelectContent` + `SelectItem` + `SelectValue` + `SelectGroup`, `Popover` + `PopoverTrigger` + `PopoverContent`, `FieldShell`, plus `cn()` (clsx + tailwind-merge).

## Overriding a single control

```tsx
import { shadcnRegistry } from '@easy-forms/shadcn';
import { MyFancyDropdown } from './MyFancyDropdown';

<Form registry={{ ...shadcnRegistry, dropdown: MyFancyDropdown }} ... />
```

## Bringing your own design system

The `shadcnRegistry` is just a `RendererRegistry` object. If you're not on Tailwind, build your own registry — `@easy-forms/core` doesn't care:

```ts
import type { RendererRegistry } from '@easy-forms/core';

export const myRegistry: RendererRegistry = {
  text: MyTextRenderer,
  dropdown: MyDropdownRenderer,
  // ...
};
```

## License

MIT
