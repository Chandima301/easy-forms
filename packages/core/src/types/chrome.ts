// Chrome component prop types. GroupRenderer lives OUT of core, in the registry
// (ejectable) — every call site is itself a registry file that imports it
// directly. This is the prop shape those ejected renderers type themselves with.
import type { Group } from './group';

export interface GroupRendererProps {
	// Group is generic in TFormData; the renderer only iterates structure.
	// biome-ignore lint/suspicious/noExplicitAny: variance dodge, matches engine.
	group: Group<any>;
	depth?: number;
}
