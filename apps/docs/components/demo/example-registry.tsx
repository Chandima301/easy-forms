'use client';

// Runtime source for the examples gallery mini-previews + detail demos. Each
// entry pairs the *live* schema object (functions and all) with a hand-authored
// `code` string for the Code tab. Because these schemas contain functions, the
// module is a client boundary. Display text (title/description/intro) lives in
// the server-safe `lib/examples-meta`; the two are tied by `slug`.

import type { FormSchema } from '@easy-forms/core';

export interface ExampleEntry {
	/** Lookup key; matches an entry in `lib/examples-meta`. */
	slug: string;
	schema: FormSchema;
	initialValues: Record<string, unknown>;
	/** Hide the Reset button (derived-value demos that start computed). */
	showReset?: boolean;
	/** Source shown in the Code tab. */
	code: string;
}

export const examples: ExampleEntry[] = [
	{
		slug: 'signup',
		initialValues: { firstName: '', lastName: '', email: '', password: '', terms: false },
		schema: {
			title: 'Create your account',
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
						{ key: 'lastName', label: 'Last name', control: 'text', validators: { required: true } },
					],
				},
				{
					questions: [
						{
							key: 'email',
							label: 'Email',
							control: 'email',
							placeholder: 'you@example.com',
							validators: { required: true, email: true },
						},
						{
							key: 'password',
							label: 'Password',
							control: 'text',
							inputType: 'password',
							validators: { required: true, minLength: 8 },
						},
						{
							key: 'terms',
							label: 'Terms',
							control: 'checkbox',
							checkboxLabel: 'I agree to the terms of service',
							validators: {
								required: true,
								custom: (v) => (v ? null : 'You must agree to continue'),
							},
						},
					],
				},
			],
		},
		code: `const schema: FormSchema = {
	title: 'Create your account',
	groups: [
		{
			layout: 'grid',
			gridCols: 2,
			questions: [
				{ key: 'firstName', label: 'First name', control: 'text', validators: { required: true, minLength: 2 } },
				{ key: 'lastName', label: 'Last name', control: 'text', validators: { required: true } },
			],
		},
		{
			questions: [
				{ key: 'email', label: 'Email', control: 'email', placeholder: 'you@example.com', validators: { required: true, email: true } },
				{ key: 'password', label: 'Password', control: 'text', inputType: 'password', validators: { required: true, minLength: 8 } },
				{
					key: 'terms',
					label: 'Terms',
					control: 'checkbox',
					checkboxLabel: 'I agree to the terms of service',
					validators: { required: true, custom: (v) => (v ? null : 'You must agree to continue') },
				},
			],
		},
	],
};`,
	},
	{
		slug: 'checkout-wizard',
		initialValues: { email: '', city: '', zip: '', expedite: false, notes: '' },
		schema: {
			title: 'Checkout',
			groups: [],
			wizard: {
				steps: [
					{
						id: 'contact',
						title: 'Contact',
						groups: [
							{
								questions: [
									{
										key: 'email',
										label: 'Email',
										control: 'email',
										validators: { required: true, email: true },
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
								layout: 'grid',
								gridCols: 2,
								questions: [
									{ key: 'city', label: 'City', control: 'text', validators: { required: true } },
									{
										key: 'zip',
										label: 'Postal code',
										control: 'text',
										validators: { required: true, pattern: /^[A-Z0-9 -]{3,10}$/i },
									},
								],
							},
							{
								questions: [
									{
										key: 'expedite',
										label: 'Shipping',
										control: 'checkbox',
										checkboxLabel: 'Expedited shipping',
									},
								],
							},
						],
					},
					{
						id: 'notes',
						title: 'Shipping notes',
						dependents: {
							propsDependsOn: [
								{ fieldNames: ['expedite'], compute: (v) => ({ hidden: v.expedite !== true }) },
							],
						},
						groups: [
							{
								questions: [
									{ key: 'notes', label: 'Notes for the courier', control: 'textarea', rows: 3 },
								],
							},
						],
					},
				],
			},
		},
		code: `const schema: FormSchema = {
	title: 'Checkout',
	groups: [],
	wizard: {
		steps: [
			{
				id: 'contact',
				title: 'Contact',
				groups: [{ questions: [{ key: 'email', label: 'Email', control: 'email', validators: { required: true, email: true } }] }],
			},
			{
				id: 'address',
				title: 'Address',
				groups: [
					{
						layout: 'grid',
						gridCols: 2,
						questions: [
							{ key: 'city', label: 'City', control: 'text', validators: { required: true } },
							{ key: 'zip', label: 'Postal code', control: 'text', validators: { required: true, pattern: /^[A-Z0-9 -]{3,10}$/i } },
						],
					},
					{ questions: [{ key: 'expedite', label: 'Shipping', control: 'checkbox', checkboxLabel: 'Expedited shipping' }] },
				],
			},
			{
				id: 'notes',
				title: 'Shipping notes',
				dependents: {
					propsDependsOn: [{ fieldNames: ['expedite'], compute: (v) => ({ hidden: v.expedite !== true }) }],
				},
				groups: [{ questions: [{ key: 'notes', label: 'Notes for the courier', control: 'textarea', rows: 3 }] }],
			},
		],
	},
};`,
	},
	{
		slug: 'dependent-dropdowns',
		initialValues: { country: null, region: null },
		schema: {
			groups: [
				{
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
								{ value: 'gb', label: 'United Kingdom' },
								{ value: 'lk', label: 'Sri Lanka' },
							],
							validators: { required: true },
						},
						{
							key: 'region',
							label: 'Region',
							control: 'dropdown',
							options: [],
							dependents: {
								propsDependsOn: [
									{
										fieldNames: ['country'],
										compute: (v) => ({
											options:
												v.country === 'us'
													? [
															{ value: 'ca', label: 'California' },
															{ value: 'ny', label: 'New York' },
															{ value: 'tx', label: 'Texas' },
														]
													: v.country === 'gb'
														? [
																{ value: 'eng', label: 'England' },
																{ value: 'sct', label: 'Scotland' },
															]
														: v.country === 'lk'
															? [
																	{ value: 'wp', label: 'Western Province' },
																	{ value: 'sp', label: 'Southern Province' },
																]
															: [],
											disabled: !v.country,
											placeholder: v.country ? 'Pick a region' : 'Pick a country first',
										}),
									},
								],
							},
						},
					],
				},
			],
		},
		code: `const schema: FormSchema = {
	groups: [
		{
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
						{ value: 'gb', label: 'United Kingdom' },
						{ value: 'lk', label: 'Sri Lanka' },
					],
					validators: { required: true },
				},
				{
					key: 'region',
					label: 'Region',
					control: 'dropdown',
					options: [],
					dependents: {
						propsDependsOn: [
							{
								fieldNames: ['country'],
								compute: (v) => ({
									options: REGIONS[v.country] ?? [],
									disabled: !v.country,
									placeholder: v.country ? 'Pick a region' : 'Pick a country first',
								}),
							},
						],
					},
				},
			],
		},
	],
};`,
	},
	{
		slug: 'order-calculator',
		showReset: false,
		initialValues: { qty: 1, unitPrice: 19.99, total: 0 },
		schema: {
			groups: [
				{
					layout: 'grid',
					gridCols: 3,
					questions: [
						{ key: 'qty', label: 'Quantity', control: 'number', validators: { min: 0 } },
						{
							key: 'unitPrice',
							label: 'Unit price',
							control: 'number',
							prefix: '$',
							decimalScale: 2,
							validators: { min: 0 },
						},
						{
							key: 'total',
							label: 'Total',
							control: 'number',
							prefix: '$',
							readOnly: true,
							dependents: {
								valueDependsOn: {
									fieldNames: ['qty', 'unitPrice'],
									compute: (v) =>
										Number((((v.qty as number) ?? 0) * ((v.unitPrice as number) ?? 0)).toFixed(2)),
								},
							},
						},
					],
				},
			],
		},
		code: `const schema: FormSchema = {
	groups: [
		{
			layout: 'grid',
			gridCols: 3,
			questions: [
				{ key: 'qty', label: 'Quantity', control: 'number', validators: { min: 0 } },
				{ key: 'unitPrice', label: 'Unit price', control: 'number', prefix: '$', decimalScale: 2, validators: { min: 0 } },
				{
					key: 'total',
					label: 'Total',
					control: 'number',
					prefix: '$',
					readOnly: true,
					dependents: {
						valueDependsOn: {
							fieldNames: ['qty', 'unitPrice'],
							compute: (v) => Number((((v.qty as number) ?? 0) * ((v.unitPrice as number) ?? 0)).toFixed(2)),
						},
					},
				},
			],
		},
	],
};`,
	},
	{
		slug: 'contact',
		initialValues: { name: '', email: '', message: '' },
		schema: {
			title: 'Get in touch',
			groups: [
				{
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
							label: 'Email',
							control: 'email',
							placeholder: 'you@example.com',
							validators: { required: true, email: true },
						},
						{
							key: 'message',
							label: 'Message',
							control: 'textarea',
							rows: 4,
							placeholder: 'How can we help?',
							validators: { required: true, minLength: 10 },
						},
					],
				},
			],
		},
		code: `const schema: FormSchema = {
	title: 'Get in touch',
	groups: [
		{
			questions: [
				{ key: 'name', label: 'Name', control: 'text', placeholder: 'Ada Lovelace', validators: { required: true } },
				{ key: 'email', label: 'Email', control: 'email', placeholder: 'you@example.com', validators: { required: true, email: true } },
				{ key: 'message', label: 'Message', control: 'textarea', rows: 4, placeholder: 'How can we help?', validators: { required: true, minLength: 10 } },
			],
		},
	],
};`,
	},
	{
		slug: 'newsletter-preferences',
		initialValues: { email: '', subscribe: false, frequency: null, topics: [] },
		schema: {
			groups: [
				{
					questions: [
						{
							key: 'email',
							label: 'Email',
							control: 'email',
							placeholder: 'you@example.com',
							validators: { required: true, email: true },
						},
						{
							key: 'subscribe',
							label: 'Subscribe',
							control: 'checkbox',
							checkboxLabel: 'Send me the newsletter',
						},
					],
				},
				{
					id: 'prefs',
					title: 'Newsletter preferences',
					dependents: {
						propsDependsOn: [
							{ fieldNames: ['subscribe'], compute: (v) => ({ hidden: v.subscribe !== true }) },
						],
					},
					questions: [
						{
							key: 'frequency',
							label: 'Frequency',
							control: 'radioGroup',
							options: [
								{ value: 'weekly', label: 'Weekly' },
								{ value: 'monthly', label: 'Monthly' },
							],
						},
						{
							key: 'topics',
							label: 'Topics',
							control: 'checkboxList',
							options: [
								{ value: 'product', label: 'Product updates' },
								{ value: 'engineering', label: 'Engineering deep-dives' },
								{ value: 'events', label: 'Events' },
							],
						},
					],
				},
			],
		},
		code: `const schema: FormSchema = {
	groups: [
		{
			questions: [
				{ key: 'email', label: 'Email', control: 'email', placeholder: 'you@example.com', validators: { required: true, email: true } },
				{ key: 'subscribe', label: 'Subscribe', control: 'checkbox', checkboxLabel: 'Send me the newsletter' },
			],
		},
		{
			id: 'prefs',
			title: 'Newsletter preferences',
			dependents: {
				propsDependsOn: [
					{ fieldNames: ['subscribe'], compute: (v) => ({ hidden: v.subscribe !== true }) },
				],
			},
			questions: [
				{
					key: 'frequency',
					label: 'Frequency',
					control: 'radioGroup',
					options: [
						{ value: 'weekly', label: 'Weekly' },
						{ value: 'monthly', label: 'Monthly' },
					],
				},
				{
					key: 'topics',
					label: 'Topics',
					control: 'checkboxList',
					options: [
						{ value: 'product', label: 'Product updates' },
						{ value: 'engineering', label: 'Engineering deep-dives' },
						{ value: 'events', label: 'Events' },
					],
				},
			],
		},
	],
};`,
	},
];

export function getExample(slug: string): ExampleEntry {
	const entry = examples.find((e) => e.slug === slug);
	if (!entry) throw new Error(`Unknown example: ${slug}`);
	return entry;
}
