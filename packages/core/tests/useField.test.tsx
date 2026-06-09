import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { FormStoreProvider } from '../src/context/FormStoreProvider';
import { useField } from '../src/hooks/useField';
import { useFormState } from '../src/hooks/useFormState';
import { createFormStore } from '../src/store/createFormStore';

function Wrapper({ children, store }: { children: React.ReactNode; store: ReturnType<typeof createFormStore> }) {
	return <FormStoreProvider store={store}>{children}</FormStoreProvider>;
}

function Field({ name, render }: { name: string; render: (n: number) => void }) {
	const field = useField<string>(name);
	useEffect(() => render(1));
	return (
		<label>
			{name}
			<input value={field.value ?? ''} onChange={(e) => field.setValue(e.target.value)} />
		</label>
	);
}

describe('useField + useFormState (subscription correctness)', () => {
	it('changing one field only re-renders that field, not its sibling', async () => {
		const store = createFormStore();
		store.registerField({ key: 'a', initialValue: 'A' });
		store.registerField({ key: 'b', initialValue: 'B' });
		const renderA = vi.fn();
		const renderB = vi.fn();
		render(
			<Wrapper store={store}>
				<Field name="a" render={renderA} />
				<Field name="b" render={renderB} />
			</Wrapper>
		);
		renderA.mockClear();
		renderB.mockClear();
		await userEvent.type(screen.getByLabelText('a'), 'X');
		expect(renderA).toHaveBeenCalled();
		expect(renderB).not.toHaveBeenCalled();
	});

	it('useFormState reflects isDirty changes', () => {
		const store = createFormStore();
		store.registerField({ key: 'n', initialValue: 'init' });
		function Probe() {
			const { isDirty } = useFormState();
			return <div data-testid="dirty">{String(isDirty)}</div>;
		}
		render(
			<Wrapper store={store}>
				<Probe />
			</Wrapper>
		);
		expect(screen.getByTestId('dirty').textContent).toBe('false');
		act(() => {
			store.setValue('n', 'changed', { validate: false });
		});
		expect(screen.getByTestId('dirty').textContent).toBe('true');
	});
});
