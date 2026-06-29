import { describe, expect, it } from 'vitest';
import { verifyLicense } from '../src/license/verify';
import { defaultClaims, makeKeypair, signToken } from './signToken';

describe('verifyLicense', () => {
	it('verifies a freshly signed token round-trip', () => {
		const { privateKey, publicKey } = makeKeypair();
		const claims = defaultClaims();
		const token = signToken(claims, privateKey);

		const status = verifyLicense(token, publicKey);

		expect(status.valid).toBe(true);
		if (status.valid) expect(status.claims).toEqual(claims);
	});

	it('rejects a tampered signature (payload intact, signature no longer matches)', () => {
		const { privateKey, publicKey } = makeKeypair();
		const token = signToken(defaultClaims({ seats: 5 }), privateKey);

		// Flip the FIRST signature char (high-order bits) — payload stays valid JSON.
		const [payload, sig] = token.split('.') as [string, string];
		const flipped = `${sig.startsWith('A') ? 'B' : 'A'}${sig.slice(1)}`;
		const status = verifyLicense(`${payload}.${flipped}`, publicKey);

		expect(status).toEqual({ valid: false, reason: 'bad-signature' });
	});

	it('rejects a token signed by a different key', () => {
		const { publicKey } = makeKeypair();
		const other = makeKeypair();
		const token = signToken(defaultClaims(), other.privateKey);

		expect(verifyLicense(token, publicKey)).toEqual({
			valid: false,
			reason: 'bad-signature',
		});
	});

	it('rejects an expired token (valid signature, past exp)', () => {
		const { privateKey, publicKey } = makeKeypair();
		const expSec = Math.floor(Date.now() / 1000) - 10;
		const token = signToken(defaultClaims({ exp: expSec }), privateKey);

		expect(verifyLicense(token, publicKey)).toEqual({
			valid: false,
			reason: 'expired',
		});
	});

	it('treats exp as a boundary using the injected clock', () => {
		const { privateKey, publicKey } = makeKeypair();
		const expSec = 2_000_000_000;
		const token = signToken(defaultClaims({ exp: expSec }), privateKey);

		expect(verifyLicense(token, publicKey, expSec * 1000 - 1).valid).toBe(true);
		expect(verifyLicense(token, publicKey, expSec * 1000).valid).toBe(false);
	});

	it('returns "missing" for empty/undefined keys', () => {
		expect(verifyLicense(undefined)).toEqual({ valid: false, reason: 'missing' });
		expect(verifyLicense('')).toEqual({ valid: false, reason: 'missing' });
	});

	it('returns "malformed" for tokens without a payload.signature shape', () => {
		const { publicKey } = makeKeypair();
		expect(verifyLicense('no-dot', publicKey).valid).toBe(false);
		expect(verifyLicense('.sig', publicKey)).toEqual({
			valid: false,
			reason: 'malformed',
		});
		expect(verifyLicense('payload.', publicKey)).toEqual({
			valid: false,
			reason: 'malformed',
		});
	});

	it('returns "malformed" when claims are well-signed but wrong shape', () => {
		const { privateKey, publicKey } = makeKeypair();
		// Sign arbitrary JSON that is not LicenseClaims.
		const token = signToken(
			{ hello: 'world' } as unknown as ReturnType<typeof defaultClaims>,
			privateKey
		);
		expect(verifyLicense(token, publicKey)).toEqual({
			valid: false,
			reason: 'malformed',
		});
	});
});
