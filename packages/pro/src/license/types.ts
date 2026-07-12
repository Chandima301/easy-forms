// License token shape and verification result types.

/** Pro edition tier. Single tier for now; reserved for future tiers. */
export type ProEdition = 'pro';

/** Which surface a token is minted for. Absent on legacy tokens → 'license'. */
export type TokenAudience = 'license' | 'registry';

/**
 * Claims carried by a license token. The token is NOT secret — the customer can
 * read these — it is signed (not encrypted) so the claims are tamper-evident.
 */
export interface LicenseClaims {
	/** Licensee name / organization, for display and support. */
	customer: string;
	/** Edition tier this key unlocks. */
	edition: ProEdition;
	/** Contracted developer seats (honor-based; not enforced by the gate). */
	seats: number;
	/** Issued-at, seconds since the Unix epoch. */
	iat: number;
	/** Expiry, seconds since the Unix epoch. */
	exp: number;
	/** Token audience. Absent on legacy tokens → treated as 'license'. */
	aud?: TokenAudience;
}

/** Result of verifying a license key. */
export type LicenseStatus =
	| { valid: true; claims: LicenseClaims }
	| { valid: false; reason: LicenseInvalidReason };

/** Why a license key failed verification. */
export type LicenseInvalidReason =
	| 'missing'
	| 'malformed'
	| 'bad-signature'
	| 'expired'
	| 'wrong-audience';
