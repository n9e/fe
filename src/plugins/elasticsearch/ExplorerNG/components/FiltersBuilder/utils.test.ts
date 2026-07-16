/// <reference types="jest" />

import { describeFilter, toBuilderValues, toQueryFilter } from './utils';

describe('ES FiltersBuilder utils', () => {
  it('maps = to an AND query filter', () => {
    expect(toQueryFilter({ field: 'status', operator: '=', value: '500', disabled: true })).toEqual({
      key: 'status',
      operator: 'AND',
      value: '500',
      disabled: true,
    });
  });

  it('maps != to a NOT query filter', () => {
    expect(toQueryFilter({ field: 'status', operator: '!=', value: '200' })).toEqual({
      key: 'status',
      operator: 'NOT',
      value: '200',
      disabled: false,
    });
  });

  it('maps exists to an EXISTS query filter without value', () => {
    expect(toQueryFilter({ field: 'trace_id', operator: 'exists', value: 'ignored' })).toEqual({
      key: 'trace_id',
      operator: 'EXISTS',
      value: '',
      disabled: false,
    });
  });

  it('maps stored filters back to builder values', () => {
    expect(toBuilderValues({ key: 'status', operator: 'AND', value: '500' })).toEqual({
      field: 'status',
      operator: '=',
      value: '500',
      disabled: false,
    });
    expect(toBuilderValues({ key: 'status', operator: 'NOT', value: '200', disabled: true })).toEqual({
      field: 'status',
      operator: '!=',
      value: '200',
      disabled: true,
    });
    expect(toBuilderValues({ key: 'trace_id', operator: 'EXISTS', value: '' })).toEqual({
      field: 'trace_id',
      operator: 'exists',
      value: undefined,
      disabled: false,
    });
  });

  it('formats filter descriptions', () => {
    expect(describeFilter({ key: 'status', operator: 'AND', value: '500' })).toBe('status: 500');
    expect(describeFilter({ key: 'status', operator: 'NOT', value: '200' })).toBe('NOT status: 200');
    expect(describeFilter({ key: 'trace_id', operator: 'EXISTS', value: '' })).toBe('trace_id exists');
  });
});
