// Soft feature gate. Reads the cached license status and, in development only,
// warns once per feature when unlicensed. Production never warns and never
// blocks — features always render.
import { getLicenseStatus } from './setEasyFormsProLicense';

const isDev = (): boolean => process.env.NODE_ENV !== 'production';

const warned = new Set<string>();

/** Test-only: clear the one-time-warning dedupe set. */
export function resetWarningsForTests(): void {
	warned.clear();
}

/**
 * Check whether a Pro `feature` is licensed. Returns the validity, but callers
 * must NOT block on a `false` result — production always renders. In dev, fires
 * a single `console.warn` per feature when the license is missing/invalid/expired.
 */
export function assertLicensed(feature: string): boolean {
	const status = getLicenseStatus();
	if (status.valid) return true;

	if (isDev() && !warned.has(feature)) {
		warned.add(feature);
		console.warn(
			`[@easy-forms/pro] "${feature}" is a Pro feature but no valid license was found (${status.reason}). It still works, but please set a license with setEasyFormsProLicense(key). See https://github.com/Chandima301/easy-forms.`
		);
	}
	return false;
}
