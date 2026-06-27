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
						{
							key: 'lastName',
							label: 'Last name',
							control: 'text',
							validators: { required: true },
						},
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
	{
		slug: 'async-username',
		initialValues: { username: '' },
		schema: {
			groups: [
				{
					questions: [
						{
							key: 'username',
							label: 'Username',
							control: 'text',
							placeholder: 'pick a handle',
							prefix: '@',
							validators: {
								required: true,
								minLength: 3,
								custom: async (v) => {
									if (!v) return null;
									await new Promise((resolve) => setTimeout(resolve, 500));
									const taken = ['admin', 'ada', 'root', 'easyforms'];
									return taken.includes(String(v).toLowerCase())
										? 'That username is already taken'
										: null;
								},
							},
						},
					],
				},
			],
		},
		code: `const TAKEN = ['admin', 'ada', 'root', 'easyforms'];

const schema: FormSchema = {
	groups: [
		{
			questions: [
				{
					key: 'username',
					label: 'Username',
					control: 'text',
					prefix: '@',
					validators: {
						required: true,
						minLength: 3,
						// Async custom validators just return a Promise.
						custom: async (v) => {
							if (!v) return null;
							await fakeApiDelay();
							return TAKEN.includes(String(v).toLowerCase())
								? 'That username is already taken'
								: null;
						},
					},
				},
			],
		},
	],
};`,
	},
	{
		slug: 'survey',
		initialValues: { recommend: null, channels: [], reason: null, reasonOther: '' },
		schema: {
			groups: [
				{
					questions: [
						{
							key: 'recommend',
							label: 'How likely are you to recommend us?',
							control: 'radioGroup',
							options: [
								{ value: 'high', label: 'Very likely' },
								{ value: 'medium', label: 'Maybe' },
								{ value: 'low', label: 'Unlikely' },
							],
						},
						{
							key: 'channels',
							label: 'Where did you hear about us?',
							control: 'multiselect',
							placeholder: 'Select all that apply',
							options: [
								{ value: 'search', label: 'Search' },
								{ value: 'social', label: 'Social media' },
								{ value: 'friend', label: 'A friend' },
								{ value: 'other', label: 'Other' },
							],
						},
						{
							key: 'reason',
							label: 'Primary reason for your score',
							control: 'radioGroup',
							options: [
								{ value: 'features', label: 'Features' },
								{ value: 'price', label: 'Price' },
								{ value: 'support', label: 'Support' },
								{ value: 'other', label: 'Other' },
							],
						},
						{
							key: 'reasonOther',
							label: 'Tell us more',
							control: 'text',
							placeholder: 'Your reason',
							clearWhenHidden: true,
							dependents: {
								propsDependsOn: [
									{
										fieldNames: ['reason'],
										compute: (v) => ({
											hidden: v.reason !== 'other',
											required: v.reason === 'other',
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
			questions: [
				{
					key: 'recommend',
					label: 'How likely are you to recommend us?',
					control: 'radioGroup',
					options: [
						{ value: 'high', label: 'Very likely' },
						{ value: 'medium', label: 'Maybe' },
						{ value: 'low', label: 'Unlikely' },
					],
				},
				{
					key: 'channels',
					label: 'Where did you hear about us?',
					control: 'multiselect',
					placeholder: 'Select all that apply',
					options: [
						{ value: 'search', label: 'Search' },
						{ value: 'social', label: 'Social media' },
						{ value: 'friend', label: 'A friend' },
						{ value: 'other', label: 'Other' },
					],
				},
				{
					key: 'reason',
					label: 'Primary reason for your score',
					control: 'radioGroup',
					options: [
						{ value: 'features', label: 'Features' },
						{ value: 'price', label: 'Price' },
						{ value: 'support', label: 'Support' },
						{ value: 'other', label: 'Other' },
					],
				},
				{
					key: 'reasonOther',
					label: 'Tell us more',
					control: 'text',
					clearWhenHidden: true,
					dependents: {
						propsDependsOn: [
							{
								fieldNames: ['reason'],
								compute: (v) => ({ hidden: v.reason !== 'other', required: v.reason === 'other' }),
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
		slug: 'job-application',
		initialValues: {
			fullName: '',
			email: '',
			resume: null,
			availableFrom: null,
			coverLetter: '',
		},
		schema: {
			title: 'Job application',
			groups: [
				{
					id: 'applicant',
					title: 'Applicant',
					layout: 'grid',
					gridCols: 2,
					questions: [
						{
							key: 'fullName',
							label: 'Full name',
							control: 'text',
							validators: { required: true },
						},
						{
							key: 'email',
							label: 'Email',
							control: 'email',
							validators: { required: true, email: true },
						},
					],
				},
				{
					id: 'role',
					title: 'Application',
					questions: [
						{
							key: 'resume',
							label: 'Résumé (PDF, max 5 MB)',
							control: 'file',
							accept: { 'application/pdf': ['.pdf'] },
							maxSizeMB: 5,
							validators: { required: true },
						},
						{
							key: 'availableFrom',
							label: 'Available from',
							control: 'date',
							minDate: () => new Date().toISOString().slice(0, 10),
							validators: { required: true },
						},
						{ key: 'coverLetter', label: 'Cover letter', control: 'textarea', rows: 4 },
					],
				},
			],
		},
		code: `const schema: FormSchema = {
	title: 'Job application',
	groups: [
		{
			id: 'applicant',
			title: 'Applicant',
			layout: 'grid',
			gridCols: 2,
			questions: [
				{ key: 'fullName', label: 'Full name', control: 'text', validators: { required: true } },
				{ key: 'email', label: 'Email', control: 'email', validators: { required: true, email: true } },
			],
		},
		{
			id: 'role',
			title: 'Application',
			questions: [
				{
					key: 'resume',
					label: 'Résumé (PDF, max 5 MB)',
					control: 'file',
					accept: { 'application/pdf': ['.pdf'] },
					maxSizeMB: 5,
					validators: { required: true },
				},
				{
					key: 'availableFrom',
					label: 'Available from',
					control: 'date',
					minDate: () => new Date().toISOString().slice(0, 10),
					validators: { required: true },
				},
				{ key: 'coverLetter', label: 'Cover letter', control: 'textarea', rows: 4 },
			],
		},
	],
};`,
	},
	{
		slug: 'change-password',
		initialValues: { current: '', newPassword: '', confirm: '' },
		schema: {
			title: 'Change password',
			groups: [
				{
					questions: [
						{
							key: 'current',
							label: 'Current password',
							control: 'text',
							inputType: 'password',
							validators: { required: true },
						},
						{
							key: 'newPassword',
							label: 'New password',
							control: 'text',
							inputType: 'password',
							validators: { required: true, minLength: 8 },
						},
						{
							key: 'confirm',
							label: 'Confirm new password',
							control: 'text',
							inputType: 'password',
							validators: {
								required: true,
								custom: (v, all) => (v === all.newPassword ? null : 'Passwords must match'),
							},
						},
					],
				},
			],
		},
		code: `const schema: FormSchema = {
	title: 'Change password',
	groups: [
		{
			questions: [
				{ key: 'current', label: 'Current password', control: 'text', inputType: 'password', validators: { required: true } },
				{ key: 'newPassword', label: 'New password', control: 'text', inputType: 'password', validators: { required: true, minLength: 8 } },
				{
					key: 'confirm',
					label: 'Confirm new password',
					control: 'text',
					inputType: 'password',
					validators: {
						required: true,
						// The second arg is all form values — read another field here.
						custom: (v, all) => (v === all.newPassword ? null : 'Passwords must match'),
					},
				},
			],
		},
	],
};`,
	},
	{
		slug: 'login',
		initialValues: { email: '', password: '', remember: false },
		schema: {
			title: 'Sign in',
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
							key: 'password',
							label: 'Password',
							control: 'text',
							inputType: 'password',
							validators: { required: true },
						},
						{
							key: 'remember',
							label: 'Remember',
							control: 'checkbox',
							checkboxLabel: 'Remember me on this device',
						},
					],
				},
			],
		},
		code: `const schema: FormSchema = {
	title: 'Sign in',
	groups: [
		{
			questions: [
				{ key: 'email', label: 'Email', control: 'email', placeholder: 'you@example.com', validators: { required: true, email: true } },
				{ key: 'password', label: 'Password', control: 'text', inputType: 'password', validators: { required: true } },
				{ key: 'remember', label: 'Remember', control: 'checkbox', checkboxLabel: 'Remember me on this device' },
			],
		},
	],
};`,
	},
	{
		slug: 'event-rsvp',
		initialValues: { name: '', attending: null, guests: 0, dietary: [] },
		schema: {
			title: 'Event RSVP',
			groups: [
				{
					questions: [
						{ key: 'name', label: 'Your name', control: 'text', validators: { required: true } },
						{
							key: 'attending',
							label: 'Will you attend?',
							control: 'radioGroup',
							options: [
								{ value: 'yes', label: 'Yes, count me in' },
								{ value: 'no', label: 'Unfortunately not' },
							],
							validators: { required: true },
						},
						{
							key: 'guests',
							label: 'Additional guests',
							control: 'number',
							validators: { min: 0, max: 5 },
						},
						{
							key: 'dietary',
							label: 'Dietary requirements',
							control: 'multiselect',
							placeholder: 'Select any that apply',
							options: [
								{ value: 'veg', label: 'Vegetarian' },
								{ value: 'vegan', label: 'Vegan' },
								{ value: 'gf', label: 'Gluten-free' },
								{ value: 'none', label: 'No restrictions' },
							],
						},
					],
				},
			],
		},
		code: `const schema: FormSchema = {
	title: 'Event RSVP',
	groups: [
		{
			questions: [
				{ key: 'name', label: 'Your name', control: 'text', validators: { required: true } },
				{
					key: 'attending',
					label: 'Will you attend?',
					control: 'radioGroup',
					options: [
						{ value: 'yes', label: 'Yes, count me in' },
						{ value: 'no', label: 'Unfortunately not' },
					],
					validators: { required: true },
				},
				{ key: 'guests', label: 'Additional guests', control: 'number', validators: { min: 0, max: 5 } },
				{
					key: 'dietary',
					label: 'Dietary requirements',
					control: 'multiselect',
					placeholder: 'Select any that apply',
					options: [
						{ value: 'veg', label: 'Vegetarian' },
						{ value: 'vegan', label: 'Vegan' },
						{ value: 'gf', label: 'Gluten-free' },
						{ value: 'none', label: 'No restrictions' },
					],
				},
			],
		},
	],
};`,
	},
	{
		slug: 'feedback',
		initialValues: { rating: null, comment: '' },
		schema: {
			title: 'Quick feedback',
			groups: [
				{
					questions: [
						{
							key: 'rating',
							label: 'How was your experience?',
							control: 'radioGroup',
							options: [
								{ value: 'great', label: 'Great' },
								{ value: 'ok', label: 'Okay' },
								{ value: 'bad', label: 'Not good' },
							],
							validators: { required: true },
						},
						{
							key: 'comment',
							label: 'Anything to add?',
							control: 'textarea',
							rows: 3,
							placeholder: 'Optional comment',
						},
					],
				},
			],
		},
		code: `const schema: FormSchema = {
	title: 'Quick feedback',
	groups: [
		{
			questions: [
				{
					key: 'rating',
					label: 'How was your experience?',
					control: 'radioGroup',
					options: [
						{ value: 'great', label: 'Great' },
						{ value: 'ok', label: 'Okay' },
						{ value: 'bad', label: 'Not good' },
					],
					validators: { required: true },
				},
				{ key: 'comment', label: 'Anything to add?', control: 'textarea', rows: 3, placeholder: 'Optional comment' },
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
