import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createFormStore } from '../store';
import { useFormState } from './useFormState';

function Probe({ store }: { store: ReturnType<typeof createFormStore> }) {
	const { isDirty, isSubmitting } = useFormState(store);
	return <div>{`dirty:${isDirty} submitting:${isSubmitting}`}</div>;
}

describe('useFormState(store)', () => {
	it('reads a store passed by argument, with no FormStoreProvider present', () => {
		const store = createFormStore({});
		render(<Probe store={store} />);
		expect(screen.getByText('dirty:false submitting:false')).toBeInTheDocument();
	});
});
