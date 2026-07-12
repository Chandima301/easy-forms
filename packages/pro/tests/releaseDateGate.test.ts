import { describe, expect, it, vi } from 'vitest';
import { verifyLicense } from '../src/license/verify';
import { verifyRegistryToken } from '../src/license/verifyRegistryToken';
import { defaultClaims, makeKeypair, signToken } from './signToken';

// Pin PRO_BUILD_TIME to a fixed PAST date so we can prove verifyLicense defaults
// its comparison to the build date, not wall-clock now (which are indistinguishable
// otherwise, since the unbuilt fallback is Date.now()).
const { MOCK_BUILD } = vi.hoisted(() => ({
	MOCK_BUILD: Date.parse('2020-06-01T00:00:00.000Z'),
}));
vi.mock('../src/license/buildTime', () => ({ PRO_BUILD_TIME: MOCK_BUILD }));

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

	it('defaults the comparison timestamp to PRO_BUILD_TIME, not wall-clock now', () => {
		const { privateKey, publicKey } = makeKeypair();
		// exp is one year AFTER the mocked build date (2021) but years BEFORE real
		// wall-clock now — so under wall-clock this key would be "expired", but under
		// the release-date gate (build date 2020) it is covered.
		const expSec = Math.floor(MOCK_BUILD / 1000) + 60 * 60 * 24 * 365;
		const token = signToken(defaultClaims({ aud: 'license', exp: expSec }), privateKey);

		// No `now` arg → uses the PRO_BUILD_TIME default. valid proves the default
		// is the build date; if it were Date.now() this would be 'expired'.
		expect(verifyLicense(token, publicKey).valid).toBe(true);
	});
});
