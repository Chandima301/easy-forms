'use client';

import { EasyForm } from '@/components/easy-forms/easy-form';
import type { FormSchema } from '@easy-forms/core';
import { useRef, useState } from 'react';

const schema: FormSchema = {
	groups: [
		{
			layout: 'grid',
			gridCols: 2,
			questions: [
				{
					key: 'name',
					label: 'Name',
					control: 'text',
					placeholder: 'Ada Lovelace',
					validators: { required: true },
				},
				{
					key: 'email',
					label: 'Work email',
					control: 'email',
					placeholder: 'ada@acme.com',
					validators: { required: true, email: true },
				},
				{ key: 'company', label: 'Company', control: 'text', placeholder: 'Acme Inc' },
				{
					key: 'reason',
					label: 'Reason',
					control: 'dropdown',
					placeholder: 'What brings you here?',
					options: [
						{ value: 'sales', label: 'Sales & Enterprise' },
						{ value: 'support', label: 'Technical support' },
						{ value: 'bug', label: 'Report a bug' },
						{ value: 'security', label: 'Security disclosure' },
						{ value: 'other', label: 'Something else' },
					],
					validators: { required: true },
				},
			],
		},
		{
			// Dogfooding: these fields exist only for sales enquiries. This is the same
			// `propsDependsOn` the docs teach — if the dependency engine regresses, this
			// page shows it. A group using `dependents` needs a stable `id`.
			id: 'sales-detail',
			layout: 'grid',
			gridCols: 2,
			clearWhenHidden: true,
			dependents: {
				propsDependsOn: [
					{ fieldNames: ['reason'], compute: (v) => ({ hidden: v.reason !== 'sales' }) },
				],
			},
			questions: [
				{ key: 'seats', label: 'Seats needed', control: 'number', validators: { min: 1 } },
				{
					key: 'timeline',
					label: 'Timeline',
					control: 'dropdown',
					placeholder: 'When are you looking to start?',
					options: [
						{ value: 'quarter', label: 'This quarter' },
						{ value: 'half', label: 'Next 6 months' },
						{ value: 'exploring', label: 'Just exploring' },
					],
				},
			],
		},
		{
			questions: [
				{
					key: 'message',
					label: 'Message',
					control: 'textarea',
					rows: 5,
					placeholder: 'How can we help?',
					validators: { required: true, minLength: 10 },
				},
			],
		},
	],
};

const initialValues = {
	name: '',
	email: '',
	company: '',
	reason: null,
	seats: null,
	timeline: null,
	message: '',
};

type Status = { kind: 'idle' } | { kind: 'sent' } | { kind: 'error'; message: string };

export function ContactForm() {
	const [status, setStatus] = useState<Status>({ kind: 'idle' });
	const honeypot = useRef<HTMLInputElement>(null);
	const mountedAt = useRef(Date.now());

	if (status.kind === 'sent') {
		return (
			<output className="block rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-sm">
				<p className="font-semibold text-emerald-600 dark:text-emerald-400">Message sent</p>
				<p className="mt-1.5 text-fd-muted-foreground">
					Thanks — a real person reads every message here. We reply to the address you gave us.
				</p>
			</output>
		);
	}

	return (
		<div>
			{/* Honeypot: hidden from people, tempting to bots. It sits outside EasyForm
			    because a hidden schema field would be dropped from getValues(). */}
			<input
				ref={honeypot}
				type="text"
				name="website"
				tabIndex={-1}
				autoComplete="off"
				aria-hidden="true"
				className="sr-only"
			/>

			{status.kind === 'error' ? (
				<div
					role="alert"
					className="mb-4 rounded-lg border border-red-500/30 bg-red-500/5 p-3.5 text-sm text-red-600 dark:text-red-400"
				>
					{status.message}
				</div>
			) : null}

			<EasyForm
				schema={schema}
				initialValues={initialValues}
				submitLabel="Send message"
				onSubmit={async (values) => {
					setStatus({ kind: 'idle' });
					try {
						const response = await fetch('/api/contact', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								...values,
								hp: honeypot.current?.value ?? '',
								elapsedMs: Date.now() - mountedAt.current,
							}),
						});
						if (response.ok || response.status === 202) {
							setStatus({ kind: 'sent' });
							return;
						}
						if (response.status === 503) {
							setStatus({
								kind: 'error',
								message:
									'Email delivery is not configured here yet. Please reach us on GitHub Discussions instead.',
							});
							return;
						}
						setStatus({
							kind: 'error',
							message: 'Something went wrong sending your message. Please try again.',
						});
					} catch {
						setStatus({
							kind: 'error',
							message: 'Could not reach the server. Check your connection and try again.',
						});
					}
				}}
			/>
		</div>
	);
}
