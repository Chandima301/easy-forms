// Contact form endpoint.
//
// No verified sending domain exists yet, so `from` uses Resend's shared
// onboarding sender, which may only deliver to the account owner's own address —
// exactly the direction a contact form sends. Swap `from` for a real address once
// a domain is bought. The recipient lives in CONTACT_TO_EMAIL and is never
// committed.
//
// With RESEND_API_KEY unset the route reports 503 and the page shows its
// fallback, so local dev and preview deploys stay green.
import { validateContactSubmission } from '@/lib/contactValidation';
import { NextResponse } from 'next/server';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const FROM = 'Easy Forms <onboarding@resend.dev>';

export async function POST(request: Request) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: 'Malformed request body.' }, { status: 400 });
	}

	const result = validateContactSubmission(body);

	// Spam: answer 202 so a bot cannot distinguish rejection from acceptance.
	if (!result.ok && result.status === 202) {
		return NextResponse.json({ ok: true }, { status: 202 });
	}
	if (!result.ok) {
		return NextResponse.json({ errors: result.errors }, { status: 400 });
	}

	const apiKey = process.env.RESEND_API_KEY;
	const to = process.env.CONTACT_TO_EMAIL;
	if (!apiKey || !to) {
		return NextResponse.json(
			{ error: 'Email delivery is not configured in this environment.' },
			{ status: 503 }
		);
	}

	const { name, email, company, reason, seats, timeline, message } = result.value;
	const lines = [
		`Name: ${name}`,
		`Email: ${email}`,
		company ? `Company: ${company}` : null,
		`Reason: ${reason}`,
		seats !== undefined ? `Seats: ${seats}` : null,
		timeline ? `Timeline: ${timeline}` : null,
		'',
		message,
	].filter((line): line is string => line !== null);

	const response = await fetch(RESEND_ENDPOINT, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: FROM,
			to: [to],
			reply_to: email,
			subject: `[easy-forms] ${reason} — ${name}`,
			text: lines.join('\n'),
		}),
	});

	if (!response.ok) {
		return NextResponse.json({ error: 'Could not send your message.' }, { status: 502 });
	}

	return NextResponse.json({ ok: true });
}
