'use client';

// Client-side demo components. These hold schemas that contain *functions*
// (custom validators, dependency `compute`). Because this module is a client
// boundary, the functions never cross the RSC serialization boundary — which is
// why inline `<LiveForm schema={{ ...functions }} />` in server-rendered MDX is
// not allowed. MDX references these by name instead.
//
// Concept demos (dependency/wizard pages) self-wrap in `<ComponentPreview>` with
// a co-located `code` snippet. The gallery *examples* live in `example-registry`
// (single source for both the gallery mini-preview and the detail page).

import type { FormSchema } from '@easy-forms/core';
import { ComponentPreview } from './ComponentPreview';
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

const PROPS_DEPENDS_ON_CODE = `const schema: FormSchema = {
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
		{
			questions: [
				{ key: 'gift', label: 'Gift', control: 'checkbox', checkboxLabel: 'This is a gift' },
				{
					key: 'message',
					label: 'Gift message',
					control: 'textarea',
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
};`;

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
		<ComponentPreview code={PROPS_DEPENDS_ON_CODE}>
			<LiveForm
				schema={schema}
				initialValues={{ country: null, region: null, gift: false, message: '' }}
				framed={false}
			/>
		</ComponentPreview>
	);
}

const VALUE_DEPENDS_ON_CODE = `const schema: FormSchema = {
	groups: [
		{
			layout: 'grid',
			gridCols: 3,
			questions: [
				{ key: 'subtotal', label: 'Subtotal', control: 'number', prefix: '$', validators: { min: 0 } },
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
};`;

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
		<ComponentPreview code={VALUE_DEPENDS_ON_CODE}>
			<LiveForm
				schema={schema}
				showReset={false}
				initialValues={{ subtotal: 100, taxRate: 8.5, total: 0 }}
				framed={false}
			/>
		</ComponentPreview>
	);
}

const CONDITIONAL_GROUPS_CODE = `const schema: FormSchema = {
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
};`;

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
		<ComponentPreview code={CONDITIONAL_GROUPS_CODE}>
			<LiveForm
				schema={schema}
				initialValues={{ subscribe: false, digest: false, frequency: null }}
				framed={false}
			/>
		</ComponentPreview>
	);
}

const WIZARD_CODE = `const schema: FormSchema = {
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
							{ key: 'firstName', label: 'First name', control: 'text', validators: { required: true, minLength: 2 } },
							{ key: 'lastName', label: 'Last name', control: 'text', validators: { required: true } },
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
							{ key: 'line1', label: 'Address line 1', control: 'text', validators: { required: true } },
							{ key: 'needsShipping', label: 'Shipping', control: 'checkbox', checkboxLabel: 'I need expedited shipping' },
						],
					},
				],
			},
			{
				id: 'shipping',
				title: 'Shipping notes',
				dependents: {
					propsDependsOn: [
						{ fieldNames: ['needsShipping'], compute: (v) => ({ hidden: v.needsShipping !== true }) },
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
							{ key: 'confirmEmail', label: 'Confirm email', control: 'email', validators: { required: true, email: true } },
						],
					},
				],
			},
		],
	},
};`;

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
		<ComponentPreview code={WIZARD_CODE}>
			<LiveForm
				schema={schema}
				framed={false}
				initialValues={{
					firstName: '',
					lastName: '',
					line1: '',
					needsShipping: false,
					notes: '',
					confirmEmail: '',
				}}
			/>
		</ComponentPreview>
	);
}
