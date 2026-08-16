import { describe, expect, it } from 'vitest';
import { MIN_FILL_MS, validateContactSubmission } from './contactValidation';

function valid(overrides: Record<string, unknown> = {}) {
	return {
		name: 'Ada Lovelace',
		email: 'ada@acme.com',
		company: 'Acme',
		reason: 'sales',
		seats: 25,
		timeline: 'quarter',
		message: 'We need repeating groups for our invoicing flow.',
		hp: '',
		elapsedMs: MIN_FILL_MS + 1000,
		...overrides,
	};
}

describe('validateContactSubmission', () => {
	it('accepts a well-formed submission', () => {
		expect(validateContactSubmission(valid()).ok).toBe(true);
	});

	it('rejects a missing name', () => {
		expect(validateContactSubmission(valid({ name: '  ' }))).toEqual({
			ok: false,
			status: 400,
			errors: { name: 'Name is required.' },
		});
	});

	it('rejects a malformed email', () => {
		const result = validateContactSubmission(valid({ email: 'not-an-email' }));
		expect(result.ok).toBe(false);
		if (!result.ok && result.status === 400) expect(result.errors.email).toMatch(/valid email/i);
	});

	it('rejects a message shorter than 10 characters', () => {
		const result = validateContactSubmission(valid({ message: 'hi' }));
		expect(result.ok).toBe(false);
		if (!result.ok && result.status === 400) expect(result.errors.message).toMatch(/10 characters/);
	});

	it('rejects an unknown reason', () => {
		const result = validateContactSubmission(valid({ reason: 'anything' }));
		expect(result.ok).toBe(false);
		if (!result.ok && result.status === 400) expect(result.errors.reason).toBeDefined();
	});

	it('reports every invalid field at once', () => {
		const result = validateContactSubmission(valid({ name: '', email: 'x', message: '' }));
		expect(result.ok).toBe(false);
		if (!result.ok && result.status === 400) {
			expect(Object.keys(result.errors).sort()).toEqual(['email', 'message', 'name']);
		}
	});

	it('silently accepts a filled honeypot as spam', () => {
		expect(validateContactSubmission(valid({ hp: 'http://spam.example' }))).toEqual({
			ok: false,
			status: 202,
			spam: true,
		});
	});

	it('treats an instant submission as spam', () => {
		expect(validateContactSubmission(valid({ elapsedMs: 200 }))).toEqual({
			ok: false,
			status: 202,
			spam: true,
		});
	});

	it('trims whitespace off accepted values', () => {
		const result = validateContactSubmission(valid({ name: '  Ada  ', email: ' ada@acme.com ' }));
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.name).toBe('Ada');
			expect(result.value.email).toBe('ada@acme.com');
		}
	});

	it('drops seats and timeline when the reason is not sales', () => {
		const result = validateContactSubmission(valid({ reason: 'support' }));
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.seats).toBeUndefined();
			expect(result.value.timeline).toBeUndefined();
		}
	});

	it('keeps seats and timeline for a sales enquiry', () => {
		const result = validateContactSubmission(valid());
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.seats).toBe(25);
			expect(result.value.timeline).toBe('quarter');
		}
	});

	it('omits an empty company rather than sending a blank string', () => {
		const result = validateContactSubmission(valid({ company: '   ' }));
		expect(result.ok).toBe(true);
		if (result.ok) expect('company' in result.value).toBe(false);
	});

	it('checks spam before field validity, so a bot learns nothing from the response', () => {
		const result = validateContactSubmission(valid({ hp: 'x', name: '', email: 'bad' }));
		expect(result).toEqual({ ok: false, status: 202, spam: true });
	});

	it('rejects a non-object body without throwing', () => {
		for (const body of [null, undefined, 'string', 42]) {
			const result = validateContactSubmission(body);
			expect(result.ok).toBe(false);
		}
	});
});
