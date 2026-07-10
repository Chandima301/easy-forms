import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/license/setEasyFormsProLicense', () => ({
	getLicenseStatus: vi.fn(),
}));

import { assertLicensed, resetWarningsForTests } from '../src/license/assertLicensed';
import { getLicenseStatus } from '../src/license/setEasyFormsProLicense';

const statusMock = vi.mocked(getLicenseStatus);
const ORIGINAL_ENV = process.env.NODE_ENV;

const validStatus = {
	valid: true as const,
	claims: { customer: 'Acme', edition: 'pro' as const, seats: 1, iat: 0, exp: 9e9 },
};

describe('assertLicensed', () => {
	beforeEach(() => {
		resetWarningsForTests();
		statusMock.mockReset();
		vi.restoreAllMocks();
		process.env.NODE_ENV = 'development';
	});

	afterEach(() => {
		process.env.NODE_ENV = ORIGINAL_ENV;
	});

	it('returns true and never warns when licensed', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		statusMock.mockReturnValue(validStatus);

		expect(assertLicensed('repeatingGroup')).toBe(true);
		expect(warn).not.toHaveBeenCalled();
	});

	it('warns exactly once per feature in development when unlicensed', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		statusMock.mockReturnValue({ valid: false, reason: 'missing' });

		expect(assertLicensed('repeatingGroup')).toBe(false);
		expect(assertLicensed('repeatingGroup')).toBe(false);
		expect(warn).toHaveBeenCalledTimes(1);

		// A different feature warns separately.
		assertLicensed('branchingWizard');
		expect(warn).toHaveBeenCalledTimes(2);
	});

	it('warns once per feature in production and reports unlicensed', () => {
		process.env.NODE_ENV = 'production';
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		statusMock.mockReturnValue({ valid: false, reason: 'expired' });

		expect(assertLicensed('repeatingGroup')).toBe(false);
		expect(assertLicensed('repeatingGroup')).toBe(false);
		expect(warn).toHaveBeenCalledTimes(1);
	});
});
