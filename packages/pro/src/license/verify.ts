// Offline verification of a license token against an embedded Ed25519 public key.
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
		typeof v.exp === 'number'
	);
}

/**
 * Verify a license key. Pure and synchronous — splits the token, checks the
 * Ed25519 signature against `publicKey`, then validates claim shape and expiry.
 *
 * @param key       the `payload.signature` token, or undefined/empty.
 * @param publicKey base64url-encoded 32-byte public key (defaults to embedded).
 * @param now       current time in ms (injectable for tests).
 */
export function verifyLicense(
	key: string | null | undefined,
	publicKey: string = PRO_PUBLIC_KEY,
	now: number = Date.now()
): LicenseStatus {
	if (!key) return { valid: false, reason: 'missing' };

	const dot = key.indexOf('.');
	if (dot <= 0 || dot === key.length - 1) {
		return { valid: false, reason: 'malformed' };
	}
	const payloadSegment = key.slice(0, dot);
	const signatureSegment = key.slice(dot + 1);

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
