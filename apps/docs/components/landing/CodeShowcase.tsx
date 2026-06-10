'use client';

import { CodePane } from '@/components/code/CodePane';
import { DemoFrame, LiveBadge } from '@/components/demo/DemoFrame';
import { LiveForm } from '@/components/demo/LiveForm';
import { demoPresets, getPreset } from '@/lib/demo-schemas';
import { useState } from 'react';

/** Tabbed "code → live form" showcase. Each tab is a real, interactive form. */
export function CodeShowcase() {
	const [active, setActive] = useState(demoPresets[0]!.id);
	const preset = getPreset(active);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-center gap-1 rounded-full border border-fd-border bg-fd-card p-1 self-center">
				{demoPresets.map((p) => (
					<button
						key={p.id}
						type="button"
						onClick={() => setActive(p.id)}
						className={[
							'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
							p.id === active
								? 'bg-fd-primary text-fd-primary-foreground'
								: 'text-fd-muted-foreground hover:text-fd-foreground',
						].join(' ')}
					>
						{p.label}
					</button>
				))}
			</div>
			<div className="grid items-start gap-4 lg:grid-cols-2">
				<DemoFrame
					title="schema.ts"
					className="bg-[#0d1117]"
					bodyClassName="max-h-[480px] overflow-auto"
				>
					<CodePane code={preset.code} />
				</DemoFrame>
				<DemoFrame
					title="Preview"
					accent={<LiveBadge />}
					bodyClassName="max-h-[480px] overflow-auto p-5"
				>
					<LiveForm
						key={preset.id}
						schema={preset.schema}
						initialValues={preset.initialValues}
						framed={false}
					/>
				</DemoFrame>
			</div>
		</div>
	);
}
