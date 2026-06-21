'use client';

import { CodePane } from '@/components/code/CodePane';
import { DemoFrame, LiveBadge } from '@/components/demo/DemoFrame';
import { EasyForm } from '@/components/easy-forms/easy-form';
import { demoPresets, getPreset } from '@/lib/demo-schemas';
import { type FormStore, createFormStore } from '@easy-forms/core';
import { Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** Scripted "type the schema, watch the form build, then watch it react" beat. */
function interactionSteps(
	presetId: string
): { delay: number; key: string; run: (s: FormStore) => void }[] {
	switch (presetId) {
		case 'conditional':
			return [
				{ delay: 700, key: 'country', run: (s) => s.setValue('country', 'us') },
				{ delay: 900, key: 'region', run: (s) => s.setValue('region', 'ca') },
				{ delay: 1100, key: 'gift', run: (s) => s.setValue('gift', true) },
				{
					delay: 1000,
					key: 'giftMessage',
					run: (s) => s.setValue('giftMessage', 'Happy birthday! 🎉'),
				},
			];
		case 'order':
			return [
				{ delay: 700, key: 'subtotal', run: (s) => s.setValue('subtotal', 250) },
				{ delay: 900, key: 'taxRate', run: (s) => s.setValue('taxRate', 8.5) },
			];
		default:
			return [
				{ delay: 600, key: 'firstName', run: (s) => s.setValue('firstName', 'Ada') },
				{ delay: 700, key: 'lastName', run: (s) => s.setValue('lastName', 'Lovelace') },
				{ delay: 800, key: 'email', run: (s) => s.setValue('email', 'ada@example.com') },
				{ delay: 800, key: 'plan', run: (s) => s.setValue('plan', 'pro') },
			];
	}
}

export function SchemaFormSync() {
	const [presetId, setPresetId] = useState(demoPresets[0]!.id);
	const [cycle, setCycle] = useState(0);
	const [playing, setPlaying] = useState(true);
	const [progress, setProgress] = useState(0);
	const [activeKey, setActiveKey] = useState<string | null>(null);
	const [reduced, setReduced] = useState(false);

	const preset = getPreset(presetId);

	// A fresh store per (preset, cycle) so each loop resets the form cleanly.
	const store = useMemo<FormStore>(
		() => createFormStore({ initialValues: preset.initialValues }),
		[preset, cycle]
	);

	useEffect(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		setReduced(mq.matches);
		const on = () => setReduced(mq.matches);
		mq.addEventListener('change', on);
		return () => mq.removeEventListener('change', on);
	}, []);

	const restart = useCallback(() => setCycle((c) => c + 1), []);

	useEffect(() => {
		if (reduced) {
			setProgress(1);
			setActiveKey(null);
			return;
		}
		if (!playing) {
			setProgress(1);
			return;
		}

		let raf = 0;
		const timers: ReturnType<typeof setTimeout>[] = [];
		let cancelled = false;
		setActiveKey(null);
		setProgress(0);

		const typingMs = Math.min(3400, Math.max(1900, preset.code.length * 5));
		const start = performance.now();

		const tick = (now: number) => {
			if (cancelled) return;
			const p = Math.min(1, (now - start) / typingMs);
			setProgress(p);
			if (p < 1) {
				raf = requestAnimationFrame(tick);
			} else {
				runInteraction();
			}
		};

		const runInteraction = () => {
			let acc = 600; // settle pause after typing
			for (const step of interactionSteps(preset.id)) {
				acc += step.delay;
				timers.push(
					setTimeout(() => {
						if (cancelled) return;
						setActiveKey(step.key);
						step.run(store);
					}, acc)
				);
			}
			// hold, clear highlight, then loop
			acc += 2600;
			timers.push(
				setTimeout(() => {
					if (cancelled) return;
					setActiveKey(null);
				}, acc - 1200)
			);
			timers.push(
				setTimeout(() => {
					if (!cancelled) restart();
				}, acc)
			);
		};

		raf = requestAnimationFrame(tick);
		return () => {
			cancelled = true;
			cancelAnimationFrame(raf);
			for (const t of timers) clearTimeout(t);
		};
	}, [preset, cycle, playing, reduced, store, restart]);

	const reveal = reduced ? 1 : progress;
	const typing = reveal < 1 && playing && !reduced;

	return (
		<div className="flex flex-col gap-4">
			{/* Controls */}
			<div className="flex flex-wrap items-center gap-2">
				<div className="flex items-center gap-1 rounded-full border border-fd-border bg-fd-card p-1">
					{demoPresets.map((p) => (
						<button
							type="button"
							key={p.id}
							onClick={() => {
								setPresetId(p.id);
								setCycle((c) => c + 1);
							}}
							className={[
								'rounded-full px-3 py-1 text-xs font-medium transition-colors',
								p.id === presetId
									? 'bg-fd-primary text-fd-primary-foreground'
									: 'text-fd-muted-foreground hover:text-fd-foreground',
							].join(' ')}
						>
							{p.label}
						</button>
					))}
				</div>
				<button
					type="button"
					onClick={() => {
						setPlaying((v) => !v);
						if (!playing) setCycle((c) => c + 1);
					}}
					className="inline-flex items-center gap-1.5 rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs font-medium text-fd-muted-foreground hover:text-fd-foreground"
					aria-label={playing ? 'Pause animation' : 'Play animation'}
				>
					{playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
					{playing ? 'Pause' : 'Play'}
				</button>
				<span className="ml-auto hidden text-xs text-fd-muted-foreground sm:block">
					{preset.blurb}
				</span>
			</div>

			<div className="grid items-start gap-4 lg:grid-cols-2">
				{/* Code pane */}
				<DemoFrame
					title="schema.ts"
					className="bg-[#0d1117]"
					bodyClassName="relative max-h-[460px] overflow-hidden"
				>
					<div
						style={{ clipPath: `inset(0 0 ${(1 - reveal) * 100}% 0)` }}
						className="transition-[clip-path] duration-100"
					>
						<CodePane code={preset.code} highlightKey={activeKey} />
					</div>
					{typing ? <ScanLine progress={reveal} /> : null}
				</DemoFrame>

				{/* Live form pane */}
				<DemoFrame
					title="Preview"
					accent={<LiveBadge />}
					bodyClassName="relative max-h-[460px] overflow-auto p-5"
				>
					<div
						className="not-prose ef-demo-surface transition-[clip-path] duration-100"
						style={{ clipPath: `inset(0 0 ${(1 - reveal) * 100}% 0)` }}
					>
						<EasyForm
							key={`${preset.id}-${cycle}`}
							store={store}
							schema={preset.schema}
							initialValues={preset.initialValues}
							onSubmit={async () => {}}
							submitLabel="Submit"
						/>
					</div>
					{typing ? <ScanLine progress={reveal} /> : null}
				</DemoFrame>
			</div>
		</div>
	);
}

function ScanLine({ progress }: { progress: number }) {
	return (
		<div
			className="pointer-events-none absolute inset-x-0 z-10"
			style={{ top: `${progress * 100}%` }}
		>
			<div className="h-px w-full bg-fd-primary/70 shadow-[0_0_12px_2px] shadow-fd-primary/50" />
		</div>
	);
}
