// @easy-forms/shadcn — default renderer registry.

import type { RendererRegistry } from '@easy-forms/core';
import { CheckboxListRenderer } from './renderers/CheckboxListRenderer';
import { CheckboxRenderer } from './renderers/CheckboxRenderer';
import { CustomRenderer } from './renderers/CustomRenderer';
import { DateRenderer } from './renderers/DateRenderer';
import { DropdownRenderer } from './renderers/DropdownRenderer';
import { EmailRenderer } from './renderers/EmailRenderer';
import { FileRenderer } from './renderers/FileRenderer';
import { MultiSelectRenderer } from './renderers/MultiSelectRenderer';
import { NumberRenderer } from './renderers/NumberRenderer';
import { RadioGroupRenderer } from './renderers/RadioGroupRenderer';
import { TextAreaRenderer } from './renderers/TextAreaRenderer';
import { TextRenderer } from './renderers/TextRenderer';

export const shadcnRegistry: RendererRegistry = {
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

// Renderers — individually exported for granular override / composition.
export { CheckboxListRenderer } from './renderers/CheckboxListRenderer';
export { CheckboxRenderer } from './renderers/CheckboxRenderer';
export { CustomRenderer } from './renderers/CustomRenderer';
export { DateRenderer } from './renderers/DateRenderer';
export { DropdownRenderer } from './renderers/DropdownRenderer';
export { EmailRenderer } from './renderers/EmailRenderer';
export { FileRenderer } from './renderers/FileRenderer';
export { MultiSelectRenderer } from './renderers/MultiSelectRenderer';
export { NumberRenderer } from './renderers/NumberRenderer';
export { RadioGroupRenderer } from './renderers/RadioGroupRenderer';
export { TextAreaRenderer } from './renderers/TextAreaRenderer';
export { TextRenderer } from './renderers/TextRenderer';

// Primitives — exposed so consumers can compose their own renderers.
export { Button } from './primitives/Button';
export type { ButtonProps } from './primitives/Button';
export { Checkbox } from './primitives/Checkbox';
export { FieldShell } from './primitives/FieldShell';
export type { FieldShellProps } from './primitives/FieldShell';
export { Input } from './primitives/Input';
export type { InputProps } from './primitives/Input';
export { Label } from './primitives/Label';
export { Popover, PopoverContent, PopoverTrigger } from './primitives/Popover';
export { RadioGroup, RadioGroupItem } from './primitives/RadioGroup';
export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './primitives/Select';
export { Textarea } from './primitives/Textarea';
export type { TextareaProps } from './primitives/Textarea';
export { cn } from './lib/cn';
