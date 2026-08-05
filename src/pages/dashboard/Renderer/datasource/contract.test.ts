import moment from 'moment';

import type { ITarget } from '@/pages/dashboard/types';

import { buildDashboardQueryRequest, normalizeDashboardQueryResponse, validateDashboardQueryRequest } from './contract';
import dashboardDatasourceDefinitions, { DASHBOARD_DATASOURCE_CATES } from './registry';

jest.mock('./queryStep', () => ({
  getDashboardQueryStep: () => 30,
}));

jest.mock('@/components/TimeRangePicker/utils', () => ({
  parseRange: (range: { start: unknown; end: unknown }) => range,
}));

jest.mock('@/pages/dashboard/Variables/utils/replaceTemplateVariables', () => ({
  __esModule: true,
  default: (value: string) => value,
  replaceDatasourceVariables: (value: number | string) => (value === '${metrics}' ? 9 : value),
}));

describe('dashboard unified query contract', () => {
  it('registers every dashboard datasource contract', () => {
    const expectedCates = [
      'prometheus',
      'elasticsearch',
      'opensearch',
      'iotdb',
      'tdengine',
      'ck',
      'mysql',
      'pgsql',
      'doris',
      'aliyun-sls',
      'tencent-cls',
      'volc-tls',
      'huawei-lts',
      'bce-bls',
      'cloudwatchlogs',
      'oracle',
      'sqlserver',
      'redshift',
      'influxdb',
      'zabbix',
      'cloudwatch',
      'gcm',
    ];
    expect([...DASHBOARD_DATASOURCE_CATES].sort()).toEqual(expectedCates.sort());
    expect(Object.keys(dashboardDatasourceDefinitions).sort()).toEqual(expectedCates.sort());
    Object.values(dashboardDatasourceDefinitions).forEach((definition) => {
      expect(definition.resultTypes).toContain('time_series');
      expect(typeof definition.isQueryReady).toBe('function');
      expect(typeof definition.serializeTarget).toBe('function');
    });
  });

  it('provides an executable mode by default and waits for required SLS fields', () => {
    const slsDefinition = dashboardDatasourceDefinitions['aliyun-sls'];
    expect(slsDefinition.defaultTarget).toMatchObject({
      query: {
        mode: 'timeSeries',
        power_sql: false,
        time_series: true,
      },
    });

    const build = (query: Record<string, unknown>) =>
      buildDashboardQueryRequest({
        time: {
          start: moment('2026-07-24T00:00:00.000Z'),
          end: moment('2026-07-24T01:00:00.000Z'),
        },
        targets: [
          {
            refId: 'A',
            kind: 'query',
            datasource: { cate: 'aliyun-sls', id: 10 },
            query,
          },
        ],
        datasourceList: [],
      });

    expect(build({ mode: 'timeSeries' }).queries).toEqual([]);
    expect(build({ mode: 'timeSeries', project: 'n9e', logstore: 'app' }).queries).toHaveLength(1);
  });

  it('serializes Elasticsearch filter language for backend KQL execution', () => {
    expect(dashboardDatasourceDefinitions.elasticsearch.defaultTarget).toMatchObject({
      query: {
        filter_language: 'lucene',
      },
    });

    const request = buildDashboardQueryRequest({
      time: {
        start: moment('2026-07-24T00:00:00.000Z'),
        end: moment('2026-07-24T01:00:00.000Z'),
      },
      targets: [
        {
          refId: 'A',
          kind: 'query',
          datasource: { cate: 'elasticsearch', id: 12 },
          resultType: 'logs',
          query: {
            index_type: 'index',
            index: 'application-*',
            date_field: '@timestamp',
            filter: 'status >= 500',
            syntax: 'kuery',
            values: [{ func: 'rawData' }],
          },
        },
      ],
      datasourceList: [],
    });

    expect(request.queries[0]).toMatchObject({
      kind: 'query',
      datasource: { cate: 'elasticsearch', id: 12 },
      query: {
        filter: 'status >= 500',
        filter_language: 'kql',
      },
    });
    const query = request.queries[0]?.kind === 'query' ? request.queries[0].query : {};
    expect(query).not.toHaveProperty('syntax');
    expect(query).toMatchObject({ value: { func: 'rawData' } });
    expect(query).not.toHaveProperty('values');
  });

  it('expands Elasticsearch values into backend-compatible single-value queries', () => {
    const request = buildDashboardQueryRequest({
      time: {
        start: moment('2026-07-24T00:00:00.000Z'),
        end: moment('2026-07-24T01:00:00.000Z'),
      },
      targets: [
        {
          refId: 'A',
          kind: 'query',
          datasource: { cate: 'elasticsearch', id: 12 },
          query: {
            index: 'application-*',
            date_field: '@timestamp',
            values: [{ func: 'count' }, { func: 'avg', field: 'duration' }],
          },
        },
      ],
      datasourceList: [],
    });

    expect(request.queries).toMatchObject([
      { ref_id: 'A', query: { value: { func: 'count' } } },
      { ref_id: 'A__value_1', query: { value: { func: 'avg', field: 'duration' } } },
    ]);
    expect(JSON.stringify(request)).not.toContain('"values"');
  });

  it('silently skips targets that do not meet legacy datasource query prerequisites', () => {
    const build = (cate: string, query: Record<string, unknown>) =>
      buildDashboardQueryRequest({
        time: {
          start: moment('2026-07-24T00:00:00.000Z'),
          end: moment('2026-07-24T01:00:00.000Z'),
        },
        targets: [
          {
            refId: 'A',
            kind: 'query',
            datasource: { cate, id: 1 },
            query,
          },
        ],
        datasourceList: [],
      });

    expect(build('elasticsearch', { index: 'application-*' }).queries).toEqual([]);
    expect(build('elasticsearch', { index_type: 'index_pattern' }).queries).toEqual([]);
    expect(build('elasticsearch', { index: 'application-*', date_field: '@timestamp' }).queries).toHaveLength(1);
    expect(build('mysql', { query: '   ' }).queries).toEqual([]);
    expect(build('mysql', { query: 'SELECT 1' }).queries).toHaveLength(1);
    expect(build('cloudwatchlogs', { region: 'us-east-1', log_group_names: 'app' }).queries).toEqual([]);
    expect(build('cloudwatchlogs', { region: 'us-east-1', log_group_names: 'app', query_string: 'fields @message' }).queries).toHaveLength(1);
  });

  it('serializes every datasource keys field as a string for query-batch v2', () => {
    const request = buildDashboardQueryRequest({
      time: {
        start: moment('2026-07-24T00:00:00.000Z'),
        end: moment('2026-07-24T01:00:00.000Z'),
      },
      targets: [
        {
          refId: 'A',
          kind: 'query',
          datasource: { cate: 'mysql', id: 1 },
          query: {
            query: 'SELECT 1',
            keys: {
              valueKey: ['value', 'count'],
              labelKey: ['host', 'region'],
              timeKey: 'time',
            },
          },
        },
        {
          refId: 'B',
          kind: 'query',
          datasource: { cate: 'tdengine', id: 2 },
          query: {
            query: 'SELECT 1',
            keys: {
              metricKey: ['value', 'count'],
              labelKey: ['host'],
              timeFormat: '2006-01-02T15:04:05',
            },
          },
        },
      ],
      datasourceList: [],
    });

    const firstQuery = request.queries[0]?.kind === 'query' ? request.queries[0].query : {};
    const secondQuery = request.queries[1]?.kind === 'query' ? request.queries[1].query : {};
    expect(firstQuery).toMatchObject({ keys: {
      valueKey: 'value count',
      labelKey: 'host region',
      timeKey: 'time',
    } });
    expect(secondQuery).toMatchObject({ keys: {
      metricKey: 'value count',
      labelKey: 'host',
      timeFormat: '2006-01-02T15:04:05',
    } });
  });

  it('builds a mixed datasource request with only backend execution fields', () => {
    const targets: ITarget[] = [
      {
        refId: 'A',
        kind: 'query',
        datasource: { cate: 'prometheus', id: '${metrics}' },
        expr: 'rate(http_requests_total[5m])',
        timezone: 'Asia/Shanghai',
        request_id: 'legacy-request',
        query: {
          interval_ms: 30000,
          max_data_points: 500,
        },
      } as ITarget,
      {
        refId: 'B',
        kind: 'query',
        datasource: { cate: 'elasticsearch', id: 12 },
        resultType: 'logs',
        query: {
          index: 'application-*',
          date_field: '@timestamp',
          values: [{ func: 'rawData' }],
        },
      },
      {
        refId: 'C',
        kind: 'expression',
        expression: '$A / 100',
      },
    ];

    const request = buildDashboardQueryRequest({
      time: {
        start: moment('2026-07-24T00:00:00.000Z'),
        end: moment('2026-07-24T01:00:00.000Z'),
      },
      targets,
      datasourceList: [],
      panelWidth: 800,
      maxDataPoints: 500,
    });

    expect(request).toEqual({
      from: 1784851200,
      to: 1784854800,
      queries: [
        {
          kind: 'query',
          ref_id: 'A',
          datasource: { cate: 'prometheus', id: 9 },
          result_type: 'time_series',
          query: {
            expr: 'rate(http_requests_total[5m])',
            instant: false,
            step: 30,
          },
        },
        {
          kind: 'query',
          ref_id: 'B',
          datasource: { cate: 'elasticsearch', id: 12 },
          result_type: 'logs',
          query: {
            index: 'application-*',
            date_field: '@timestamp',
            filter_language: 'lucene',
            value: { func: 'rawData' },
          },
        },
        {
          kind: 'expression',
          ref_id: 'C',
          expression: '$A / 100',
        },
      ],
    });
    expect(JSON.stringify(request)).not.toMatch(/timezone|max_data_points|interval_ms|request_id/);
  });

  it('does not build a query for a new panel before PromQL is entered', () => {
    const request = buildDashboardQueryRequest({
      time: {
        start: moment('2026-07-24T00:00:00.000Z'),
        end: moment('2026-07-24T01:00:00.000Z'),
      },
      targets: [
        {
          refId: 'A',
          kind: 'query',
          datasource: { cate: 'prometheus', id: 1 },
          expr: '   ',
        },
      ],
      datasourceList: [],
    });

    expect(request.queries).toEqual([]);
  });

  it('normalizes timeseries, logs and ref-level failures with stable ids', () => {
    const targets: ITarget[] = [
      { refId: 'A', kind: 'query', datasource: { cate: 'prometheus', id: 1 } },
      { refId: 'B', kind: 'query', datasource: { cate: 'elasticsearch', id: 2 }, resultType: 'logs' },
      { refId: 'C', kind: 'expression', expression: '$A * 2' },
    ];
    const response = {
      results: [
        {
          ref_id: 'A',
          status: 'success' as const,
          result_type: 'time_series' as const,
          series: [
            {
              labels: { host: 'web-01' },
              samples: [
                [1, 1],
                [2, null],
              ] as Array<[number, number | null]>,
            },
          ],
        },
        {
          ref_id: 'B',
          status: 'success' as const,
          result_type: 'logs' as const,
          records: [
            {
              fields: { level: 'error', trace_id: 'trace-1' },
            },
          ],
        },
        {
          ref_id: 'C',
          status: 'skipped' as const,
          error: {
            code: 'DEPENDENCY_FAILED',
            message: 'A failed',
            retryable: false,
            dependency_ref_ids: ['A'],
          },
        },
      ],
    };

    const first = normalizeDashboardQueryResponse(response, targets);
    const second = normalizeDashboardQueryResponse(response, targets);

    expect(first.series).toHaveLength(2);
    expect(first.series[0]).toMatchObject({
      refId: 'A',
      metric: { host: 'web-01' },
      data: [
        [1, 1],
        [2, null],
      ],
    });
    expect(first.series[1]).toMatchObject({
      refId: 'B',
      mode: 'raw',
      metric: { level: 'error', trace_id: 'trace-1' },
    });
    expect(first.series.map((item) => item.id)).toEqual(second.series.map((item) => item.id));
    expect(first.errorsByRef.C).toMatchObject({
      code: 'DEPENDENCY_FAILED',
      dependency_ref_ids: ['A'],
    });
  });

  it('associates expanded Elasticsearch value queries with their original target', () => {
    const target: ITarget = {
      refId: 'A',
      kind: 'query',
      datasource: { cate: 'elasticsearch', id: 2 },
      query: { values: [{ func: 'count' }, { func: 'avg', field: 'duration' }] },
    };
    const normalized = normalizeDashboardQueryResponse(
      {
        results: [
          {
            ref_id: 'A__value_1',
            status: 'success',
            result_type: 'time_series',
            series: [{ labels: { field: 'duration' }, samples: [[1, 42]] }],
          },
        ],
      },
      [target],
    );

    expect(normalized.series[0]).toMatchObject({
      refId: 'A__value_1',
      target,
      metric: { field: 'duration' },
    });
  });

  it('prefers an exact target RefID over an Elasticsearch value-query prefix match', () => {
    const parentTarget: ITarget = {
      refId: 'A',
      kind: 'query',
      datasource: { cate: 'elasticsearch', id: 2 },
    };
    const exactTarget: ITarget = {
      refId: 'A__value_1',
      kind: 'query',
      datasource: { cate: 'prometheus', id: 1 },
    };
    const normalized = normalizeDashboardQueryResponse(
      {
        results: [
          {
            ref_id: 'A__value_1',
            status: 'success',
            result_type: 'time_series',
            series: [{ labels: {}, samples: [[1, 42]] }],
          },
        ],
      },
      [parentTarget, exactTarget],
    );

    expect(normalized.series[0].target).toBe(exactTarget);
  });

  it('treats an empty result as a successful empty dataset', () => {
    const normalized = normalizeDashboardQueryResponse(
      {
        results: [
          {
            ref_id: 'A',
            status: 'success',
            result_type: 'time_series',
            series: [],
          },
        ],
      },
      [{ refId: 'A', kind: 'query', datasource: { cate: 'prometheus', id: 1 } }],
    );

    expect(normalized).toEqual({
      series: [],
      errorsByRef: {},
    });
  });

  it('uses the current query mode instead of a stale saved result type', () => {
    expect(
      buildDashboardQueryRequest({
        time: {
          start: moment('2026-07-24T00:00:00.000Z'),
          end: moment('2026-07-24T01:00:00.000Z'),
        },
        targets: [
          {
            refId: 'A',
            kind: 'query',
            datasource: { cate: 'aliyun-sls', id: 2 },
            resultType: 'time_series',
            query: {
              mode: 'raw',
              project: 'sls-api-testing',
              logstore: 'demo_nginx_access_log',
            },
          },
        ],
        datasourceList: [],
      }).queries[0],
    ).toMatchObject({
      ref_id: 'A',
      result_type: 'logs',
    });
  });

  it('validates time ranges and expression dependencies before the request', () => {
    expect(() => validateDashboardQueryRequest({ from: 1, to: 0, queries: [] })).toThrow('earlier');
    expect(() =>
      validateDashboardQueryRequest({
        from: 0,
        to: 1,
        queries: [
          { kind: 'query', ref_id: 'A', datasource: { cate: 'elasticsearch', id: 1 }, result_type: 'logs', query: {} },
          { kind: 'expression', ref_id: 'B', expression: '$missing + $A' },
        ],
      }),
    ).toThrow('not found');
    expect(() =>
      validateDashboardQueryRequest({
        from: 0,
        to: 1,
        queries: [
          { kind: 'query', ref_id: 'A', datasource: { cate: 'elasticsearch', id: 1 }, result_type: 'logs', query: {} },
          { kind: 'expression', ref_id: 'B', expression: '$A' },
        ],
      }),
    ).toThrow('log query');
    expect(() =>
      validateDashboardQueryRequest({
        from: 0,
        to: 1,
        queries: [
          { kind: 'expression', ref_id: 'A', expression: '$B' },
          { kind: 'expression', ref_id: 'B', expression: '$A' },
        ],
      }),
    ).toThrow('cycle');
  });
});
