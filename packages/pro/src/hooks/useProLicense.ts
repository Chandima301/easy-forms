import { useEffect, useState } from 'react';
import { assertLicensed } from '../license/assertLicensed';
import { registerProUsage } from '../license/proUsage';
import { getLicenseStatus } from '../license/setEasyFormsProLicense';
import type { LicenseStatus } from '../license/types';

export interface UseProLicenseResult {
	/** Whether a valid license is present. */
	licensed: boolean;
	/** The full cached license status (claims when valid, reason when not). */
	status: LicenseStatus;
}

/**
 * Hook for Pro feature renderers. Runs the soft `assertLicensed` gate on mount
 * (firing the one-time dev warning), registers Pro usage for the centralized
 * unlicensed-dev watermark (`registerProUsage`), and returns the current
 * license status.
 */
export function useProLicense(feature: string): UseProLicenseResult {
	const [licensed, setLicensed] = useState(false);

	useEffect(() => {
		setLicensed(assertLicensed(feature));
		return registerProUsage();
	}, [feature]);

	return { licensed, status: getLicenseStatus() };
}
