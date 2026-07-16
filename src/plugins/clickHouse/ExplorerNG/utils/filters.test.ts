/// <reference types="jest" />

import { getEnabledFilters } from './filters';

describe('clickHouse filter utils', () => {
  it('filters out disabled filters', () => {
    expect(
      getEnabledFilters([
        { field: 'host', operator: '=', value: 'a' },
        { field: 'status', operator: '=', value: 500, disabled: true },
        { field: 'success', operator: '=', value: false, disabled: false },
      ]),
    ).toEqual([
      { field: 'host', operator: '=', value: 'a' },
      { field: 'success', operator: '=', value: false, disabled: false },
    ]);
  });
});
