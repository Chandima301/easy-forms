import { render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/license/setEasyFormsProLicense', () => ({
	getLicenseStatus: vi.fn(),
}));

import { ProWatermark } from '../src/components/ProWatermark';
import { useProLicense } from '../src/hooks/useProLicense';
import { resetWarningsForTests } from '../src/license/assertLicensed';
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

describe('ProWatermark', () => {
	it('renders the unlicensed badge in development', () => {
		statusMock.mockReturnValue(invalidStatus);
		render(<ProWatermark />);
		expect(screen.getByText(/unlicensed/i)).toBeInTheDocument();
	});

	it('renders nothing when licensed', () => {
		statusMock.mockReturnValue(validStatus);
		const { container } = render(<ProWatermark />);
		expect(container).toBeEmptyDOMElement();
	});

	it('renders nothing in production even when unlicensed', () => {
		process.env.NODE_ENV = 'production';
		statusMock.mockReturnValue(invalidStatus);
		const { container } = render(<ProWatermark />);
		expect(container).toBeEmptyDOMElement();
	});
});
