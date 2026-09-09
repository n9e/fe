/** @jest-environment jsdom */
jest.mock('@/utils', () => ({
  getDefaultDatasourceValue: jest.fn(),
  setDefaultDatasourceValue: jest.fn(),
}));
jest.mock('@/utils/constant', () => ({
  IS_ENT: false,
  N9E_PATHNAME: 'n9e',
}));
jest.mock('@/components/TimeRangePicker/config', () => ({ rangeOptions: [] }));
jest.mock('@/components/TimeRangePicker', () => ({
  getDefaultValue: jest.fn(),
  isValid: jest.fn(),
}));

import { getDatasourceValue } from './index';

describe('getDatasourceValue', () => {
  it('resolves v5 datasource names to IDs and leaves unknown names unresolved', () => {
    expect(getDatasourceValue({ version: '2.0.0', datasourceValue: 'prom-main' }, [{ id: 7, name: 'prom-main' }] as never)).toBe(7);
    expect(getDatasourceValue({ version: '2.0.0', datasourceValue: 'missing' }, [{ id: 7, name: 'prom-main' }] as never)).toBeUndefined();
  });
});
