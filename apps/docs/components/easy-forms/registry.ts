import { CheckboxListRenderer } from '@/components/easy-forms/checkbox-list-renderer';
import { CheckboxRenderer } from '@/components/easy-forms/checkbox-renderer';
import { CustomRenderer } from '@/components/easy-forms/custom-renderer';
import { DateRenderer } from '@/components/easy-forms/date-renderer';
import { DropdownRenderer } from '@/components/easy-forms/dropdown-renderer';
import { EmailRenderer } from '@/components/easy-forms/email-renderer';
import { FileRenderer } from '@/components/easy-forms/file-renderer';
import { GroupRenderer } from '@/components/easy-forms/group-renderer';
import { MultiSelectRenderer } from '@/components/easy-forms/multiselect-renderer';
import { NumberRenderer } from '@/components/easy-forms/number-renderer';
import { RadioGroupRenderer } from '@/components/easy-forms/radio-group-renderer';
import { TextRenderer } from '@/components/easy-forms/text-renderer';
import { TextAreaRenderer } from '@/components/easy-forms/textarea-renderer';
import type { ChromeRegistry, RendererRegistry } from '@easy-forms/core';

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

export const easyFormsChromeRegistry: ChromeRegistry = { GroupRenderer };
