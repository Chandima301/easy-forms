# @easy-forms/pro

Premium engine capabilities for [easy-forms](https://github.com/Chandima301/easy-forms) —
repeating sections, branching/non-linear wizard flows, and auto-generated review steps for
complex, conditional, multi-step React forms. Built on the free, MIT-licensed
`@easy-forms/core`.

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

## Status

Foundation only. The licensing layer (`setEasyFormsProLicense`, `assertLicensed`,
`useProLicense`, `<ProWatermark>`) is implemented; the paid feature controls
(`repeatingGroup`, branching wizard, auto-review) land in subsequent releases.
