// Playground — toggle between two demos:
//   "Plain"   — kitchen sink of every control + the 3 categorical dependency kinds
//   "Wizard"  — multi-step form with persistence + step-level visibility + logger plugin

import {
	Form,
	type CustomRendererProps,
	type FormSchema,
	loggerPlugin,
	type Option,
} from '@easy-forms/core';
import { shadcnRegistry } from '@easy-forms/shadcn';
import { useState } from 'react';

interface DemoFormData extends Record<string, unknown> {
	firstName: string;
	lastName: string;
	bio: string;
	subtotal: number | null;
	taxRate: number | null;
	total: number | null;
	email: string;
	plan: string | null;
	role: string | null;
	skills: string[];
	notifications: string[];
	birthDate: string | null;
	avatar: File[] | null;
	color: string;
	country: string | null;
	state: string | null;
	subscribe: boolean;
	receiveNewsletter: boolean;
	agreedToTerms: boolean;
}

function ColorSwatch({ value, onChange, disabled }: CustomRendererProps<string>) {
	const palette = ['#0f172a', '#dc2626', '#16a34a', '#2563eb', '#9333ea', '#f59e0b'];
	return (
		<div className="flex flex-wrap gap-2">
			{palette.map((hex) => (
				<button
					key={hex}
					type="button"
					disabled={disabled}
					aria-label={hex}
					aria-pressed={value === hex}
					onClick={() => onChange(hex)}
					className="h-8 w-8 rounded-full ring-offset-2 transition aria-pressed:ring-2 aria-pressed:ring-slate-900"
					style={{ backgroundColor: hex }}
				/>
			))}
		</div>
	);
}

const STATES_BY_COUNTRY: Record<string, Option[]> = {
	us: [
		{ value: 'ca', label: 'California' },
		{ value: 'ny', label: 'New York' },
		{ value: 'tx', label: 'Texas' },
	],
	lk: [
		{ value: 'wp', label: 'Western Province' },
		{ value: 'sp', label: 'Southern Province' },
	],
	gb: [
		{ value: 'eng', label: 'England' },
		{ value: 'sct', label: 'Scotland' },
	],
};

const schema: FormSchema<DemoFormData> = {
	title: 'Kitchen sink + dependencies',
	description: 'Every built-in control with propsDependsOn / valueDependsOn / resetDependsOn.',
	groups: [
		{
			title: 'Identity',
			layout: 'grid',
			gridCols: 2,
			questions: [
				{
					key: 'firstName',
					label: 'First name',
					control: 'text',
					placeholder: 'Ada',
					validators: { required: true, minLength: 2 },
				},
				{
					key: 'lastName',
					label: 'Last name',
					control: 'text',
					placeholder: 'Lovelace',
					validators: { required: true, minLength: 2 },
				},
			],
		},
		{
			title: 'Location',
			description: 'State options + placeholder come from a single `propsDependsOn` rule.',
			layout: 'grid',
			gridCols: 2,
			questions: [
				{
					key: 'country',
					label: 'Country',
					control: 'dropdown',
					placeholder: 'Pick a country',
					options: [
						{ value: 'us', label: 'United States' },
						{ value: 'lk', label: 'Sri Lanka' },
						{ value: 'gb', label: 'United Kingdom' },
					],
				},
				{
					key: 'state',
					label: 'State / Region',
					control: 'dropdown',
					options: [],
					dependents: {
						propsDependsOn: [
							{
								fieldNames: ['country'],
								compute: (v) => ({
									options: STATES_BY_COUNTRY[v.country as string] ?? [],
									disabled: !v.country,
									placeholder: v.country ? 'Pick a state' : 'Pick a country first',
								}),
							},
						],
					},
				},
			],
		},
		{
			title: 'Order',
			description: 'Total = subtotal × (1 + taxRate/100). Recomputes live, doesn’t flip isDirty.',
			layout: 'grid',
			gridCols: 3,
			questions: [
				{
					key: 'subtotal',
					label: 'Subtotal',
					control: 'number',
					prefix: '$',
					validators: { min: 0 },
				},
				{
					key: 'taxRate',
					label: 'Tax rate',
					control: 'number',
					suffix: '%',
					decimalScale: 2,
					validators: { min: 0, max: 100 },
				},
				{
					key: 'total',
					label: 'Total',
					control: 'number',
					prefix: '$',
					readOnly: true,
					dependents: {
						valueDependsOn: {
							fieldNames: ['subtotal', 'taxRate'],
							compute: (v) => {
								const sub = (v.subtotal as number | null) ?? 0;
								const rate = (v.taxRate as number | null) ?? 0;
								return Number((sub * (1 + rate / 100)).toFixed(2));
							},
						},
					},
				},
			],
		},
		{
			title: 'About',
			questions: [
				{
					key: 'bio',
					label: 'Bio',
					control: 'textarea',
					rows: 3,
					placeholder: 'A few sentences about yourself',
				},
				{ key: 'birthDate', label: 'Birth date', control: 'date' },
				{
					key: 'avatar',
					label: 'Avatar',
					control: 'file',
					accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
				},
			],
		},
		{
			title: 'Choices',
			layout: 'grid',
			gridCols: 2,
			questions: [
				{
					key: 'plan',
					label: 'Plan',
					control: 'dropdown',
					placeholder: 'Pick a plan',
					options: [
						{ value: 'free', label: 'Free' },
						{ value: 'pro', label: 'Pro ($9/mo)' },
						{ value: 'team', label: 'Team ($29/mo)' },
					],
				},
				{
					key: 'role',
					label: 'Primary role',
					control: 'radioGroup',
					options: [
						{ value: 'eng', label: 'Engineer' },
						{ value: 'des', label: 'Designer' },
						{ value: 'pm', label: 'Product manager' },
					],
				},
				{
					key: 'skills',
					label: 'Skills',
					control: 'multiselect',
					placeholder: 'Pick a few',
					enableSelectAll: true,
					options: [
						{ value: 'ts', label: 'TypeScript' },
						{ value: 'go', label: 'Go' },
						{ value: 'rs', label: 'Rust' },
						{ value: 'py', label: 'Python' },
						{ value: 'sql', label: 'SQL' },
					],
				},
				{
					key: 'notifications',
					label: 'Notifications',
					control: 'checkboxList',
					showSelectAll: true,
					options: [
						{ value: 'email', label: 'Email' },
						{ value: 'sms', label: 'SMS' },
						{ value: 'push', label: 'Push' },
					],
				},
			],
		},
		{
			title: 'Custom',
			questions: [
				{
					key: 'color',
					label: 'Theme color',
					control: 'custom',
					description: 'Renders through CustomRenderer + a user component.',
					component: ColorSwatch,
				},
			],
		},
		{
			title: 'Subscribe',
			questions: [
				{
					key: 'subscribe',
					label: 'Email',
					control: 'checkbox',
					checkboxLabel: 'I want emails about new features',
				},
				{
					key: 'email',
					label: 'Email address',
					control: 'email',
					placeholder: 'you@example.com',
					clearWhenHidden: true,
					dependents: {
						propsDependsOn: [
							{
								fieldNames: ['subscribe'],
								compute: (v) => ({
									hidden: v.subscribe !== true,
									required: v.subscribe === true,
								}),
							},
						],
					},
					validators: { email: true },
				},
			],
		},
		// Group-level visibility — the whole "Marketing preferences" section is
		// hidden when subscribe is false. Child state is preserved (CSS-hide).
		{
			id: 'marketing',
			title: 'Marketing preferences',
			dependents: {
				propsDependsOn: [
					{
						fieldNames: ['subscribe'],
						compute: (v) => ({ hidden: v.subscribe !== true }),
					},
				],
			},
			questions: [
				{
					key: 'receiveNewsletter',
					label: 'Weekly digest',
					control: 'checkbox',
					checkboxLabel: 'Send me a weekly digest',
				},
			],
		},
		{
			questions: [
				{
					key: 'agreedToTerms',
					label: 'Terms',
					control: 'checkbox',
					checkboxLabel: 'I agree to the terms of service',
					validators: {
						required: true,
						custom: (value) => (value ? null : 'You must agree to continue'),
					},
				},
			],
		},
	],
};

// --- Wizard demo schema --------------------------------------------------

interface WizardData extends Record<string, unknown> {
	firstName: string;
	lastName: string;
	addressLine1: string;
	postalCode: string;
	needsShipping: boolean;
	shippingNotes: string;
	confirmEmail: string;
}

const wizardSchema: FormSchema<WizardData> = {
	title: 'Multi-step demo',
	description:
		'Per-step validation + resumable state. Type something, click Next, refresh — state restores.',
	groups: [],
	wizard: {
		persistKey: 'easy-forms-playground-wizard',
		steps: [
			{
				id: 'identity',
				title: 'Identity',
				groups: [
					{
						layout: 'grid',
						gridCols: 2,
						questions: [
							{
								key: 'firstName',
								label: 'First name',
								control: 'text',
								validators: { required: true, minLength: 2 },
							},
							{
								key: 'lastName',
								label: 'Last name',
								control: 'text',
								validators: { required: true, minLength: 2 },
							},
						],
					},
				],
			},
			{
				id: 'address',
				title: 'Address',
				groups: [
					{
						questions: [
							{
								key: 'addressLine1',
								label: 'Address line 1',
								control: 'text',
								validators: { required: true },
							},
							{
								key: 'postalCode',
								label: 'Postal code',
								control: 'text',
								validators: { required: true, pattern: /^[A-Z0-9 -]{3,10}$/i },
							},
							{
								key: 'needsShipping',
								label: 'Shipping',
								control: 'checkbox',
								checkboxLabel: 'I need expedited shipping',
							},
						],
					},
				],
			},
			{
				// Step-level visibility via propsDependsOn — only shown when needsShipping is true.
				id: 'shipping',
				title: 'Shipping notes',
				dependents: {
					propsDependsOn: [
						{
							fieldNames: ['needsShipping'],
							compute: (v) => ({ hidden: v.needsShipping !== true }),
						},
					],
				},
				groups: [
					{
						questions: [
							{ key: 'shippingNotes', label: 'Notes', control: 'textarea', rows: 3 },
						],
					},
				],
			},
			{
				id: 'review',
				title: 'Review',
				groups: [
					{
						questions: [
							{
								key: 'confirmEmail',
								label: 'Confirm email',
								control: 'email',
								validators: { required: true, email: true },
							},
						],
					},
				],
			},
		],
	},
};

type Mode = 'plain' | 'wizard';

export function App() {
	const [mode, setMode] = useState<Mode>('plain');
	const [submitted, setSubmitted] = useState<unknown>(null);

	return (
		<main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
			<header className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold">easy-forms playground</h1>
				<p className="text-sm text-slate-500">
					Plain form (all controls + the 3 dep kinds) vs. wizard (multi-step + persistence).
				</p>
				<div className="flex gap-2 self-start">
					{(['plain', 'wizard'] as const).map((m) => (
						<button
							key={m}
							type="button"
							onClick={() => {
								setMode(m);
								setSubmitted(null);
							}}
							className={
								m === mode
									? 'rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white'
									: 'rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50'
							}
						>
							{m === 'plain' ? 'Plain form' : 'Wizard form'}
						</button>
					))}
				</div>
			</header>
			{mode === 'plain' ? (
				<Form<DemoFormData>
					schema={schema}
					registry={shadcnRegistry}
					plugins={[loggerPlugin({ prefix: '[plain]' })]}
					initialValues={{
						firstName: '',
						lastName: '',
						bio: '',
						subtotal: 100,
						taxRate: 10,
						total: 0,
						email: '',
						plan: null,
						role: null,
						skills: [],
						notifications: [],
						birthDate: null,
						avatar: null,
						color: '#0f172a',
						country: null,
						state: null,
						subscribe: false,
						receiveNewsletter: false,
						agreedToTerms: false,
					}}
					showReset
					onSubmit={async (values) => setSubmitted(values)}
				/>
			) : (
				<Form<WizardData>
					schema={wizardSchema}
					registry={shadcnRegistry}
					plugins={[loggerPlugin({ prefix: '[wizard]' })]}
					initialValues={{
						firstName: '',
						lastName: '',
						addressLine1: '',
						postalCode: '',
						needsShipping: false,
						shippingNotes: '',
						confirmEmail: '',
					}}
					onSubmit={async (values) => setSubmitted(values)}
				/>
			)}
			{submitted ? (
				<section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
					<h2 className="text-sm font-semibold text-emerald-900">Last submission</h2>
					<pre className="mt-2 overflow-auto text-xs text-emerald-900">
						{JSON.stringify(
							submitted,
							(_k, v) => (v instanceof File ? `[File: ${v.name}]` : v),
							2
						)}
					</pre>
				</section>
			) : null}
		</main>
	);
}
