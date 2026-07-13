# @easy-forms/pro

## 0.3.0

### Minor Changes

- c2c6b87: License keys now use a **release-date gate** instead of wall-clock expiry: a key
  is valid for any `@easy-forms/pro` version built on or before the key's expiry
  (matching AG Grid / MUI X). A lapsed subscription no longer watermarks an
  already-shipped app — only upgrading to a version published after the key's
  expiry re-triggers the watermark. Registry-token validation is unchanged
  (wall-clock). Also adds a `license:issue` maintainer CLI that mints the license +
  registry token pair in a single command.

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
