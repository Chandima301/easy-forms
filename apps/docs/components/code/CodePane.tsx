'use client';

import { Highlight, type PrismTheme } from 'prism-react-renderer';

/**
 * Theme-aware palette: token colors resolve from CSS variables (defined in
 * `global.css`), so the same theme reads as GitHub-light on the light surface
 * and GitHub-dark on the dark surface — no per-mode theme swap needed.
 */
const efTheme: PrismTheme = {
	plain: { color: 'var(--ef-code-plain)', backgroundColor: 'transparent' },
	styles: [
		{ types: ['comment'], style: { color: 'var(--ef-code-comment)', fontStyle: 'italic' } },
		{ types: ['keyword', 'builtin'], style: { color: 'var(--ef-code-keyword)' } },
		{ types: ['string', 'char', 'attr-value'], style: { color: 'var(--ef-code-string)' } },
		{ types: ['number', 'boolean'], style: { color: 'var(--ef-code-number)' } },
		{ types: ['function', 'method'], style: { color: 'var(--ef-code-function)' } },
		{ types: ['property', 'attr-name'], style: { color: 'var(--ef-code-property)' } },
		{ types: ['punctuation', 'operator'], style: { color: 'var(--ef-code-plain)' } },
		{ types: ['class-name', 'maybe-class-name'], style: { color: 'var(--ef-code-class)' } },
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
