// Offline verification of a LICENSE key. A license key must not carry the
// 'registry' audience — that token type unlocks registry source, not the engine.
// Expiry is a RELEASE-DATE gate: a key is valid for any @easy-forms/pro version
// built before the key's exp. So the comparison timestamp defaults to this
// bundle's PRO_BUILD_TIME, not wall-clock now — a lapsed subscription keeps a
// clean app on versions released during the paid term.
import { PRO_BUILD_TIME } from './buildTime';
import type { LicenseStatus } from './types';
import { verifyTokenCore } from './verifyToken';

/**
 * Verify a license key. Pure and synchronous. Rejects a registry-audience token
 * so a registry token can never clear the engine watermark.
 *
 * @param key       the `payload.signature` token, or undefined/empty.
 * @param publicKey base64url-encoded 32-byte public key (defaults to embedded).
 * @param now       comparison timestamp in ms — the installed version's build
 *                  date. Defaults to PRO_BUILD_TIME; injectable for tests.
 */
export function verifyLicense(
	key: string | null | undefined,
	publicKey?: string,
	now: number = PRO_BUILD_TIME
): LicenseStatus {
	const status = verifyTokenCore(key, publicKey, now);
	if (!status.valid) return status;
	if (status.claims.aud === 'registry') {
		return { valid: false, reason: 'wrong-audience' };
	}
	return status;
}
