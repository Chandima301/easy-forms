// Shared token-verification core used by both the license verifier and the
// registry-token verifier. Splits the token, checks the Ed25519 signature, then
// validates claim shape and expiry. Audience is NOT checked here — callers do that.
import { base64urlToBytes, base64urlToString } from './base64url';
import { ed, signingMessage } from './ed25519';
import { PRO_PUBLIC_KEY } from './publicKey';
import type { LicenseClaims, LicenseStatus } from './types';

function looksLikeClaims(value: unknown): value is LicenseClaims {
	if (typeof value !== 'object' || value === null) return false;
	const v = value as Record<string, unknown>;
	return (
		typeof v.customer === 'string' &&
		v.edition === 'pro' &&
		typeof v.seats === 'number' &&
		typeof v.iat === 'number' &&
		typeof v.exp === 'number' &&
		(v.aud === undefined || v.aud === 'license' || v.aud === 'registry')
	);
}

/**
 * Verify a token's signature, shape, and expiry. Returns the claims on success
 * (including `aud`); the caller enforces the audience it requires.
 */
export function verifyTokenCore(
	token: string | null | undefined,
	publicKey: string = PRO_PUBLIC_KEY,
	now: number = Date.now()
): LicenseStatus {
	if (!token) return { valid: false, reason: 'missing' };

	const dot = token.indexOf('.');
	if (dot <= 0 || dot === token.length - 1) {
		return { valid: false, reason: 'malformed' };
	}
	const payloadSegment = token.slice(0, dot);
	const signatureSegment = token.slice(dot + 1);

	let claims: unknown;
	let signatureValid: boolean;
	try {
		claims = JSON.parse(base64urlToString(payloadSegment));
		signatureValid = ed.verify(
			base64urlToBytes(signatureSegment),
			signingMessage(payloadSegment),
			base64urlToBytes(publicKey)
		);
	} catch {
		return { valid: false, reason: 'malformed' };
	}

	if (!signatureValid) return { valid: false, reason: 'bad-signature' };
	if (!looksLikeClaims(claims)) return { valid: false, reason: 'malformed' };
	if (claims.exp * 1000 <= now) return { valid: false, reason: 'expired' };

	return { valid: true, claims };
}
