'use client';

import { CopyButton } from '@/components/ui/CopyButton';
import { useState } from 'react';

const MANAGERS = ['pnpm', 'npm', 'yarn', 'bun'] as const;
type Manager = (typeof MANAGERS)[number];

function command(mgr: Manager, pkg: string): string {
	switch (mgr) {
		case 'npm':
			return `npm install ${pkg}`;
		case 'yarn':
			return `yarn add ${pkg}`;
		case 'bun':
			return `bun add ${pkg}`;
		default:
			return `pnpm add ${pkg}`;
	}
}

/** Package-manager tabbed install block. Usage in MDX: <PackageInstall packages="@easy-forms/core @easy-forms/shadcn" /> */
export function PackageInstall({
	packages = '@easy-forms/core @easy-forms/shadcn',
}: { packages?: string }) {
	const [mgr, setMgr] = useState<Manager>('pnpm');
	const cmd = command(mgr, packages);
	return (
		<div className="not-prose my-4 overflow-hidden rounded-lg border border-fd-border bg-fd-card">
			<div className="flex items-center justify-between border-b border-fd-border bg-fd-muted/40 px-2">
				<div className="flex">
					{MANAGERS.map((m) => (
						<button
							key={m}
							type="button"
							onClick={() => setMgr(m)}
							className={[
								'px-3 py-2 text-sm font-medium transition-colors',
								m === mgr
									? 'border-b-2 border-fd-primary text-fd-foreground'
									: 'text-fd-muted-foreground hover:text-fd-foreground',
							].join(' ')}
						>
							{m}
						</button>
					))}
				</div>
				<CopyButton
					value={cmd}
					className="mr-2 text-fd-muted-foreground hover:text-fd-foreground"
				/>
			</div>
			<pre className="overflow-auto px-4 py-3 font-mono text-sm">
				<span className="select-none text-fd-muted-foreground">$ </span>
				{cmd}
			</pre>
		</div>
	);
}
