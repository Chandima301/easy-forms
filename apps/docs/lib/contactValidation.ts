// Server-side validation for the contact form. The client schema is UX; this is
// the trust boundary, so every field is re-checked here.
//
// Spam handling is deliberately cheap: a honeypot field plus a minimum fill time.
// Both are client-reported and therefore defeatable — the point is to drop the
// high-volume bots without a CAPTCHA or a third party. Spam is answered 202, not
// 400, so a bot cannot tell rejection from acceptance.

/** Submissions faster than this are treated as automated. */
export const MIN_FILL_MS = 2500;

export const CONTACT_REASONS = ['sales', 'support', 'bug', 'security', 'other'] as const;
export type ContactReason = (typeof CONTACT_REASONS)[number];

export interface ContactSubmission {
	name: string;
	email: string;
	company?: string;
	reason: ContactReason;
	seats?: number;
	timeline?: string;
	message: string;
}

export type ContactValidationResult =
	| { ok: true; value: ContactSubmission }
	| { ok: false; status: 202; spam: true }
	| { ok: false; status: 400; errors: Record<string, string> };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

export function validateContactSubmission(input: unknown): ContactValidationResult {
	const body: Record<string, unknown> =
		typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {};

	// Spam checks run before field validation so a bot's response is identical
	// whether or not the rest of its payload was well-formed.
	if (str(body.hp) !== '') return { ok: false, status: 202, spam: true };
	const elapsed = typeof body.elapsedMs === 'number' ? body.elapsedMs : 0;
	if (elapsed < MIN_FILL_MS) return { ok: false, status: 202, spam: true };

	const name = str(body.name);
	const email = str(body.email);
	const company = str(body.company);
	const message = str(body.message);
	const reason = str(body.reason);

	const errors: Record<string, string> = {};
	if (name === '') errors.name = 'Name is required.';
	if (email === '') errors.email = 'Email is required.';
	else if (!EMAIL.test(email)) errors.email = 'Enter a valid email address.';
	if (message.length < 10) errors.message = 'Please write at least 10 characters.';
	if (!CONTACT_REASONS.includes(reason as ContactReason)) {
		errors.reason = 'Choose a reason for getting in touch.';
	}

	if (Object.keys(errors).length > 0) return { ok: false, status: 400, errors };

	const isSales = reason === 'sales';
	const seats =
		typeof body.seats === 'number' && Number.isFinite(body.seats) ? body.seats : undefined;
	const timeline = str(body.timeline);

	return {
		ok: true,
		value: {
			name,
			email,
			reason: reason as ContactReason,
			message,
			...(company === '' ? {} : { company }),
			...(isSales && seats !== undefined ? { seats } : {}),
			...(isSales && timeline !== '' ? { timeline } : {}),
		},
	};
}
