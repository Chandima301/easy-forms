import type { ReactNode } from 'react';
import type { FormStore } from '../store/types';
import { FormStoreContext } from './FormStoreContext';

export interface FormStoreProviderProps {
	store: FormStore;
	children: ReactNode;
}

export function FormStoreProvider({ store, children }: FormStoreProviderProps) {
	return <FormStoreContext.Provider value={store}>{children}</FormStoreContext.Provider>;
}
