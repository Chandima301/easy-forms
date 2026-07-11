---
'@easy-forms/pro': minor
---

Add `verifyRegistryToken` and a `registry` token audience: registry tokens gate
fetching the premium renderer source and are rejected as license keys (and vice
versa). New `license:sign-registry` maintainer CLI mints them.
