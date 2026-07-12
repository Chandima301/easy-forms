// Offline verification of a REGISTRY token — the token that unlocks fetching the
// premium renderer source. Same signing keypair as the license key; the 'registry'
// audience is what separates the two. Used by the authenticated registry endpoint.
import type { LicenseStatus } from './types';
import { verifyTokenCore } from './verifyToken';

/**
 * Verify a registry token. Requires `aud === 'registry'`; a license-audience or
 * legacy (no-audience) token is rejected as 'wrong-audience'.
 */
export function verifyRegistryToken(
	token: string | null | undefined,
	publicKey?: string,
	now?: number
): LicenseStatus {
	const status = verifyTokenCore(token, publicKey, now);
	if (!status.valid) return status;
	if (status.claims.aud !== 'registry') {
		return { valid: false, reason: 'wrong-audience' };
	}
	return status;
}
