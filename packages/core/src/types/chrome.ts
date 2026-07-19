// Chrome component prop types. GroupRenderer moved OUT of core into the registry
// (ejectable), but core + Pro must reference its prop shape to type the injected
// component in ChromeRegistryContext.
import type { Group } from './group';

export interface GroupRendererProps {
	// Group is generic in TFormData; the renderer only iterates structure.
	// biome-ignore lint/suspicious/noExplicitAny: variance dodge, matches engine.
	group: Group<any>;
	depth?: number;
}
