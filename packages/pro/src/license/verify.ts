// Offline verification of a LICENSE key. A license key must not carry the
// 'registry' audience — that token type unlocks registry source, not the engine.
import type { LicenseStatus } from './types';
import { verifyTokenCore } from './verifyToken';

/**
 * Verify a license key. Pure and synchronous. Rejects a registry-audience token
 * so a registry token can never clear the engine watermark.
 *
 * @param key       the `payload.signature` token, or undefined/empty.
 * @param publicKey base64url-encoded 32-byte public key (defaults to embedded).
 * @param now       current time in ms (injectable for tests).
 */
export function verifyLicense(
	key: string | null | undefined,
	publicKey?: string,
	now?: number
): LicenseStatus {
	const status = verifyTokenCore(key, publicKey, now);
	if (!status.valid) return status;
	if (status.claims.aud === 'registry') {
		return { valid: false, reason: 'wrong-audience' };
	}
	return status;
}
