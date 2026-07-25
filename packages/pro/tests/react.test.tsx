import { render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/license/setEasyFormsProLicense', () => ({
	getLicenseStatus: vi.fn(),
}));

import { useProLicense } from '../src/hooks/useProLicense';
import { resetWarningsForTests } from '../src/license/assertLicensed';
import { resetProUsageForTests } from '../src/license/proUsage';
import { getLicenseStatus } from '../src/license/setEasyFormsProLicense';

const statusMock = vi.mocked(getLicenseStatus);
const ORIGINAL_ENV = process.env.NODE_ENV;

const validStatus = {
	valid: true as const,
	claims: { customer: 'Acme', edition: 'pro' as const, seats: 1, iat: 0, exp: 9e9 },
};
const invalidStatus = { valid: false as const, reason: 'missing' as const };

beforeEach(() => {
	resetWarningsForTests();
	statusMock.mockReset();
	vi.spyOn(console, 'warn').mockImplementation(() => {});
	process.env.NODE_ENV = 'development';
	resetProUsageForTests();
	document.body.innerHTML = '';
});

afterEach(() => {
	process.env.NODE_ENV = ORIGINAL_ENV;
	vi.restoreAllMocks();
});

describe('useProLicense', () => {
	it('reports licensed=true with the status when valid', () => {
		statusMock.mockReturnValue(validStatus);
		const { result } = renderHook(() => useProLicense('repeatingGroup'));

		expect(result.current.licensed).toBe(true);
		expect(result.current.status).toEqual(validStatus);
	});

	it('reports licensed=false when unlicensed', () => {
		statusMock.mockReturnValue(invalidStatus);
		const { result } = renderHook(() => useProLicense('repeatingGroup'));

		expect(result.current.licensed).toBe(false);
		expect(result.current.status).toEqual(invalidStatus);
	});
});

function Consumer() {
	useProLicense('repeatingGroup');
	return null;
}

function badgeCount(): number {
	return document.querySelectorAll('[data-easy-forms-pro-watermark]').length;
}

describe('watermark via useProLicense', () => {
	it('injects the unlicensed badge while a Pro feature is mounted', () => {
		statusMock.mockReturnValue(invalidStatus);
		const { unmount } = render(<Consumer />);
		expect(badgeCount()).toBe(1);
		unmount();
		expect(badgeCount()).toBe(0);
	});

	it('shows no badge when licensed', () => {
		statusMock.mockReturnValue(validStatus);
		const { unmount } = render(<Consumer />);
		expect(badgeCount()).toBe(0);
		unmount();
	});
});
