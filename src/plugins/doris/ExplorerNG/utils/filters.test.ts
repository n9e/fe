/// <reference types="jest" />

import { getEnabledFilters } from './filters';

describe('doris filter utils', () => {
  it('filters out disabled filters', () => {
    expect(
      getEnabledFilters([
        { field: 'host', operator: '=', value: 'a' },
        { field: 'status', operator: '=', value: 500, disabled: true },
        { field: 'path', operator: 'LIKE', value: '/api', disabled: false },
      ]),
    ).toEqual([
      { field: 'host', operator: '=', value: 'a' },
      { field: 'path', operator: 'LIKE', value: '/api', disabled: false },
    ]);
  });
});
