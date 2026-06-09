'use client';

import { Highlight, type PrismTheme } from 'prism-react-renderer';

/** Tuned theme that reads well on the Fumadocs card surface in both modes. */
const efTheme: PrismTheme = {
	plain: { color: '#c9d1d9', backgroundColor: 'transparent' },
	styles: [
		{ types: ['comment'], style: { color: '#8b949e', fontStyle: 'italic' } },
		{ types: ['keyword', 'builtin'], style: { color: '#ff7b72' } },
		{ types: ['string', 'char', 'attr-value'], style: { color: '#a5d6ff' } },
		{ types: ['number', 'boolean'], style: { color: '#79c0ff' } },
		{ types: ['function', 'method'], style: { color: '#d2a8ff' } },
		{ types: ['property', 'attr-name'], style: { color: '#7ee787' } },
		{ types: ['punctuation', 'operator'], style: { color: '#c9d1d9' } },
		{ types: ['class-name', 'maybe-class-name'], style: { color: '#ffa657' } },
	],
};

export function CodePane({
	code,
	language = 'tsx',
	className,
	highlightKey,
}: {
	code: string;
	language?: string;
	className?: string;
	/** When set, lines containing this token get a subtle highlight band. */
	highlightKey?: string | null;
}) {
	return (
		<Highlight code={code.trim()} language={language} theme={efTheme}>
			{({ tokens, getLineProps, getTokenProps }) => (
				<pre
					className={[
						'overflow-auto p-4 font-mono text-[13px] leading-relaxed',
						className ?? '',
					].join(' ')}
				>
					{tokens.map((line, i) => {
						const text = line.map((t) => t.content).join('');
						const hit = highlightKey && text.includes(highlightKey);
						const lineProps = getLineProps({ line });
						return (
							<div
								key={`line-${i}`}
								{...lineProps}
								className={[
									lineProps.className ?? '',
									'transition-colors duration-300',
									hit ? '-mx-4 bg-fd-primary/15 px-4' : '',
								].join(' ')}
							>
								{line.map((token, key) => (
									<span key={`tok-${key}`} {...getTokenProps({ token })} />
								))}
							</div>
						);
					})}
				</pre>
			)}
		</Highlight>
	);
}
