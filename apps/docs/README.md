# Easy Forms — Documentation site

The marketing + documentation site for Easy Forms, built with **Next.js (App Router)** and
**Fumadocs**. Every live demo runs the genuine `@easy-forms/core` engine with the ejected
`@easy-forms` renderers (added to this app via `shadcn add`, under `components/easy-forms/`).

## Develop

The docs consume the **built** `dist` of `@easy-forms/core` (via `transpilePackages`), so
build it first. The UI lives in this app as ejected components (`components/easy-forms/` +
`components/ui/`), so there's nothing else to build:

```sh
# from the repo root
pnpm --filter @easy-forms/core build
pnpm --filter docs dev          # http://localhost:3000
```

Or run everything in watch mode from the root: `pnpm dev`.

## Build

```sh
pnpm --filter docs build
```

## Structure

| Path | What |
| --- | --- |
| `app/(home)/` | Landing page, `/examples` (gallery + detail pages), `/enterprise` |
| `app/docs/` | Fumadocs docs layout + MDX renderer |
| `content/docs/` | All documentation as MDX (the IA lives in `meta.json` files) |
| `components/landing/` | Hero, the animated `SchemaFormSync`, code showcase |
| `components/demo/` | `LiveForm`, `ComponentPreview`, `ExampleGallery`, and the example registry |
| `components/mdx/` | `PackageInstall`, `PropsTable` |
| `lib/source.ts` | Fumadocs loader (with a core/mdx version-bridge adapter) |

## Notes

- **Live demos with functions** (custom validators, dependency `compute`) must live in
  client components (`components/demo/examples.tsx`) — functions can't be serialized across
  the RSC boundary from server-rendered MDX.
- **Tailwind v4** auto-scans the app source, so the ejected renderers' utility classes
  (`components/easy-forms/`, `components/ui/`) are generated without extra `@source` config.
- Set `NEXT_PUBLIC_SITE_URL` for correct absolute URLs in metadata, sitemap, and robots.
