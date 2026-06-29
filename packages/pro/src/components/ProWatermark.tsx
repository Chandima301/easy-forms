import type { CSSProperties } from 'react';
import { getLicenseStatus } from '../license/setEasyFormsProLicense';

const isDev = (): boolean => process.env.NODE_ENV !== 'production';

const badgeStyle: CSSProperties = {
	position: 'fixed',
	bottom: 12,
	right: 12,
	zIndex: 2147483647,
	padding: '4px 10px',
	borderRadius: 6,
	fontFamily: 'ui-sans-serif, system-ui, sans-serif',
	fontSize: 12,
	fontWeight: 600,
	lineHeight: 1.4,
	color: '#fff',
	background: 'rgba(17, 24, 39, 0.9)',
	border: '1px solid rgba(255,255,255,0.15)',
	pointerEvents: 'none',
	userSelect: 'none',
};

/**
 * Dev-only "Pro — unlicensed" badge. Renders `null` in production and when a
 * valid license is present, so it is invisible to honest, licensed apps and to
 * every production build.
 */
export function ProWatermark(): JSX.Element | null {
	if (!isDev()) return null;
	if (getLicenseStatus().valid) return null;

	return (
		<div style={badgeStyle} aria-hidden="true" data-easy-forms-pro-watermark="">
			easy-forms Pro — unlicensed
		</div>
	);
}
