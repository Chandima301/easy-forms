// Module singleton holding the verified license status for the running app.
import type { LicenseStatus } from './types';
import { verifyLicense } from './verify';

let current: LicenseStatus = { valid: false, reason: 'missing' };

/**
 * Register a license key for the application. Call once, as early as possible.
 * Verifies the key offline and caches the result. Idempotent — calling again
 * replaces the cached status.
 */
export function setEasyFormsProLicense(key: string): void {
	current = verifyLicense(key);
}

/** Read the cached license status. Defaults to `missing` until a key is set. */
export function getLicenseStatus(): LicenseStatus {
	return current;
}

/** Test-only: clear the cached status back to its initial `missing` state. */
export function resetLicenseForTests(): void {
	current = { valid: false, reason: 'missing' };
}
