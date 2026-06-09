// Validation pipeline.
//
// Order:
//   1. Run built-in sync validators (required → length → range → pattern → email).
//      Collect ALL failing errors (criteriaMode: all behavior).
//   2. Invoke custom validators ONCE. A custom can be sync (returns string|null)
//      or async (returns a Promise). Sync results merge into `errors`; async
//      promises are returned as `pending` for the store to await separately.
//      Customs are only invoked once — `runAsyncCustoms` consumes the
//      already-issued promises rather than calling the functions again.
//   3. If any sync error exists (built-in or custom-sync), the store reports
//      it immediately. Async results merge later only if no sync error wins.
//      Race protection: an `isStale` check discards results whose value changed
//      before they resolved.

import type { CustomValidator } from '../types/validators';
import { BUILT_IN_VALIDATORS } from './builtIns';

export interface PendingCustom {
	name: string;
	promise: Promise<string | null>;
}

interface CustomEntry {
	name: string;
	fn: CustomValidator<unknown, Record<string, unknown>>;
}

function collectCustom(validators: Record<string, unknown>): CustomEntry[] {
	const raw = validators.custom;
	if (!raw) return [];
	if (typeof raw === 'function') {
		return [{ name: 'custom', fn: raw as CustomEntry['fn'] }];
	}
	if (typeof raw === 'object') {
		return Object.entries(raw as Record<string, CustomEntry['fn']>).map(([name, fn]) => ({
			name,
			fn,
		}));
	}
	return [];
}

/** Runs sync built-ins + customs (sync inline, async promises returned for later). */
export function runSyncValidators(
	validators: Record<string, unknown> | undefined,
	value: unknown,
	allValues: Record<string, unknown>
): { errors: Record<string, string>; pendingCustoms: PendingCustom[] } {
	const errors: Record<string, string> = {};
	if (!validators) return { errors, pendingCustoms: [] };

	for (const [name, fn] of BUILT_IN_VALIDATORS) {
		if (validators[name] === undefined) continue;
		const result = fn(validators[name], value, allValues);
		if (result) errors[name] = result;
	}

	const pendingCustoms: PendingCustom[] = [];
	for (const entry of collectCustom(validators)) {
		const result = entry.fn(value, allValues);
		if (result instanceof Promise) {
			pendingCustoms.push({ name: entry.name, promise: result });
		} else if (result) {
			errors[entry.name] = result;
		}
	}

	return { errors, pendingCustoms };
}

/** Awaits the already-issued async custom promises. Honors a stale check. */
export async function runAsyncCustoms(
	pending: PendingCustom[],
	isStale: () => boolean
): Promise<Record<string, string>> {
	const errors: Record<string, string> = {};
	const results = await Promise.all(
		pending.map(async (p) => [p.name, await p.promise] as const)
	);
	if (isStale()) return {};
	for (const [name, out] of results) {
		if (out) errors[name] = out;
	}
	return errors;
}

export function firstError(errors: Record<string, string>): string | null {
	const keys = Object.keys(errors);
	if (keys.length === 0) return null;
	const first = keys[0];
	return first ? (errors[first] ?? null) : null;
}
