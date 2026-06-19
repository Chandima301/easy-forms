// Assembled renderer registry — maps each control key to its renderer. Passed
// to <Form> by the <EasyForm> wrapper. Edit freely: add a control by importing a
// renderer and adding a line; swap a renderer by pointing the key at your own.

import { CheckboxListRenderer } from '@/components/easy-forms/checkbox-list-renderer';
import { CheckboxRenderer } from '@/components/easy-forms/checkbox-renderer';
import { CustomRenderer } from '@/components/easy-forms/custom-renderer';
import { DateRenderer } from '@/components/easy-forms/date-renderer';
import { DropdownRenderer } from '@/components/easy-forms/dropdown-renderer';
import { EmailRenderer } from '@/components/easy-forms/email-renderer';
import { FileRenderer } from '@/components/easy-forms/file-renderer';
import { MultiSelectRenderer } from '@/components/easy-forms/multiselect-renderer';
import { NumberRenderer } from '@/components/easy-forms/number-renderer';
import { RadioGroupRenderer } from '@/components/easy-forms/radio-group-renderer';
import { TextRenderer } from '@/components/easy-forms/text-renderer';
import { TextAreaRenderer } from '@/components/easy-forms/textarea-renderer';
import type { RendererRegistry } from '@easy-forms/core';

export const easyFormsRegistry: RendererRegistry = {
	text: TextRenderer,
	textarea: TextAreaRenderer,
	number: NumberRenderer,
	email: EmailRenderer,
	dropdown: DropdownRenderer,
	multiselect: MultiSelectRenderer,
	checkbox: CheckboxRenderer,
	checkboxList: CheckboxListRenderer,
	radioGroup: RadioGroupRenderer,
	date: DateRenderer,
	file: FileRenderer,
	custom: CustomRenderer,
};
