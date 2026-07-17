/// <reference types="jest" />

jest.mock('lodash', () => {
  const lodash = jest.requireActual('lodash');
  return {
    __esModule: true,
    default: lodash,
    ...lodash,
  };
});

jest.mock(
  '@/utils/constant',
  () => ({
    __esModule: true,
    DatasourceCateEnum: {
      prometheus: 'prometheus',
      elasticsearch: 'elasticsearch',
      pgsql: 'pgsql',
      mysql: 'mysql',
      cloudwatch: 'cloudwatch',
      gcm: 'gcm',
    },
  }),
  { virtual: true },
);

import { isQueryVariableMultiSelectEnabled } from './queryUtils';

describe('isQueryVariableMultiSelectEnabled', () => {
  test('keeps existing datasource types enabled', () => {
    expect(isQueryVariableMultiSelectEnabled('prometheus')).toBe(true);
    expect(isQueryVariableMultiSelectEnabled('elasticsearch')).toBe(true);
    expect(isQueryVariableMultiSelectEnabled('pgsql')).toBe(true);
    expect(isQueryVariableMultiSelectEnabled('mysql')).toBe(true);
  });

  test('enables cloudwatch only for dimensionValues queries', () => {
    expect(isQueryVariableMultiSelectEnabled('cloudwatch', 'dimensionValues')).toBe(true);
    expect(isQueryVariableMultiSelectEnabled('cloudwatch', 'regions')).toBe(false);
    expect(isQueryVariableMultiSelectEnabled('cloudwatch', 'metrics')).toBe(false);
  });

  test('enables gcm only for labelValues queries', () => {
    expect(isQueryVariableMultiSelectEnabled('gcm', 'labelValues')).toBe(true);
    expect(isQueryVariableMultiSelectEnabled('gcm', 'projects')).toBe(false);
    expect(isQueryVariableMultiSelectEnabled('gcm', 'services')).toBe(false);
    expect(isQueryVariableMultiSelectEnabled('gcm', 'metricTypes')).toBe(false);
    expect(isQueryVariableMultiSelectEnabled('gcm', 'labelKeys')).toBe(false);
    expect(isQueryVariableMultiSelectEnabled('gcm', 'resourceTypes')).toBe(false);
    expect(isQueryVariableMultiSelectEnabled('gcm', 'aggregations')).toBe(false);
    expect(isQueryVariableMultiSelectEnabled('gcm', 'aligners')).toBe(false);
    expect(isQueryVariableMultiSelectEnabled('gcm', 'alignmentPeriods')).toBe(false);
  });
});
