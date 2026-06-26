'use client';

import { DemoFrame, LiveBadge } from '@/components/demo/DemoFrame';
import { EasyForm } from '@/components/easy-forms/easy-form';
import { studioPresets } from '@/lib/studio-presets';
import type { FormSchema } from '@easy-forms/core';
import { AlertTriangle, RotateCcw, Share2 } from 'lucide-react';
import { Highlight } from 'prism-react-renderer';
import { useEffect, useMemo, useState } from 'react';
import Editor from 'react-simple-code-editor';

function decodeFromUrl(): string | null {
	if (typeof window === 'undefined') return null;
	const p = new URLSearchParams(window.location.search).get('s');
	if (!p) return null;
	try {
		return decodeURIComponent(escape(atob(p)));
	} catch {
		return null;
	}
}

export function SchemaStudio() {
	const [code, setCode] = useState(studioPresets[0]!.json);
	const [submitted, setSubmitted] = useState<unknown>(null);

	useEffect(() => {
		const fromUrl = decodeFromUrl();
		if (fromUrl) setCode(fromUrl);
	}, []);

	const parsed = useMemo<{ schema: FormSchema | null; error: string | null }>(() => {
		try {
			const obj = JSON.parse(code);
			if (!obj || !Array.isArray(obj.groups)) {
				return { schema: null, error: 'Schema must be an object with a `groups` array.' };
			}
			return { schema: obj as FormSchema, error: null };
		} catch (e) {
			return { schema: null, error: e instanceof Error ? e.message : 'Invalid JSON' };
		}
	}, [code]);

	const initialValues = useMemo(() => {
		if (!parsed.schema) return undefined;
		const values: Record<string, unknown> = {};
		const walk = (groups: NonNullable<FormSchema['groups']>) => {
			for (const g of groups) {
				for (const q of g.questions ?? []) {
					values[q.key] = q.defaultValue ?? defaultFor(q.control);
				}
				if (g.groups) walk(g.groups);
			}
		};
		walk(parsed.schema.groups);
		return values;
	}, [parsed.schema]);

	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<div className="flex flex-col gap-3">
				<div className="flex flex-wrap items-center gap-2">
					<select
						className="rounded-md border border-fd-border bg-fd-card px-2 py-1.5 text-sm"
						onChange={(e) => {
							const p = studioPresets.find((x) => x.id === e.target.value);
							if (p) {
								setCode(p.json);
								setSubmitted(null);
							}
						}}
						defaultValue={studioPresets[0]!.id}
					>
						{studioPresets.map((p) => (
							<option key={p.id} value={p.id}>
								{p.label}
							</option>
						))}
					</select>
					<button
						type="button"
						onClick={() => {
							const enc = btoa(unescape(encodeURIComponent(code)));
							const url = `${window.location.origin}${window.location.pathname}?s=${enc}`;
							void navigator.clipboard.writeText(url);
						}}
						className="inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-card px-2.5 py-1.5 text-sm hover:bg-fd-accent"
					>
						<Share2 className="h-3.5 w-3.5" /> Copy share link
					</button>
					<button
						type="button"
						onClick={() => setCode(studioPresets[0]!.json)}
						className="inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-card px-2.5 py-1.5 text-sm hover:bg-fd-accent"
					>
						<RotateCcw className="h-3.5 w-3.5" /> Reset
					</button>
				</div>
				<DemoFrame
					title="schema.json"
					className="bg-[#0d1117]"
					bodyClassName="max-h-[560px] overflow-auto p-0"
				>
					<Editor
						value={code}
						onValueChange={setCode}
						highlight={(c) => (
							<Highlight
								code={c}
								language="json"
								theme={{ plain: { color: '#c9d1d9' }, styles: [] }}
							>
								{({ tokens, getLineProps, getTokenProps }) => (
									<>
										{tokens.map((line, i) => (
											<div key={`l-${i}`} {...getLineProps({ line })}>
												{line.map((t, k) => (
													<span key={`t-${k}`} {...getTokenProps({ token: t })} />
												))}
											</div>
										))}
									</>
								)}
							</Highlight>
						)}
						padding={16}
						className="ef-studio-editor font-mono text-[13px]"
						style={{ fontFamily: 'var(--font-mono, monospace)', minHeight: 400 }}
					/>
				</DemoFrame>
				{parsed.error ? (
					<div className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
						<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
						<span className="font-mono text-xs">{parsed.error}</span>
					</div>
				) : null}
			</div>

			<DemoFrame
				title="Preview"
				accent={<LiveBadge />}
				bodyClassName="max-h-[620px] overflow-auto p-5"
			>
				{parsed.schema ? (
					<div className="not-prose ef-demo-surface">
						<EasyForm
							key={code.length}
							schema={parsed.schema}
							initialValues={initialValues}
							showReset
							onSubmit={async (v) => setSubmitted(v)}
						/>
						{submitted ? (
							<div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
								<div className="mb-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
									Submitted payload
								</div>
								<pre className="overflow-auto text-xs">{JSON.stringify(submitted, null, 2)}</pre>
							</div>
						) : null}
					</div>
				) : (
					<p className="text-sm text-fd-muted-foreground">Fix the schema to see a live preview.</p>
				)}
			</DemoFrame>
		</div>
	);
}

function defaultFor(control: string): unknown {
	switch (control) {
		case 'checkbox':
			return false;
		case 'multiselect':
		case 'checkboxList':
			return [];
		case 'number':
			return null;
		default:
			return '';
	}
}
