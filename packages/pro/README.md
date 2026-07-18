<p align="center">
  <a href="https://easy-forms-docs.vercel.app">
    <img src="https://easy-forms-docs.vercel.app/easy-forms-logo.svg" alt="easy-forms" width="260" />
  </a>
</p>

<h1 align="center">@easy-forms/pro</h1>

<p align="center">
  <strong>The premium engine for complex, conditional, multi-step React forms.</strong><br />
  Repeating line-item sections and branching (non-linear) wizard flows for
  <a href="https://www.npmjs.com/package/@easy-forms/core">@easy-forms/core</a> — the genuinely
  hard capabilities teams would otherwise build and maintain themselves.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@easy-forms/pro"><img src="https://img.shields.io/npm/v/@easy-forms/pro.svg?color=2563eb" alt="npm version" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-commercial-8b5cf6" alt="commercial license" /></a>
  <a href="https://www.npmjs.com/package/@easy-forms/pro"><img src="https://img.shields.io/npm/types/@easy-forms/pro.svg" alt="types" /></a>
</p>

<p align="center">
  <a href="https://easy-forms-docs.vercel.app/docs/enterprise"><strong>Documentation</strong></a>
  ·
  <a href="https://easy-forms-docs.vercel.app/docs/pro-install"><strong>Install</strong></a>
  ·
  <a href="https://easy-forms-docs.vercel.app/enterprise"><strong>Get a license</strong></a>
</p>

---

Premium engine capabilities for [easy-forms](https://github.com/Chandima301/easy-forms) —
repeating sections and branching / non-linear wizard flows for complex, conditional,
multi-step React forms. Built on the free, MIT-licensed `@easy-forms/core`.

> **Commercial software.** `@easy-forms/pro` requires a valid Easy Forms Pro license
> (sold per developer seat, renewable). The source is available for transparency, but it is
> **not** open source — see [`LICENSE`](./LICENSE).

## Licensing

```ts
import { setEasyFormsProLicense } from '@easy-forms/pro';

// Call once, as early as possible (e.g. app entry).
setEasyFormsProLicense(process.env.EASY_FORMS_PRO_LICENSE!);
```

Enforcement is **soft**: without a valid license you get a one-time development warning and
an on-screen "Pro — unlicensed" watermark. **Production never breaks** — features keep
working. This is an integrity check and a nudge to license honestly, not DRM.

A license key is an Ed25519-signed, JWT-shaped token of the form
`base64url(payload).base64url(signature)`, where the payload carries
`{ customer, edition, seats, iat, exp }`. The public verification key is embedded in this
package; the signing key is held only by Easy Forms.

## What's included

- **Repeating groups** — repeating line-item sections (invoices, contacts, order lines)
  with add/remove, per-row validation, `minItems` / `maxItems` bounds, and `$root.`-prefixed
  access to form-level fields from inside a row. `RepeatingGroupItem`, `useRepeatingGroup`,
  `repeatingGroupValidators`.
- **Branching wizard** — non-linear, conditional multi-step flows where the next step is
  computed from answers, not a fixed sequence. `useAdvancedWizard`, `AdvancedWizardPanel`,
  `AdvancedWizardContext`, `resolveNext`. Pair with the ejectable `<AdvancedWizard>` from
  the registry (`shadcn add @easy-forms/advanced-wizard`).
- **Licensing layer** — `setEasyFormsProLicense`, `assertLicensed`, `useProLicense`,
  `<ProWatermark>`, and registry-token verification.

## Roadmap

- **Auto-review step** — a step that summarizes the form's answers for confirmation before
  submit. Not yet shipped.
