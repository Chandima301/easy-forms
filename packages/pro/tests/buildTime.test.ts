import { describe, expect, it } from 'vitest';
import { PRO_BUILD_TIME } from '../src/license/buildTime';

describe('PRO_BUILD_TIME', () => {
	it('is a finite epoch-ms number', () => {
		expect(Number.isFinite(PRO_BUILD_TIME)).toBe(true);
		expect(PRO_BUILD_TIME).toBeGreaterThan(0);
	});

	it('falls back to ~now when the build global is not injected (dev/test)', () => {
		// vitest runs against src without tsup's define, so __EF_PRO_BUILD_TIME__
		// is absent and the module falls back to Date.now().
		expect(Math.abs(Date.now() - PRO_BUILD_TIME)).toBeLessThan(60_000);
	});
});
