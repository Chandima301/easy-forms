# Easy Forms — Documentation site

The marketing + documentation site for Easy Forms, built with **Next.js (App Router)** and
**Fumadocs**. Every live demo runs the genuine `@easy-forms/core` engine with the
`@easy-forms/shadcn` renderer registry.

## Develop

The docs consume the **built** `dist` of the workspace packages (via `transpilePackages`),
so build them first:

```sh
# from the repo root
pnpm --filter @easy-forms/core build
pnpm --filter @easy-forms/shadcn build
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
| `app/(home)/` | Landing page, `/playground` (Schema Studio), `/enterprise` |
| `app/docs/` | Fumadocs docs layout + MDX renderer |
| `content/docs/` | All documentation as MDX (the IA lives in `meta.json` files) |
| `components/landing/` | Hero, the animated `SchemaFormSync`, code showcase |
| `components/demo/` | `LiveForm`, `SchemaStudio`, and the client-side example demos |
| `components/mdx/` | `PackageInstall`, `PropsTable` |
| `lib/source.ts` | Fumadocs loader (with a core/mdx version-bridge adapter) |

## Notes

- **Live demos with functions** (custom validators, dependency `compute`) must live in
  client components (`components/demo/examples.tsx`) — functions can't be serialized across
  the RSC boundary from server-rendered MDX.
- **Tailwind v4** scans the shadcn renderer bundles via an `@source` directive in
  `app/global.css` so the renderers' utility classes are generated.
- Set `NEXT_PUBLIC_SITE_URL` for correct absolute URLs in metadata, sitemap, and robots.
