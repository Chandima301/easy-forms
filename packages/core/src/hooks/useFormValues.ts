import { useFormState } from './useFormState';

/** Returns the entire values object. Re-renders on any field change. */
export function useFormValues<T extends Record<string, unknown> = Record<string, unknown>>(): T {
	return useFormState().values as T;
}
