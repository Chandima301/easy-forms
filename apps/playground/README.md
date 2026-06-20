# playground

Local Vite + React sandbox for `@easy-forms/core`. A representative shadcn
consumer: the renderers in `src/components/easy-forms/` are the ejected
`@easy-forms` registry components, used via the `<EasyForm>` wrapper.

```sh
pnpm --filter playground dev
```

`src/type-tests.ts` houses the Phase 1 negative-type proofs — each `@ts-expect-error` confirms the type system rejects an invalid schema.
