import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/license/setEasyFormsProLicense', () => ({ getLicenseStatus: vi.fn() }));

import { registerProUsage, resetProUsageForTests, syncProWatermark } from '../src/license/proUsage';
import { getLicenseStatus } from '../src/license/setEasyFormsProLicense';

const statusMock = vi.mocked(getLicenseStatus);
const unlicensed = { valid: false as const, reason: 'missing' as const };
const licensed = {
	valid: true as const,
	claims: { customer: 'Acme', edition: 'pro' as const, seats: 1, iat: 0, exp: 9e9 },
};

function badgeCount(): number {
	return document.querySelectorAll('[data-easy-forms-pro-watermark]').length;
}

beforeEach(() => {
	statusMock.mockReset();
	resetProUsageForTests();
	document.body.innerHTML = '';
});
afterEach(() => {
	resetProUsageForTests();
});

describe('proUsage', () => {
	it('injects one badge when used + unlicensed, removes it on cleanup', () => {
		statusMock.mockReturnValue(unlicensed);
		const off = registerProUsage();
		expect(badgeCount()).toBe(1);
		off();
		expect(badgeCount()).toBe(0);
	});

	it('shows a single badge for concurrent usages, held until the last cleanup', () => {
		statusMock.mockReturnValue(unlicensed);
		const a = registerProUsage();
		const b = registerProUsage();
		expect(badgeCount()).toBe(1);
		a();
		expect(badgeCount()).toBe(1);
		b();
		expect(badgeCount()).toBe(0);
	});

	it('shows no badge when licensed', () => {
		statusMock.mockReturnValue(licensed);
		const off = registerProUsage();
		expect(badgeCount()).toBe(0);
		off();
	});

	it('re-syncs on a license change while in use', () => {
		statusMock.mockReturnValue(unlicensed);
		const off = registerProUsage();
		expect(badgeCount()).toBe(1);
		statusMock.mockReturnValue(licensed);
		syncProWatermark();
		expect(badgeCount()).toBe(0);
		off();
	});
});
