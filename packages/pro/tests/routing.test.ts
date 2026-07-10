import { describe, expect, it } from 'vitest';
import { projectPath, resolveNext } from '../src/wizard/routing';
import type { AdvancedWizardConfig, AdvancedWizardStep } from '../src/wizard/types';

const step = (id: string, next?: AdvancedWizardStep['next']): AdvancedWizardStep => ({
	id,
	title: id,
	groups: [],
	next,
});

const config = (steps: AdvancedWizardStep[], start?: string): AdvancedWizardConfig => ({
	steps,
	start,
});

describe('resolveNext', () => {
	it('advances to the next step in array order when `next` is omitted', () => {
		const a = step('a');
		const cfg = config([a, step('b'), step('c')]);
		expect(resolveNext(cfg, a, {})).toBe('b');
	});

	it('returns null (terminal) for the last step when `next` is omitted', () => {
		const b = step('b');
		const cfg = config([step('a'), b]);
		expect(resolveNext(cfg, b, {})).toBeNull();
	});

	it('follows a static string `next` regardless of order', () => {
		const a = step('a', 'c');
		const cfg = config([a, step('b'), step('c')]);
		expect(resolveNext(cfg, a, {})).toBe('c');
	});

	it('takes the first satisfied predicate route', () => {
		const a = step('a', [
			{ fieldNames: ['kind'], when: (v) => v.kind === 'business', to: 'biz' },
			{ fieldNames: ['kind'], when: (v) => v.kind === 'personal', to: 'person' },
		]);
		const cfg = config([a, step('biz'), step('person')]);
		expect(resolveNext(cfg, a, { kind: 'personal' })).toBe('person');
		expect(resolveNext(cfg, a, { kind: 'business' })).toBe('biz');
	});

	it('treats a trailing `when: () => true` route as the default/else', () => {
		const a = step('a', [
			{ fieldNames: ['kyc'], when: (v) => v.kyc === true, to: 'review' },
			{ fieldNames: [], when: () => true, to: 'fallback' },
		]);
		const cfg = config([a, step('review'), step('fallback')]);
		expect(resolveNext(cfg, a, { kyc: false })).toBe('fallback');
	});

	it('returns null when no predicate route matches', () => {
		const a = step('a', [{ fieldNames: ['x'], when: (v) => v.x === 1, to: 'b' }]);
		const cfg = config([a, step('b')]);
		expect(resolveNext(cfg, a, { x: 999 })).toBeNull();
	});

	it('passes only the route `fieldNames` into `when`', () => {
		let seen: Record<string, unknown> | undefined;
		const a = step('a', [
			{
				fieldNames: ['wanted'],
				when: (v) => {
					seen = v;
					return true;
				},
				to: 'b',
			},
		]);
		const cfg = config([a, step('b')]);
		resolveNext(cfg, a, { wanted: 1, other: 2 });
		expect(seen).toEqual({ wanted: 1 });
	});

	it('honours an explicit `terminal` flag over any `next`', () => {
		const a = step('a', 'b');
		a.terminal = true;
		const cfg = config([a, step('b')]);
		expect(resolveNext(cfg, a, {})).toBeNull();
	});
});

describe('projectPath', () => {
	it('returns the back-stack then the greedily-resolved forward path', () => {
		const cfg = config([step('a'), step('b'), step('c')]);
		expect(projectPath(cfg, ['a'], {})).toEqual(['a', 'b', 'c']);
	});

	it('projects the forward path through a branch on current answers', () => {
		const cfg = config([
			step('start', [
				{ fieldNames: ['kind'], when: (v) => v.kind === 'business', to: 'biz' },
				{ fieldNames: [], when: () => true, to: 'person' },
			]),
			step('biz', 'done'),
			step('person', 'done'),
			step('done'),
		]);
		expect(projectPath(cfg, ['start'], { kind: 'business' })).toEqual(['start', 'biz', 'done']);
		expect(projectPath(cfg, ['start'], { kind: 'personal' })).toEqual(['start', 'person', 'done']);
	});

	it('keeps the visited back-stack even if answers now project elsewhere', () => {
		const cfg = config([
			step('start', [
				{ fieldNames: ['kind'], when: (v) => v.kind === 'business', to: 'biz' },
				{ fieldNames: [], when: () => true, to: 'person' },
			]),
			step('biz', 'done'),
			step('person', 'done'),
			step('done'),
		]);
		// User walked start -> person, then went back and changed kind to business.
		// The taken back-stack (start, person) is preserved; forward re-projects.
		expect(projectPath(cfg, ['start', 'person'], { kind: 'business' })).toEqual([
			'start',
			'person',
			'done',
		]);
	});

	it('stops projecting on a repeat to guard against cyclic routes', () => {
		const cfg = config([step('a', 'b'), step('b', 'a')]);
		expect(projectPath(cfg, ['a'], {})).toEqual(['a', 'b']);
	});
});
