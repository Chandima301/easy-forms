import { useContext } from 'react';
import type { FormStore } from '../store/types';
import { FormStoreContext } from './FormStoreContext';

export function useFormStoreContext(): FormStore {
	const store = useContext(FormStoreContext);
	if (!store) {
		throw new Error(
			'useFormStoreContext: no FormStore found. Render <FormStoreProvider> or <Form> above this component.'
		);
	}
	return store;
}
