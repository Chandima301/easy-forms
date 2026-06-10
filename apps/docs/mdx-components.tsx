import { LiveForm } from '@/components/demo/LiveForm';
import {
	CheckboxRequiredDemo,
	CheckoutWizardDemo,
	ConditionalGroupsDemo,
	DependentDropdownsDemo,
	OrderCalculatorDemo,
	PropsDependsOnDemo,
	SignupDemo,
	ValueDependsOnDemo,
	WizardDemo,
} from '@/components/demo/examples';
import { PackageInstall } from '@/components/mdx/PackageInstall';
import { PropsTable } from '@/components/mdx/PropsTable';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Callout } from 'fumadocs-ui/components/callout';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		...defaultMdxComponents,
		Tab,
		Tabs,
		Step,
		Steps,
		Card,
		Cards,
		Accordion,
		Accordions,
		Callout,
		// Easy Forms doc components
		LiveForm,
		PackageInstall,
		PropsTable,
		// Function-bearing demos (client boundary)
		CheckboxRequiredDemo,
		PropsDependsOnDemo,
		ValueDependsOnDemo,
		ConditionalGroupsDemo,
		WizardDemo,
		SignupDemo,
		CheckoutWizardDemo,
		DependentDropdownsDemo,
		OrderCalculatorDemo,
		...components,
	};
}
