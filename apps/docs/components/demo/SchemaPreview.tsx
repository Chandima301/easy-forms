import { serializeSchema } from '@/lib/serializeSchema';
import type { FormSchema } from '@easy-forms/core';
import { ComponentPreview } from './ComponentPreview';
import { LiveForm } from './LiveForm';

export interface SchemaPreviewProps {
	schema: FormSchema;
	initialValues?: Record<string, unknown>;
	showReset?: boolean;
	showResult?: boolean;
	/** Filename shown on the Code tab. */
	filename?: string;
}

/**
 * A doc example with a Preview/Code toggle. The Code tab is generated from the
 * same `schema` object that renders the Preview tab, so the two cannot drift.
 * Use this for every inline MDX example; demos whose schemas contain functions
 * belong in `components/demo/examples.tsx` instead.
 */
export function SchemaPreview({
	schema,
	initialValues,
	showReset = true,
	showResult = true,
	filename = 'schema.tsx',
}: SchemaPreviewProps) {
	return (
		<ComponentPreview code={serializeSchema(schema, initialValues)} filename={filename}>
			<LiveForm
				schema={schema}
				initialValues={initialValues}
				showReset={showReset}
				showResult={showResult}
				framed={false}
			/>
		</ComponentPreview>
	);
}
