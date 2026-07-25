// Central "Pro is in use" signal + the single unlicensed watermark badge.
//
// Every Pro feature hook calls useProLicense(), which registers usage here on
// mount. While at least one Pro feature is mounted AND the app is unlicensed, a
// single fixed-position badge is injected into document.body. This lives entirely
// in published pro code (no React provider), so an ejected renderer cannot remove
// it, and it de-dupes across N features/rows via a simple mount counter.
import { getLicenseStatus } from './setEasyFormsProLicense';

let activeCount = 0;
let badgeEl: HTMLElement | null = null;

function makeBadge(): HTMLElement {
	const el = document.createElement('div');
	el.setAttribute('data-easy-forms-pro-watermark', '');
	el.setAttribute('aria-hidden', 'true');
	el.textContent = 'easy-forms Pro — unlicensed';
	Object.assign(el.style, {
		position: 'fixed',
		bottom: '12px',
		right: '12px',
		zIndex: '2147483647',
		padding: '4px 10px',
		borderRadius: '6px',
		fontFamily: 'ui-sans-serif, system-ui, sans-serif',
		fontSize: '12px',
		fontWeight: '600',
		lineHeight: '1.4',
		color: '#fff',
		background: 'rgba(17, 24, 39, 0.9)',
		border: '1px solid rgba(255,255,255,0.15)',
		pointerEvents: 'none',
		userSelect: 'none',
	});
	return el;
}

function sync(): void {
	if (typeof document === 'undefined' || !document.body) return;
	const shouldShow = activeCount > 0 && !getLicenseStatus().valid;
	if (shouldShow && !badgeEl) {
		badgeEl = makeBadge();
		document.body.appendChild(badgeEl);
	} else if (!shouldShow && badgeEl) {
		badgeEl.remove();
		badgeEl = null;
	}
}

/**
 * Register a mounted Pro feature. Increments the usage count and syncs the badge;
 * the returned cleanup decrements and re-syncs. Count-based, so concurrent
 * features, repeating rows, and StrictMode's double-invoke all resolve to one badge.
 */
export function registerProUsage(): () => void {
	activeCount += 1;
	sync();
	return () => {
		activeCount = Math.max(0, activeCount - 1);
		sync();
	};
}

/** Re-evaluate the badge — call after the cached license status changes. */
export function syncProWatermark(): void {
	sync();
}

/** Test-only: force the usage count to zero and remove the badge. */
export function resetProUsageForTests(): void {
	activeCount = 0;
	sync();
}
