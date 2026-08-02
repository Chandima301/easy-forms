/**
 * Sidebar marker for pages documenting a Pro-only feature.
 *
 * Rendered by the page-tree plugin in `lib/source.ts`, not from MDX — hence it
 * lives beside the other sidebar chrome rather than in `components/mdx/`.
 *
 * The visual pill is `aria-hidden` and the announcement is carried by a
 * separate sr-only span. Without that split the pill's text concatenates
 * straight onto the page name in the link's accessible name (accname joins
 * inline elements without adding whitespace), so "Repeating groups" would be
 * announced as "Repeating groupsPro".
 */
export function ProChip() {
	return (
		<>
			<span
				aria-hidden="true"
				className="ml-1.5 inline-block rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 px-1.5 py-px align-middle text-[9px] font-bold uppercase leading-[1.4] tracking-wide text-white"
			>
				Pro
			</span>
			<span className="sr-only"> (Pro feature)</span>
		</>
	);
}
