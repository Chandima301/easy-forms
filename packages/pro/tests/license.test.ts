import { beforeEach, describe, expect, it, vi } from 'vitest';

// The singleton's job is to cache whatever verifyLicense returns; verifyLicense
// itself is covered in verify.test.ts, so we mock it here.
vi.mock('../src/license/verify', () => ({ verifyLicense: vi.fn() }));

import {
	getLicenseStatus,
	resetLicenseForTests,
	setEasyFormsProLicense,
} from '../src/license/setEasyFormsProLicense';
import type { LicenseClaims } from '../src/license/types';
import { verifyLicense } from '../src/license/verify';

const verifyMock = vi.mocked(verifyLicense);

const claims: LicenseClaims = {
	customer: 'Acme Inc',
	edition: 'pro',
	seats: 5,
	iat: 0,
	exp: 2_000_000_000,
};

describe('setEasyFormsProLicense singleton', () => {
	beforeEach(() => {
		resetLicenseForTests();
		verifyMock.mockReset();
	});

	it('defaults to missing before any key is set', () => {
		expect(getLicenseStatus()).toEqual({ valid: false, reason: 'missing' });
	});

	it('caches a valid status after setting a good key', () => {
		verifyMock.mockReturnValue({ valid: true, claims });
		setEasyFormsProLicense('good-token');

		expect(verifyMock).toHaveBeenCalledWith('good-token');
		expect(getLicenseStatus()).toEqual({ valid: true, claims });
	});

	it('caches an invalid status after setting a bad key', () => {
		verifyMock.mockReturnValue({ valid: false, reason: 'bad-signature' });
		setEasyFormsProLicense('bad-token');

		expect(getLicenseStatus()).toEqual({ valid: false, reason: 'bad-signature' });
	});

	it('is idempotent — re-setting replaces the cached status', () => {
		verifyMock.mockReturnValueOnce({ valid: true, claims });
		setEasyFormsProLicense('good');
		expect(getLicenseStatus().valid).toBe(true);

		verifyMock.mockReturnValueOnce({ valid: false, reason: 'expired' });
		setEasyFormsProLicense('expired');
		expect(getLicenseStatus()).toEqual({ valid: false, reason: 'expired' });
	});
});
