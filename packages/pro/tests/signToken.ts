// Test helper: mint a license token with a throwaway keypair (mirrors scripts/sign.ts).
import { base64urlToBytes, bytesToBase64url, stringToBase64url } from '../src/license/base64url';
import { ed, signingMessage } from '../src/license/ed25519';
import type { LicenseClaims } from '../src/license/types';

export interface TestKeypair {
	privateKey: Uint8Array;
	/** base64url-encoded public key, as embedded/passed to verifyLicense. */
	publicKey: string;
}

export function makeKeypair(): TestKeypair {
	const privateKey = ed.utils.randomPrivateKey();
	return { privateKey, publicKey: bytesToBase64url(ed.getPublicKey(privateKey)) };
}

export function signToken(claims: LicenseClaims, privateKey: Uint8Array): string {
	const payloadSegment = stringToBase64url(JSON.stringify(claims));
	const signature = ed.sign(signingMessage(payloadSegment), privateKey);
	return `${payloadSegment}.${bytesToBase64url(signature)}`;
}

/** Re-sign with an unrelated key — produces a token whose signature won't verify. */
export function signWithWrongKey(claims: LicenseClaims): string {
	return signToken(claims, ed.utils.randomPrivateKey());
}

export { base64urlToBytes };

export function defaultClaims(overrides: Partial<LicenseClaims> = {}): LicenseClaims {
	const nowSec = Math.floor(Date.now() / 1000);
	return {
		customer: 'Acme Inc',
		edition: 'pro',
		seats: 5,
		iat: nowSec,
		exp: nowSec + 60 * 60 * 24 * 365,
		...overrides,
	};
}
