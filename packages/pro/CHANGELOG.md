# @easy-forms/pro

## 0.2.0

### Minor Changes

- d87b5fa: Add `verifyRegistryToken` and a `registry` token audience: registry tokens gate
  fetching the premium renderer source and are rejected as license keys (and vice
  versa). New `license:sign-registry` maintainer CLI mints them.

## 0.1.0

### Minor Changes

- ee043fe: Enforce the Pro license in production: the unlicensed watermark and the one-time
  console warning now fire in production builds, not just development. First public
  release of the Pro engine.
