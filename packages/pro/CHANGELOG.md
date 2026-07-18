# @easy-forms/pro

## 0.3.1

### Patch Changes

- cbd61fc: docs: give the Pro package README a branded header (logo, pitch, badges,
  Documentation / Install / Get a license links to the live docs site) and correct
  the status — repeating groups and the branching wizard have shipped; auto-review is
  on the roadmap, not yet available. Also point `homepage` at the docs site and trim
  the unshipped feature from the package description. Docs/metadata only.
- Updated dependencies [cbd61fc]
  - @easy-forms/core@0.1.2

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
