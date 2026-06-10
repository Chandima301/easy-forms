'use client';

import { Form, type FormSchema } from '@easy-forms/core';
import { shadcnRegistry } from '@easy-forms/shadcn';
import { useState } from 'react';
import { DemoFrame, LiveBadge } from './DemoFrame';

export interface LiveFormProps {
	schema: FormSchema;
	initialValues?: Record<string, unknown>;
	showReset?: boolean;
	/** Render inside a window frame (default true). Set false for raw embeds. */
	framed?: boolean;
	title?: string;
	/** Show the submitted JSON payload after submit (default true). */
	showResult?: boolean;
}

/**
 * Renders the *genuine* `<Form>` from `@easy-forms/core` + the shadcn registry —
 * the same engine consumers ship. Used by inline doc examples and the landing.
 */
export function LiveForm({
	schema,
	initialValues,
	showReset = true,
	framed = true,
	title = 'Preview',
	showResult = true,
}: LiveFormProps) {
	const [submitted, setSubmitted] = useState<unknown>(null);

	const form = (
		<div className="not-prose ef-demo-surface">
			<Form
				schema={schema}
				registry={shadcnRegistry}
				initialValues={initialValues}
				showReset={showReset}
				onSubmit={async (values) => setSubmitted(values)}
			/>
			{showResult && submitted ? (
				<div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
					<div className="mb-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
						Submitted payload
					</div>
					<pre className="overflow-auto text-xs text-fd-foreground/80">
						{JSON.stringify(submitted, (_k, v) => (v instanceof File ? `[File: ${v.name}]` : v), 2)}
					</pre>
				</div>
			) : null}
		</div>
	);

	if (!framed) return form;

	return (
		<DemoFrame title={title} accent={<LiveBadge />} bodyClassName="p-5">
			{form}
		</DemoFrame>
	);
}
