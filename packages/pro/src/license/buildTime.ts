// The build timestamp of THIS published @easy-forms/pro bundle. tsup replaces
// `__EF_PRO_BUILD_TIME__` with an ISO string at build time (see tsup.config.ts).
// In dev/test (vitest/tsx import src directly, no define) the identifier is
// absent, so we fall back to Date.now() — the most permissive value, which never
// falsely watermarks an unbuilt working tree. Gate tests inject an explicit build
// time via verifyLicense(..., now) instead of relying on this fallback.
declare const __EF_PRO_BUILD_TIME__: string | undefined;

export const PRO_BUILD_TIME: number =
	typeof __EF_PRO_BUILD_TIME__ === 'string' ? Date.parse(__EF_PRO_BUILD_TIME__) : Date.now();
