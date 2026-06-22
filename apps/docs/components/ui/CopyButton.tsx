'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function CopyButton({ value, className }: { value: string; className?: string }) {
	const [copied, setCopied] = useState(false);
	return (
		<button
			type="button"
			onClick={() => {
				void navigator.clipboard.writeText(value);
				setCopied(true);
				setTimeout(() => setCopied(false), 1500);
			}}
			className={[
				'inline-flex items-center justify-center transition-colors',
				className ?? '',
			].join(' ')}
			aria-label="Copy to clipboard"
		>
			{copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
		</button>
	);
}

/** Terminal-style install chip with one-click copy. */
export function InstallChip({
	command = 'npm i @easy-forms/core',
	className,
}: {
	command?: string;
	className?: string;
}) {
	return (
		<div
			className={[
				'inline-flex items-center gap-3 rounded-lg border border-fd-border bg-fd-card px-4 py-2 font-mono text-sm shadow-sm',
				className ?? '',
			].join(' ')}
		>
			<span className="select-none text-fd-muted-foreground">$</span>
			<span className="text-fd-foreground">{command}</span>
			<CopyButton value={command} className="text-fd-muted-foreground hover:text-fd-foreground" />
		</div>
	);
}
