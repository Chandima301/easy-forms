import type { DependencyHandlerRegistry } from '../types';
import { propsDependsOnHandler } from './propsDependsOn';
import { resetDependsOnHandler } from './resetDependsOn';
import { valueDependsOnHandler } from './valueDependsOn';

export { propsDependsOnHandler } from './propsDependsOn';
export { resetDependsOnHandler } from './resetDependsOn';
export { valueDependsOnHandler } from './valueDependsOn';

/**
 * Default registry — the 3 built-in dependency kinds.
 * Spread this into the `dependencyHandlers` <Form> prop to add your own:
 *
 *   <Form
 *     dependencyHandlers={{
 *       ...defaultDependencyHandlers,
 *       myCustomDep: myHandler,
 *     }}
 *   />
 */
export const defaultDependencyHandlers: DependencyHandlerRegistry = {
	propsDependsOn: propsDependsOnHandler as never,
	valueDependsOn: valueDependsOnHandler as never,
	resetDependsOn: resetDependsOnHandler as never,
};
