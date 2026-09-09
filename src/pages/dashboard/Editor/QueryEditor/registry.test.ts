import { createDashboardQueryTarget } from './registry';

jest.mock('./QueryBuilder', () => () => null);
jest.mock('@/pages/dashboard/utils/getDefaultTargets', () => () => [{ refId: 'A' }]);

describe('dashboard query editor registry', () => {
  it('creates SLS queries with an explicit default mode', () => {
    expect(createDashboardQueryTarget('aliyun-sls', 10, 'B')).toMatchObject({
      refId: 'B',
      kind: 'query',
      datasource: {
        cate: 'aliyun-sls',
        id: 10,
      },
      resultType: 'time_series',
      query: {
        mode: 'timeSeries',
        power_sql: false,
        time_series: true,
        removeFirstAndLastPoints: false,
      },
    });
  });
});
