// Renderer registry types.
//
// Each control gets a renderer typed against ITS variant of the Question union
// (e.g. the renderer registered under `text` receives `TextQuestion`, not the
// broad `Question` union). The Field component dispatches by control key.
//
// All dynamic display props (hidden / required / readOnly / disabled /
// options / minDate / etc.) are merged into `question` by <Field> before it
// calls the renderer — so renderers simply read `props.question.options`
// instead of consulting a separate `computed` map.

import type { ComponentType } from 'react';
import type { BaseQuestion, ControlType, Question } from './controls';

/**
 * Extracts the `TValue` parameter from a Question variant. Each per-control
 * config extends `BaseQuestion<TControl, TValue, ...>`, so this reads the
 * second type argument back out.
 */
export type ValueOf<Q extends Question> = Q extends BaseQuestion<
	infer _C,
	infer V,
	infer _F,
	infer _D
>
	? V
	: never;

export interface RendererProps<TQuestion extends Question = Question> {
	/**
	 * The question with all dynamic runtime overrides already merged in —
	 * options, required, readOnly, minDate, placeholder, etc. — so renderers
	 * read straight from this object.
	 */
	question: TQuestion;
	value: ValueOf<TQuestion>;
	onChange: (value: ValueOf<TQuestion>) => void;
	onBlur: () => void;
	error: string | null;
	errors: Record<string, string>;
	touched: boolean;
	dirty: boolean;
}

export type Renderer<TQuestion extends Question = Question> = ComponentType<
	RendererProps<TQuestion>
>;

/**
 * Registry maps each control key to a renderer typed against that control's
 * Question variant. Registering a Dropdown renderer under `text` is a TS error.
 */
export type RendererRegistry = {
	[K in ControlType]?: ComponentType<RendererProps<Extract<Question, { control: K }>>>;
};
