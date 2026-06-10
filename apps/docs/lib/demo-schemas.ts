// Shared demo schemas — the single source of truth for the landing-page
// animation, the Schema Studio playground, and inline doc examples. Each preset
// pairs the *live* schema object (real `compute` functions and all) with a
// hand-authored `code` string for the code pane, plus sensible initial values.

import type { FormSchema } from '@easy-forms/core';

export interface DemoPreset {
	id: string;
	label: string;
	blurb: string;
	schema: FormSchema;
	initialValues: Record<string, unknown>;
	/** Source shown in the code pane. Kept readable; the live form uses `schema`. */
	code: string;
}

// --- Basic ---------------------------------------------------------------

const basic: DemoPreset = {
	id: 'basic',
	label: 'Basic',
	blurb: 'A handful of fields with built-in validation.',
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
						placeholder: 'Ada',
						validators: { required: true, minLength: 2 },
					},
					{
						key: 'lastName',
						label: 'Last name',
						control: 'text',
						placeholder: 'Lovelace',
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
						key: 'plan',
						label: 'Plan',
						control: 'dropdown',
						placeholder: 'Choose a plan',
						options: [
							{ value: 'free', label: 'Free' },
							{ value: 'pro', label: 'Pro — $9/mo' },
							{ value: 'team', label: 'Team — $29/mo' },
						],
						validators: { required: true },
					},
				],
			},
		],
	},
	initialValues: { firstName: '', lastName: '', email: '', plan: null },
	code: `const schema: FormSchema = {
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
          placeholder: 'Ada',
          validators: { required: true, minLength: 2 },
        },
        {
          key: 'lastName',
          label: 'Last name',
          control: 'text',
          placeholder: 'Lovelace',
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
          key: 'plan',
          label: 'Plan',
          control: 'dropdown',
          placeholder: 'Choose a plan',
          options: [
            { value: 'free', label: 'Free' },
            { value: 'pro',  label: 'Pro — $9/mo' },
            { value: 'team', label: 'Team — $29/mo' },
          ],
          validators: { required: true },
        },
      ],
    },
  ],
};`,
};

// --- Conditional (propsDependsOn) ---------------------------------------

const conditional: DemoPreset = {
	id: 'conditional',
	label: 'Conditional',
	blurb: 'Fields appear and options change as you type — one `propsDependsOn` rule each.',
	schema: {
		title: 'Shipping details',
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
							{ value: 'lk', label: 'Sri Lanka' },
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
										options: REGIONS[v.country as string] ?? [],
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
					{
						key: 'gift',
						label: 'Gift',
						control: 'checkbox',
						checkboxLabel: 'This is a gift',
					},
					{
						key: 'giftMessage',
						label: 'Gift message',
						control: 'textarea',
						rows: 2,
						placeholder: 'Add a note…',
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
	},
	initialValues: { country: null, region: null, gift: false, giftMessage: '' },
	code: `const schema: FormSchema = {
  title: 'Shipping details',
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
          options: COUNTRIES,
        },
        {
          key: 'region',
          label: 'Region',
          control: 'dropdown',
          options: [],
          // One rule drives options + disabled + placeholder.
          dependents: {
            propsDependsOn: [{
              fieldNames: ['country'],
              compute: (v) => ({
                options: REGIONS[v.country] ?? [],
                disabled: !v.country,
                placeholder: v.country
                  ? 'Pick a region'
                  : 'Pick a country first',
              }),
            }],
          },
        },
      ],
    },
    {
      questions: [
        {
          key: 'gift',
          label: 'Gift',
          control: 'checkbox',
          checkboxLabel: 'This is a gift',
        },
        {
          key: 'giftMessage',
          label: 'Gift message',
          control: 'textarea',
          clearWhenHidden: true,
          // Shows + becomes required only when "gift" is checked.
          dependents: {
            propsDependsOn: [{
              fieldNames: ['gift'],
              compute: (v) => ({
                hidden: v.gift !== true,
                required: v.gift === true,
              }),
            }],
          },
        },
      ],
    },
  ],
};`,
};

// --- Derived value (valueDependsOn) -------------------------------------

const order: DemoPreset = {
	id: 'order',
	label: 'Derived values',
	blurb: 'Total recomputes from subtotal × tax — derived writes never flip `isDirty`.',
	schema: {
		title: 'Order summary',
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
	},
	initialValues: { subtotal: 100, taxRate: 8.5, total: 0 },
	code: `const schema: FormSchema = {
  title: 'Order summary',
  groups: [
    {
      layout: 'grid',
      gridCols: 3,
      questions: [
        { key: 'subtotal', label: 'Subtotal', control: 'number', prefix: '$' },
        { key: 'taxRate', label: 'Tax rate', control: 'number', suffix: '%' },
        {
          key: 'total',
          label: 'Total',
          control: 'number',
          prefix: '$',
          readOnly: true,
          // Derived from subtotal + taxRate. Recomputes live.
          dependents: {
            valueDependsOn: {
              fieldNames: ['subtotal', 'taxRate'],
              compute: (v) =>
                Number((v.subtotal * (1 + v.taxRate / 100)).toFixed(2)),
            },
          },
        },
      ],
    },
  ],
};`,
};

const REGIONS: Record<string, { value: string; label: string }[]> = {
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

export const demoPresets: DemoPreset[] = [basic, conditional, order];

export function getPreset(id: string): DemoPreset {
	return demoPresets.find((p) => p.id === id) ?? basic;
}
