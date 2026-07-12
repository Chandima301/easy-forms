import { describe, expect, it } from 'vitest';
import { buildIssuedTokens, resolveExpiry } from '../scripts/issueTokens';
import { bytesToBase64url } from '../src/license/base64url';
import { ed } from '../src/license/ed25519';
import { verifyLicense } from '../src/license/verify';
import { verifyRegistryToken } from '../src/license/verifyRegistryToken';

function throwawayKey(): { privateB64: string; publicB64: string } {
	const priv = ed.utils.randomPrivateKey();
	return { privateB64: bytesToBase64url(priv), publicB64: bytesToBase64url(ed.getPublicKey(priv)) };
}

describe('resolveExpiry', () => {
	it('advances by whole months from now', () => {
		const now = Date.parse('2026-01-15T00:00:00.000Z');
		const r = resolveExpiry({ months: 12, now });
		expect(new Date(r.licenseExpSec * 1000).toISOString()).toBe('2027-01-15T00:00:00.000Z');
		expect(r.registryExpSec).toBe(r.licenseExpSec); // no grace by default
		expect(r.iatSec).toBe(Math.floor(now / 1000));
	});

	it('accepts an explicit --exp ISO date', () => {
		const now = Date.parse('2026-01-15T00:00:00.000Z');
		const r = resolveExpiry({ expIso: '2027-03-01', now });
		expect(new Date(r.licenseExpSec * 1000).toISOString()).toBe('2027-03-01T00:00:00.000Z');
	});

	it('adds registry grace days on top of the license exp', () => {
		const now = Date.parse('2026-01-15T00:00:00.000Z');
		const r = resolveExpiry({ months: 1, registryGraceDays: 7, now });
		expect(r.registryExpSec - r.licenseExpSec).toBe(7 * 24 * 60 * 60);
	});

	it('throws when neither months nor exp is given', () => {
		expect(() => resolveExpiry({ now: Date.now() })).toThrow(/--months|--exp/);
	});

	it('throws on an invalid --exp', () => {
		expect(() => resolveExpiry({ expIso: 'not-a-date', now: Date.now() })).toThrow(
			/not a valid date/
		);
	});
});

describe('buildIssuedTokens', () => {
	it('mints a license + registry pair with matching identity and correct audiences', () => {
		const { privateB64, publicB64 } = throwawayKey();
		const now = Date.parse('2026-01-15T00:00:00.000Z');
		const { licenseExpSec, registryExpSec, iatSec } = resolveExpiry({ months: 12, now });

		const out = buildIssuedTokens(
			{ customer: 'Acme Inc', seats: 5, iatSec, licenseExpSec, registryExpSec },
			privateB64
		);

		// License token: verifies under the release-date gate (build date <= exp).
		const lic = verifyLicense(out.licenseToken, publicB64, licenseExpSec * 1000 - 1000);
		expect(lic.valid).toBe(true);
		if (lic.valid) {
			expect(lic.claims).toMatchObject({
				customer: 'Acme Inc',
				seats: 5,
				edition: 'pro',
				aud: 'license',
			});
		}

		// Registry token: verifies wall-clock before its exp.
		const reg = verifyRegistryToken(out.registryToken, publicB64, registryExpSec * 1000 - 1000);
		expect(reg.valid).toBe(true);
		if (reg.valid) expect(reg.claims.aud).toBe('registry');

		// Audience split holds both ways.
		expect(verifyRegistryToken(out.licenseToken, publicB64).reason).toBe('wrong-audience');
		expect(verifyLicense(out.registryToken, publicB64, licenseExpSec * 1000 - 1000).reason).toBe(
			'wrong-audience'
		);
	});

	it('renders a delivery email containing both tokens and install wiring', () => {
		const { privateB64 } = throwawayKey();
		const now = Date.parse('2026-01-15T00:00:00.000Z');
		const { licenseExpSec, registryExpSec, iatSec } = resolveExpiry({ months: 12, now });
		const out = buildIssuedTokens(
			{ customer: 'Acme Inc', seats: 5, iatSec, licenseExpSec, registryExpSec },
			privateB64
		);

		expect(out.email).toContain(out.licenseToken);
		expect(out.email).toContain(out.registryToken);
		expect(out.email).toContain('setEasyFormsProLicense');
		expect(out.email).toContain('easy-forms-pro-registry.easyforms.workers.dev');
		expect(out.email).toContain('Acme Inc');
	});
});
