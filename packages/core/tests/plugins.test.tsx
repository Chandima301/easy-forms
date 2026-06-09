import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Form } from '../src/components/Form';
import { autosavePlugin } from '../src/plugins/builtIns/autosavePlugin';
import { loggerPlugin } from '../src/plugins/builtIns/loggerPlugin';
import { definePlugin } from '../src/plugins/types';
import type { FormSchema, TextQuestion } from '../src/types';
import type { RendererProps, RendererRegistry } from '../src/types/renderer';

function TextR(props: RendererProps<TextQuestion>) {
	return (
		<label>
			{props.question.label}
			<input
				aria-label={props.question.key}
				value={props.value ?? ''}
				onChange={(e) => props.onChange(e.target.value)}
				onBlur={props.onBlur}
			/>
		</label>
	);
}
const registry: RendererRegistry = { text: TextR };
const schema: FormSchema = {
	groups: [
		{ questions: [{ key: 'name', label: 'Name', control: 'text' } as TextQuestion] },
	],
};

describe('plugins', () => {
	beforeEach(() => window.localStorage.clear());
	afterEach(() => window.localStorage.clear());

	it('definePlugin returns the plugin as-is', () => {
		const onInit = vi.fn();
		const plugin = definePlugin({ name: 'test', onInit });
		expect(plugin.name).toBe('test');
		expect(plugin.onInit).toBe(onInit);
	});

	it('fires onInit when attached and onDestroy when unmounted', () => {
		const onInit = vi.fn();
		const onDestroy = vi.fn();
		const plugin = definePlugin({ name: 't', onInit, onDestroy });
		const { unmount } = render(
			<Form
				schema={schema}
				registry={registry}
				plugins={[plugin]}
				initialValues={{ name: '' }}
				onSubmit={async () => {}}
			/>
		);
		expect(onInit).toHaveBeenCalledTimes(1);
		unmount();
		expect(onDestroy).toHaveBeenCalledTimes(1);
	});

	it('fires onChange with the changed key + value', async () => {
		const onChange = vi.fn();
		const plugin = definePlugin({ name: 't', onChange });
		render(
			<Form
				schema={schema}
				registry={registry}
				plugins={[plugin]}
				initialValues={{ name: '' }}
				onSubmit={async () => {}}
			/>
		);
		onChange.mockClear();
		await userEvent.type(screen.getByLabelText('name'), 'x');
		const lastCall = onChange.mock.calls.at(-1) ?? [];
		expect(lastCall[1]).toBe('name');
		expect(lastCall[2]).toBe('x');
	});

	it('loggerPlugin writes to its provided sink', async () => {
		const sink = { log: vi.fn(), info: vi.fn(), error: vi.fn() };
		render(
			<Form
				schema={schema}
				registry={registry}
				plugins={[loggerPlugin({ logger: sink as never })]}
				initialValues={{ name: '' }}
				onSubmit={async () => {}}
			/>
		);
		expect(sink.info).toHaveBeenCalledWith(expect.stringContaining('init'));
		await userEvent.type(screen.getByLabelText('name'), 'a');
		expect(sink.log).toHaveBeenCalledWith(expect.stringContaining('change'), 'name', 'a');
	});

	it('autosavePlugin writes values to localStorage after debounce', async () => {
		render(
			<Form
				schema={schema}
				registry={registry}
				plugins={[autosavePlugin({ key: 'easy-forms-test-autosave', delayMs: 50 })]}
				initialValues={{ name: '' }}
				onSubmit={async () => {}}
			/>
		);
		await userEvent.type(screen.getByLabelText('name'), 'hi');
		await act(async () => {
			await new Promise((r) => setTimeout(r, 100));
		});
		const stored = JSON.parse(window.localStorage.getItem('easy-forms-test-autosave') ?? '{}');
		expect(stored.name).toBe('hi');
	});
});
