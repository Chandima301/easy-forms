'use client';

// Client-side demo components. These hold schemas that contain *functions*
// (custom validators, dependency `compute`). Because this module is a client
// boundary, the functions never cross the RSC serialization boundary — which is
// why inline `<LiveForm schema={{ ...functions }} />` in server-rendered MDX is
// not allowed. MDX references these by name instead.

import type { FormSchema } from '@easy-forms/core';
import { LiveForm } from './LiveForm';

export function CheckboxRequiredDemo() {
	const schema: FormSchema = {
		groups: [
			{
				questions: [
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
	};
	return <LiveForm schema={schema} initialValues={{ terms: false }} />;
}

export function PropsDependsOnDemo() {
	const schema: FormSchema = {
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
						],
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
													]
												: v.country === 'gb'
													? [
															{ value: 'eng', label: 'England' },
															{ value: 'sct', label: 'Scotland' },
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
			{
				questions: [
					{ key: 'gift', label: 'Gift', control: 'checkbox', checkboxLabel: 'This is a gift' },
					{
						key: 'message',
						label: 'Gift message',
						control: 'textarea',
						rows: 2,
						clearWhenHidden: true,
						dependents: {
							propsDependsOn: [
								{
									fieldNames: ['gift'],
									compute: (v) => ({ hidden: v.gift !== true, required: v.gift === true }),
								},
							],
						},
					},
				],
			},
		],
	};
	return (
		<LiveForm
			schema={schema}
			initialValues={{ country: null, region: null, gift: false, message: '' }}
		/>
	);
}

export function ValueDependsOnDemo() {
	const schema: FormSchema = {
		groups: [
			{
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
		],
	};
	return (
		<LiveForm
			schema={schema}
			showReset={false}
			initialValues={{ subtotal: 100, taxRate: 8.5, total: 0 }}
		/>
	);
}

export function ConditionalGroupsDemo() {
	const schema: FormSchema = {
		groups: [
			{
				questions: [
					{
						key: 'subscribe',
						label: 'Subscribe',
						control: 'checkbox',
						checkboxLabel: 'Email me about new features',
					},
				],
			},
			{
				id: 'marketing',
				title: 'Marketing preferences',
				dependents: {
					propsDependsOn: [
						{ fieldNames: ['subscribe'], compute: (v) => ({ hidden: v.subscribe !== true }) },
					],
				},
				questions: [
					{
						key: 'digest',
						label: 'Weekly digest',
						control: 'checkbox',
						checkboxLabel: 'Send me a weekly digest',
					},
					{
						key: 'frequency',
						label: 'Frequency',
						control: 'radioGroup',
						options: [
							{ value: 'daily', label: 'Daily' },
							{ value: 'weekly', label: 'Weekly' },
						],
					},
				],
			},
		],
	};
	return (
		<LiveForm
			schema={schema}
			initialValues={{ subscribe: false, digest: false, frequency: null }}
		/>
	);
}

export function WizardDemo() {
	const schema: FormSchema = {
		title: 'Checkout',
		description: 'A multi-step form built from one schema.',
		groups: [],
		wizard: {
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
									validators: { required: true },
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
									key: 'line1',
									label: 'Address line 1',
									control: 'text',
									validators: { required: true },
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
					groups: [{ questions: [{ key: 'notes', label: 'Notes', control: 'textarea', rows: 3 }] }],
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
	return (
		<LiveForm
			schema={schema}
			initialValues={{
				firstName: '',
				lastName: '',
				line1: '',
				needsShipping: false,
				notes: '',
				confirmEmail: '',
			}}
		/>
	);
}

export function SignupDemo() {
	const schema: FormSchema = {
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
	};
	return (
		<LiveForm
			schema={schema}
			initialValues={{ firstName: '', lastName: '', email: '', password: '', terms: false }}
		/>
	);
}

export function CheckoutWizardDemo() {
	const schema: FormSchema = {
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
	};
	return (
		<LiveForm
			schema={schema}
			initialValues={{ email: '', city: '', zip: '', expedite: false, notes: '' }}
		/>
	);
}

export function DependentDropdownsDemo() {
	const schema: FormSchema = {
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
	};
	return <LiveForm schema={schema} initialValues={{ country: null, region: null }} />;
}

export function OrderCalculatorDemo() {
	const schema: FormSchema = {
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
	};
	return (
		<LiveForm
			schema={schema}
			showReset={false}
			initialValues={{ qty: 1, unitPrice: 19.99, total: 0 }}
		/>
	);
}
