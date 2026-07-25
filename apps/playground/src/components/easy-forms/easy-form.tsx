// EasyForm — the ejectable form shell. Pure chrome: it calls core's useFormRuntime
// for all behaviour (store, dependency engine, plugins) and renders only the
// container / header / body / footer. Edit freely to restyle; nothing here can
// break form behaviour.
import { GroupRenderer } from '@/components/easy-forms/group-renderer';
import { easyFormsRegistry } from '@/components/easy-forms/registry';
import { Wizard } from '@/components/easy-forms/wizard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
	type DependencyHandlerRegistry,
	type FormPlugin,
	type FormSchema,
	type FormStore,
	FormStoreProvider,
	RendererRegistryContext,
	useFormRuntime,
	useFormState,
} from '@easy-forms/core';

export interface EasyFormProps<
	TFormData extends Record<string, unknown> = Record<string, unknown>,
> {
	schema: FormSchema<TFormData>;
	initialValues?: Partial<TFormData>;
	onSubmit: (values: TFormData) => void | Promise<void>;
	store?: FormStore;
	dependencyHandlers?: DependencyHandlerRegistry;
	plugins?: FormPlugin[];
	submitLabel?: string;
	resetLabel?: string;
	showReset?: boolean;
	className?: string;
	wizardNextLabel?: string;
	wizardPreviousLabel?: string;
}

export function EasyForm<TFormData extends Record<string, unknown> = Record<string, unknown>>({
	schema,
	initialValues,
	onSubmit,
	store: externalStore,
	dependencyHandlers,
	plugins,
	submitLabel = 'Submit',
	resetLabel = 'Reset',
	showReset = false,
	className,
	wizardNextLabel,
	wizardPreviousLabel,
}: EasyFormProps<TFormData>) {
	const { store } = useFormRuntime(schema, {
		initialValues: initialValues as Record<string, unknown> | undefined,
		store: externalStore,
		dependencyHandlers,
		plugins,
	});

	const isWizard = !!schema.wizard;

	return (
		<FormStoreProvider store={store}>
			<RendererRegistryContext.Provider value={easyFormsRegistry}>
				<form
					className={cn(
						'easy-forms',
						'flex flex-col gap-6 rounded-lg border border-border bg-card text-card-foreground p-6 shadow-sm',
						className
					)}
					onSubmit={(e) => {
						e.preventDefault();
						if (isWizard) return;
						void store.submit((values) => onSubmit(values as TFormData));
					}}
					noValidate
				>
					{schema.title ? (
						<header className="easy-forms__header flex flex-col gap-1">
							<h2 className="easy-forms__title text-xl font-semibold text-foreground">
								{schema.title}
							</h2>
							{schema.description ? (
								<p className="easy-forms__description text-sm text-muted-foreground">
									{schema.description}
								</p>
							) : null}
						</header>
					) : null}
					{isWizard && schema.wizard ? (
						<Wizard
							wizard={schema.wizard}
							onSubmit={(values) => onSubmit(values as TFormData)}
							nextLabel={wizardNextLabel}
							previousLabel={wizardPreviousLabel}
							submitLabel={submitLabel}
						/>
					) : (
						<>
							<div className="easy-forms__body flex flex-col gap-6">
								{schema.groups.map((group, index) => (
									<GroupRenderer key={group.id ?? group.title ?? `root-${index}`} group={group} />
								))}
							</div>
							<FormFooter
								submitLabel={submitLabel}
								resetLabel={resetLabel}
								showReset={showReset}
								onReset={() => store.reset()}
							/>
						</>
					)}
				</form>
			</RendererRegistryContext.Provider>
		</FormStoreProvider>
	);
}

function FormFooter({
	submitLabel,
	resetLabel,
	showReset,
	onReset,
}: {
	submitLabel: string;
	resetLabel: string;
	showReset: boolean;
	onReset: () => void;
}) {
	const { isDirty, isValid, isSubmitting } = useFormState();
	return (
		<footer className="easy-forms__footer flex justify-end gap-2 border-t border-border pt-4">
			{showReset ? (
				<Button
					type="button"
					variant="outline"
					onClick={onReset}
					disabled={isSubmitting || !isDirty}
				>
					{resetLabel}
				</Button>
			) : null}
			<Button type="submit" disabled={!isDirty || !isValid || isSubmitting}>
				{isSubmitting ? '...' : submitLabel}
			</Button>
		</footer>
	);
}

export { easyFormsRegistry };
