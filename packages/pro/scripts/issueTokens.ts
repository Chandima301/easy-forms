// Pure issuance core for `license:issue`. No process/argv/console side effects —
// imported by scripts/issue.ts (the CLI) and by tests. Mints the license +
// registry token pair for one customer with a single shared identity.
import type { LicenseClaims } from '../src/license/types';
import { buildToken } from './signToken';

/** The live authenticated registry endpoint (Phase 3). */
export const REGISTRY_URL = 'https://easy-forms-pro-registry.easyforms.workers.dev/r/{name}.json';

export interface ExpiryInput {
	/** Term length in whole months from `now`. Mutually exclusive with expIso. */
	months?: number;
	/** Explicit license expiry as an ISO date. Overrides months. */
	expIso?: string;
	/** Extra days the REGISTRY token stays valid past the license exp. Default 0. */
	registryGraceDays?: number;
	/** Basis time in ms. Default Date.now(). */
	now?: number;
}

export interface ResolvedExpiry {
	iatSec: number;
	licenseExpSec: number;
	registryExpSec: number;
}

export function resolveExpiry(input: ExpiryInput): ResolvedExpiry {
	const nowMs = input.now ?? Date.now();
	const iatSec = Math.floor(nowMs / 1000);

	let licenseExpMs: number;
	if (input.expIso !== undefined) {
		const parsed = Date.parse(input.expIso);
		if (Number.isNaN(parsed)) throw new Error(`--exp "${input.expIso}" is not a valid date`);
		licenseExpMs = parsed;
	} else if (input.months !== undefined) {
		if (!Number.isInteger(input.months) || input.months < 1) {
			throw new Error('--months must be a positive integer');
		}
		const d = new Date(nowMs);
		d.setUTCMonth(d.getUTCMonth() + input.months);
		licenseExpMs = d.getTime();
	} else {
		throw new Error('provide --months <n> or --exp <ISO date>');
	}

	const graceDays = input.registryGraceDays ?? 0;
	const registryExpMs = licenseExpMs + graceDays * 24 * 60 * 60 * 1000;

	return {
		iatSec,
		licenseExpSec: Math.floor(licenseExpMs / 1000),
		registryExpSec: Math.floor(registryExpMs / 1000),
	};
}

export interface IssueInput {
	customer: string;
	seats: number;
	iatSec: number;
	licenseExpSec: number;
	registryExpSec: number;
}

export interface IssuedTokens {
	licenseToken: string;
	registryToken: string;
	licenseClaims: LicenseClaims;
	registryClaims: LicenseClaims;
	email: string;
}

export function buildIssuedTokens(input: IssueInput, privateKeyB64: string): IssuedTokens {
	const base = {
		customer: input.customer,
		edition: 'pro' as const,
		seats: input.seats,
		iat: input.iatSec,
	};
	const licenseClaims: LicenseClaims = { ...base, exp: input.licenseExpSec, aud: 'license' };
	const registryClaims: LicenseClaims = { ...base, exp: input.registryExpSec, aud: 'registry' };

	const licenseToken = buildToken(licenseClaims, privateKeyB64);
	const registryToken = buildToken(registryClaims, privateKeyB64);

	const email = renderDeliveryEmail({
		customer: input.customer,
		seats: input.seats,
		licenseToken,
		registryToken,
	});

	return { licenseToken, registryToken, licenseClaims, registryClaims, email };
}

function renderDeliveryEmail(v: {
	customer: string;
	seats: number;
	licenseToken: string;
	registryToken: string;
}): string {
	return `Subject: Your Easy Forms Pro license (${v.customer})

Hi,

Thanks for purchasing Easy Forms Pro (${v.seats} seat(s)). Here are your two tokens.

1) Engine license key — clears the Pro watermark at runtime.
   Set it once, as early as possible in your app:

     import { setEasyFormsProLicense } from '@easy-forms/pro';
     setEasyFormsProLicense('${v.licenseToken}');

2) Registry token — lets you install the premium renderers.
   Add this to your components.json, then run the shadcn add commands:

     {
       "registries": {
         "@ef-pro": {
           "url": "${REGISTRY_URL}",
           "headers": { "Authorization": "Bearer ${v.registryToken}" }
         }
       }
     }

     npx shadcn add @ef-pro/repeating-group
     npx shadcn add @ef-pro/advanced-wizard

Keep both tokens private. On renewal we'll send fresh tokens.

— Easy Forms
`;
}
