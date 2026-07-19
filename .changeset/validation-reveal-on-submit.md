---
"@easy-forms/core": patch
---

Only reveal validation errors after submit/next. Editing or blurring a field no longer surfaces its error early; errors are now revealed when the user submits the form (or advances a wizard step), at which point every field in that scope is validated at once. Fields re-validate live after the first submit. No renderer or `RendererProps` changes, so already-ejected renderers get the fix too.
