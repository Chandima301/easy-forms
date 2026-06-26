'use client';

import { ComponentPreview } from '@/components/demo/ComponentPreview';
import { LiveForm } from '@/components/demo/LiveForm';
import { demoPresets, getPreset } from '@/lib/demo-schemas';
import { useState } from 'react';

/** Preset-switchable showcase. Each preset feeds a MagicUI Preview/Code shell. */
export function CodeShowcase() {
	const [active, setActive] = useState(demoPresets[0]!.id);
	const preset = getPreset(active);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-center gap-1 self-center rounded-full border border-fd-border bg-fd-card p-1">
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
			<ComponentPreview
				key={preset.id}
				code={preset.code}
				filename="schema.tsx"
				previewClassName="max-h-[480px] overflow-auto p-5"
			>
				<LiveForm schema={preset.schema} initialValues={preset.initialValues} framed={false} />
			</ComponentPreview>
		</div>
	);
}
