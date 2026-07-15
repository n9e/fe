import { Field } from '../../../types';

import getOperatorsByTypeIndex from './getOperatorsByTypeIndex';

function field(normalized_type: string): Field {
  return { field: 'test_field', type: normalized_type, normalized_type } as Field;
}

describe('getOperatorsByTypeIndex', () => {
  it.each([
    ['long', ['=', '!=', '>', '<', '>=', '<=', 'in', 'not-in', 'is-null', 'is-not-null', 'between', 'not-between']],
    ['date', ['=', '!=', '>', '<', '>=', '<=', 'in', 'not-in', 'is-null', 'is-not-null', 'between', 'not-between']],
    ['text', ['=', '!=', 'in', 'not-in', 'is-null', 'is-not-null', 'like', 'not-like', 'ilike', 'not_ilike', 'match', 'not_match', 'has_token']],
    ['bool', ['=', '!=', 'in', 'not-in', 'is-null', 'is-not-null']],
    ['ipv4', ['=', '!=', 'in', 'not-in', 'is-null', 'is-not-null']],
    ['json', ['is-null', 'is-not-null']],
    ['map', ['is-null', 'is-not-null']],
  ])('returns only operators supported by %s', (normalizedType, expected) => {
    expect(getOperatorsByTypeIndex(field(normalizedType))).toEqual(expected);
  });

  it('returns no operators for an unknown type', () => {
    expect(getOperatorsByTypeIndex(field('array'))).toEqual([]);
  });
});
