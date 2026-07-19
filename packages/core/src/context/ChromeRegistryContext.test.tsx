import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { GroupRendererProps } from '../types/chrome';
import { ChromeRegistryContext, useChromeRegistry } from './ChromeRegistryContext';

function Probe() {
	const { GroupRenderer } = useChromeRegistry();
	return <GroupRenderer group={{ questions: [] }} />;
}

describe('useChromeRegistry', () => {
	it('throws a clear error when no provider is present', () => {
		expect(() => render(<Probe />)).toThrow(/ChromeRegistryContext missing/);
	});

	it('returns the provided chrome registry', () => {
		const StubGroup = (_p: GroupRendererProps) => <div>stub-group</div>;
		render(
			<ChromeRegistryContext.Provider value={{ GroupRenderer: StubGroup }}>
				<Probe />
			</ChromeRegistryContext.Provider>
		);
		expect(screen.getByText('stub-group')).toBeInTheDocument();
	});
});
