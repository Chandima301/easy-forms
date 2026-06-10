import type { ReactNode } from 'react';

export interface PropRow {
	name: string;
	type: string;
	default?: string;
	required?: boolean;
	description: ReactNode;
}

/** Renders a typed props/API reference table. Usage in MDX: <PropsTable rows={[...]} /> */
export function PropsTable({ rows }: { rows: PropRow[] }) {
	return (
		<div className="not-prose my-6 overflow-x-auto rounded-lg border border-fd-border">
			<table className="w-full min-w-[640px] border-collapse text-sm">
				<thead>
					<tr className="border-b border-fd-border bg-fd-muted/40 text-left">
						<th className="px-4 py-2.5 font-medium">Prop</th>
						<th className="px-4 py-2.5 font-medium">Type</th>
						<th className="px-4 py-2.5 font-medium">Default</th>
						<th className="px-4 py-2.5 font-medium">Description</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((r) => (
						<tr key={r.name} className="border-b border-fd-border/60 align-top last:border-0">
							<td className="px-4 py-2.5 font-mono text-[13px] font-medium text-fd-primary">
								{r.name}
								{r.required ? <span className="ml-1 text-red-500">*</span> : null}
							</td>
							<td className="px-4 py-2.5 font-mono text-[13px] text-fd-muted-foreground">
								{r.type}
							</td>
							<td className="px-4 py-2.5 font-mono text-[13px] text-fd-muted-foreground">
								{r.default ?? '—'}
							</td>
							<td className="px-4 py-2.5 text-fd-muted-foreground">{r.description}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
