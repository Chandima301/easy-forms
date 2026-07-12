import { describe, expect, it } from 'vitest';
import { buildToken } from '../scripts/signToken';
import { bytesToBase64url } from '../src/license/base64url';
import { ed } from '../src/license/ed25519';
import { verifyLicense } from '../src/license/verify';
import { defaultClaims } from './signToken';

describe('scripts/signToken buildToken', () => {
	it('produces a token that verifies against its keypair', () => {
		const privateKey = ed.utils.randomPrivateKey();
		const publicKey = bytesToBase64url(ed.getPublicKey(privateKey));
		const claims = defaultClaims({ aud: 'license' });

		const token = buildToken(claims, bytesToBase64url(privateKey));

		// Pass a build date <= exp so the release-date gate accepts it.
		const status = verifyLicense(token, publicKey, claims.exp * 1000 - 1000);
		expect(status.valid).toBe(true);
		if (status.valid) expect(status.claims).toEqual(claims);
	});
});
