import { describe, expect, it } from 'vitest';
import { repeatingGroupValidators } from '../src/controls/repeatingGroupValidators';

describe('repeatingGroupValidators', () => {
	it('returns an empty object when neither bound is set', () => {
		expect(repeatingGroupValidators({})).toEqual({});
	});

	it('maps minItems to an array minLength rule with an item-aware message', () => {
		expect(repeatingGroupValidators({ minItems: 2 })).toEqual({
			minLength: { value: 2, message: 'Add at least 2 items' },
		});
	});

	it('maps maxItems to an array maxLength rule with an item-aware message', () => {
		expect(repeatingGroupValidators({ maxItems: 3 })).toEqual({
			maxLength: { value: 3, message: 'Add at most 3 items' },
		});
	});

	it('singularises the message for a bound of 1', () => {
		expect(repeatingGroupValidators({ minItems: 1 })).toEqual({
			minLength: { value: 1, message: 'Add at least 1 item' },
		});
	});

	it('maps both bounds together', () => {
		expect(repeatingGroupValidators({ minItems: 1, maxItems: 5 })).toEqual({
			minLength: { value: 1, message: 'Add at least 1 item' },
			maxLength: { value: 5, message: 'Add at most 5 items' },
		});
	});
});
