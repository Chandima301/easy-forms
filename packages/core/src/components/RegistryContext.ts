import { createContext, useContext } from 'react';
import type { RendererRegistry } from '../types/renderer';

export const RendererRegistryContext = createContext<RendererRegistry | null>(null);

export function useRendererRegistry(): RendererRegistry {
	const registry = useContext(RendererRegistryContext);
	if (!registry) {
		throw new Error(
			'useRendererRegistry: no registry found. Pass `registry` to <Form> or wrap with <RendererRegistryProvider>.'
		);
	}
	return registry;
}
