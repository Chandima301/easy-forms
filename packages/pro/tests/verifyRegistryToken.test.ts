import { describe, expect, it } from 'vitest';
import { verifyRegistryToken } from '../src/license/verifyRegistryToken';
import { defaultClaims, makeKeypair, signToken } from './signToken';

describe('verifyRegistryToken', () => {
	it('verifies a registry-audience token round-trip', () => {
		const { privateKey, publicKey } = makeKeypair();
		const claims = defaultClaims({ aud: 'registry' });
		const token = signToken(claims, privateKey);

		const status = verifyRegistryToken(token, publicKey);

		expect(status.valid).toBe(true);
		if (status.valid) expect(status.claims).toEqual(claims);
	});

	it('rejects a license-audience token (wrong audience)', () => {
		const { privateKey, publicKey } = makeKeypair();
		const token = signToken(defaultClaims({ aud: 'license' }), privateKey);
		expect(verifyRegistryToken(token, publicKey)).toEqual({
			valid: false,
			reason: 'wrong-audience',
		});
	});

	it('rejects a legacy token with no audience', () => {
		const { privateKey, publicKey } = makeKeypair();
		const token = signToken(defaultClaims(), privateKey);
		expect(verifyRegistryToken(token, publicKey)).toEqual({
			valid: false,
			reason: 'wrong-audience',
		});
	});

	it('rejects a tampered signature', () => {
		const { privateKey, publicKey } = makeKeypair();
		const token = signToken(defaultClaims({ aud: 'registry' }), privateKey);
		const [payload, sig] = token.split('.') as [string, string];
		const flipped = `${sig.startsWith('A') ? 'B' : 'A'}${sig.slice(1)}`;
		expect(verifyRegistryToken(`${payload}.${flipped}`, publicKey)).toEqual({
			valid: false,
			reason: 'bad-signature',
		});
	});

	it('rejects an expired registry token', () => {
		const { privateKey, publicKey } = makeKeypair();
		const expSec = Math.floor(Date.now() / 1000) - 10;
		const token = signToken(defaultClaims({ aud: 'registry', exp: expSec }), privateKey);
		expect(verifyRegistryToken(token, publicKey)).toEqual({
			valid: false,
			reason: 'expired',
		});
	});

	it('returns "missing" for an empty token', () => {
		expect(verifyRegistryToken(undefined)).toEqual({ valid: false, reason: 'missing' });
	});
});
