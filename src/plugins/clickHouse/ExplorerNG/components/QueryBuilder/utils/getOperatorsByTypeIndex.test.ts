import { Field } from '../../../types';

import getOperatorsByTypeIndex from './getOperatorsByTypeIndex';

function field(normalized_type: string): Field {
  return { field: 'test_field', type: normalized_type, normalized_type } as Field;
}

describe('getOperatorsByTypeIndex', () => {
  it.each([
    ['long', ['=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL', 'BETWEEN AND', 'NOT BETWEEN AND']],
    ['date', ['=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL', 'BETWEEN AND', 'NOT BETWEEN AND']],
    ['text', ['=', '!=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL', 'LIKE', 'NOT LIKE', 'ILIKE', 'NOT ILIKE', 'match', 'NOT match', 'hasToken']],
    ['bool', ['=', '!=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL']],
    ['ipv4', ['=', '!=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL', 'BETWEEN AND', 'NOT BETWEEN AND']],
    ['ipv6', ['=', '!=', 'IN', 'NOT IN', 'IS NULL', 'IS NOT NULL', 'BETWEEN AND', 'NOT BETWEEN AND']],
    ['json', ['IS NULL', 'IS NOT NULL']],
    ['map', ['IS NULL', 'IS NOT NULL']],
  ])('returns only operators supported by %s', (normalizedType, expected) => {
    expect(getOperatorsByTypeIndex(field(normalizedType))).toEqual(expected);
  });

  it('returns no operators for an unknown type', () => {
    expect(getOperatorsByTypeIndex(field('array'))).toEqual([]);
  });
});
