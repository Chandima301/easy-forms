---
'@easy-forms/pro': minor
---

License keys now use a **release-date gate** instead of wall-clock expiry: a key
is valid for any `@easy-forms/pro` version built on or before the key's expiry
(matching AG Grid / MUI X). A lapsed subscription no longer watermarks an
already-shipped app — only upgrading to a version published after the key's
expiry re-triggers the watermark. Registry-token validation is unchanged
(wall-clock). Also adds a `license:issue` maintainer CLI that mints the license +
registry token pair in a single command.
