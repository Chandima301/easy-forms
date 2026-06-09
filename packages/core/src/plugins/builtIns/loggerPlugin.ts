import { definePlugin, type FormPlugin } from '../types';

export interface LoggerPluginOptions {
	/** Optional log prefix. Default `[easy-forms]`. */
	prefix?: string;
	/** Where to write. Default `console`. */
	logger?: Pick<Console, 'log' | 'info' | 'error'>;
}

/**
 * Logs every field change and submit to the console (or a custom sink).
 * Useful during development; remove or gate behind NODE_ENV in production.
 */
export function loggerPlugin(options: LoggerPluginOptions = {}): FormPlugin {
	const prefix = options.prefix ?? '[easy-forms]';
	const logger = options.logger ?? console;
	return definePlugin({
		name: 'loggerPlugin',
		onInit: () => logger.info(`${prefix} init`),
		onChange: (_, key, value) => logger.log(`${prefix} change`, key, value),
		onSubmit: (_, values) => logger.info(`${prefix} submit`, values),
		onDestroy: () => logger.info(`${prefix} destroy`),
	});
}
