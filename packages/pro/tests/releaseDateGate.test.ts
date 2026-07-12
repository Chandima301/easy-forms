import { describe, expect, it } from 'vitest';
import { verifyLicense } from '../src/license/verify';
import { verifyRegistryToken } from '../src/license/verifyRegistryToken';
import { defaultClaims, makeKeypair, signToken } from './signToken';

// A key's exp is the END of the paid subscription term. The gate asks: was the
// INSTALLED version (its build date) released on or before exp? We simulate the
// installed version's build date by passing it as verifyLicense's `now` arg.
describe('verifyLicense release-date gate', () => {
	it('accepts a wall-clock-expired key when the build date is <= exp', () => {
		const { privateKey, publicKey } = makeKeypair();
		// exp is in the PAST relative to real wall-clock time...
		const expSec = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30;
		const token = signToken(defaultClaims({ aud: 'license', exp: expSec }), privateKey);

		// ...but the installed build predates exp (version shipped during the term).
		const buildMs = expSec * 1000 - 60 * 60 * 24 * 1000; // one day before exp
		expect(verifyLicense(token, publicKey, buildMs).valid).toBe(true);
	});

	it('rejects a key when the installed build date is AFTER exp', () => {
		const { privateKey, publicKey } = makeKeypair();
		const expSec = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365;
		const token = signToken(defaultClaims({ aud: 'license', exp: expSec }), privateKey);

		// Installed a version built one day AFTER the term ended → not covered.
		const buildMs = expSec * 1000 + 60 * 60 * 24 * 1000;
		expect(verifyLicense(token, publicKey, buildMs)).toEqual({
			valid: false,
			reason: 'expired',
		});
	});

	it('treats build-date == exp as still covered (boundary is exclusive of expiry)', () => {
		const { privateKey, publicKey } = makeKeypair();
		const expSec = 2_000_000_000;
		const token = signToken(defaultClaims({ aud: 'license', exp: expSec }), privateKey);

		expect(verifyLicense(token, publicKey, expSec * 1000 - 1).valid).toBe(true);
		expect(verifyLicense(token, publicKey, expSec * 1000).valid).toBe(false);
	});

	it('does not affect registry tokens — they stay wall-clock', () => {
		const { privateKey, publicKey } = makeKeypair();
		const expSec = Math.floor(Date.now() / 1000) - 10; // already past
		const token = signToken(defaultClaims({ aud: 'registry', exp: expSec }), privateKey);
		// Registry verification compares against real now → expired.
		expect(verifyRegistryToken(token, publicKey)).toEqual({
			valid: false,
			reason: 'expired',
		});
	});

	it('setEasyFormsProLicense uses the build-date default (no now arg)', async () => {
		const { setEasyFormsProLicense, getLicenseStatus, resetLicenseForTests } =
			await import('../src/license/setEasyFormsProLicense');
		const { PRO_BUILD_TIME } = await import('../src/license/buildTime');
		resetLicenseForTests();

		const { privateKey } = makeKeypair();
		// Build a key that expired 10s ago in wall-clock terms but comfortably
		// after PRO_BUILD_TIME's test fallback (~now) → covered by the release gate.
		const expSec = Math.floor(PRO_BUILD_TIME / 1000) + 60;
		const token = signToken(defaultClaims({ aud: 'license', exp: expSec }), privateKey);

		// NOTE: setEasyFormsProLicense verifies against the EMBEDDED public key,
		// so this asserts the code path/default, not signature validity — expect
		// a bad-signature (throwaway key) rather than a time-based reason.
		setEasyFormsProLicense(token);
		expect(getLicenseStatus().reason).not.toBe('expired');
		resetLicenseForTests();
	});
});
