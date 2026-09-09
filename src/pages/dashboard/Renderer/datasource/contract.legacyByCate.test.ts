import moment from 'moment';

import dashboardMigrator from '@/pages/dashboard/Detail/utils/dashboardMigrator';
import type { ITarget } from '@/pages/dashboard/types';
import { buildLegacyDashboard, catesUnderTest, legacyLogsPanelSpecByCate, legacyPanelSpecByCate, logsCatesUnderTest } from '@/pages/dashboard/test/fixtures/legacyDashboardsByCate';

import { buildDashboardQueryRequest } from './contract';

jest.mock('./queryStep', () => ({
  getDashboardQueryStep: () => 30,
}));

jest.mock('@/components/TimeRangePicker/utils', () => ({
  parseRange: (range: { start: unknown; end: unknown }) => range,
}));

jest.mock('@/pages/dashboard/Variables/utils/replaceTemplateVariables', () => ({
  __esModule: true,
  default: (value: string) => value,
  replaceDatasourceVariables: (value: number | string) => value,
}));

const time = { start: moment('2026-07-24T00:00:00.000Z'), end: moment('2026-07-24T01:00:00.000Z') };

/** 老配置 → 迁移 → 用 panel 级 legacyDatasource 回退构建统一查询请求 */
const buildLegacyRequest = (cate: string, targets: ReadonlyArray<unknown>, datasourceValue: number) => {
  const panel = dashboardMigrator(buildLegacyDashboard({ cate, panelType: 'timeseries', datasourceValue, targets })).panels[0];
  return buildDashboardQueryRequest({
    time,
    targets: (panel.targets ?? []) as ITarget[],
    datasourceList: [],
    legacyDatasource: { cate, id: datasourceValue },
  });
};

const assertLegacyQueryPayload = (cate: string, query: Record<string, unknown>) => {
  switch (cate) {
    case 'prometheus':
      expect(query).toEqual({ expr: 'up', instant: false, step: 30 });
      break;
    case 'elasticsearch':
    case 'opensearch':
      // 多 value 展开与 filter_language 在专项用例中断言
      break;
    case 'mysql':
      expect(query).toMatchObject({
        query: 'SELECT ts, value, host FROM service_qps',
        keys: { valueKey: 'value count', labelKey: 'host', timeKey: 'ts' },
      });
      break;
    case 'iotdb':
      expect(query).toMatchObject({ query: 'SELECT time, value FROM root.test' });
      break;
    case 'tdengine':
      expect(query).toMatchObject({ query: 'SELECT _wstart, avg(value) FROM meters' });
      break;
    case 'ck':
      expect(query).toMatchObject({ query: 'SELECT toDateTime(ts) AS time, value FROM metrics' });
      break;
    case 'pgsql':
    case 'doris':
      expect(query).toMatchObject({ sql: 'SELECT ts, value, host FROM service_qps' });
      break;
    case 'oracle':
    case 'sqlserver':
    case 'redshift':
      expect(query).toMatchObject({ sql: 'SELECT ts, value FROM service_qps' });
      break;
    case 'influxdb':
      expect(query).toMatchObject({ sql: 'SELECT mean("value") FROM "cpu" GROUP BY time(1m)' });
      break;
    case 'aliyun-sls':
      expect(query).toMatchObject({
        project: 'n9e-prod',
        logstore: 'app-access',
        query: '(request_method:GET or request_method:POST) and status in [200 299]',
        mode: 'timeSeries',
        power_sql: false,
        time_series: true,
        removeFirstAndLastPoints: false,
        values: [{ func: 'count' }],
        date_field: '@timestamp',
        interval: 1,
        interval_unit: 'min',
      });
      break;
    case 'tencent-cls':
      expect(query).toMatchObject({
        logset_id: 'cls-8f3c2b',
        topic_id: 'topic-app',
        query: 'status:200 | select count(*) as cnt',
        mode: 'timeSeries',
        time_series: true,
        removeFirstAndLastPoints: false,
      });
      break;
    case 'volc-tls':
      expect(query).toMatchObject({ project: 'volc-prod', topic: 'nginx-log', query: 'status:200', mode: 'timeSeries', removeFirstAndLastPoints: false });
      break;
    case 'huawei-lts':
      expect(query).toMatchObject({ group_id: 'lts-group-1', stream_id: 'lts-stream-1', query: 'status:200', mode: 'timeSeries', removeFirstAndLastPoints: false });
      break;
    case 'bce-bls':
      expect(query).toMatchObject({ project: 'bce-prod', logstore: 'bls-log', logstream: 'bls-stream', query: 'status:200', mode: 'timeSeries' });
      break;
    case 'cloudwatchlogs':
      expect(query).toMatchObject({ region: 'us-east-1', log_group_names: ['app'], query_string: 'fields @message', query_language: 'CWLI' });
      break;
    case 'zabbix':
      expect(query).toMatchObject({ mode: 'timeseries', subMode: 'metrics' });
      break;
    case 'cloudwatch':
      expect(query).toMatchObject({ queries: [{ query_type: 'metric_search', statistic: 'Average', return_data: true }] });
      break;
    case 'gcm':
      expect(query).toMatchObject({ query_type: 'builder' });
      break;
    default:
      throw new Error(`unhandled cate ${cate}`);
  }
};

describe('legacy dashboard query contract by cate', () => {
  it.each(catesUnderTest)('builds a compatible query from a legacy %s panel', (cate) => {
    const spec = legacyPanelSpecByCate[cate];
    const request = buildLegacyRequest(cate, spec.targets, spec.datasourceValue);

    expect(request.queries.length).toBeGreaterThan(0);
    const query = request.queries[0];
    expect(query).toMatchObject({
      kind: 'query',
      ref_id: 'A',
      datasource: { cate, id: spec.datasourceValue },
      result_type: 'time_series',
    });
    if (query.kind === 'query') {
      assertLegacyQueryPayload(cate, query.query);
    }
  });

  it.each(['elasticsearch', 'opensearch'] as const)('expands legacy %s multi-value queries with filter_language', (cate) => {
    const spec = legacyPanelSpecByCate[cate];
    const request = buildLegacyRequest(cate, spec.targets, spec.datasourceValue);

    expect(request.queries).toMatchObject([
      { ref_id: 'A', result_type: 'time_series', query: { value: { func: 'count' }, filter_language: 'kql' } },
      { ref_id: 'A__value_1', result_type: 'time_series', query: { value: { func: 'avg', field: 'duration' }, filter_language: 'kql' } },
    ]);
    expect(JSON.stringify(request)).not.toContain('"values"');
    expect(JSON.stringify(request)).not.toContain('"syntax"');
  });

  it.each(logsCatesUnderTest)('builds a logs query from a legacy %s raw query', (cate) => {
    const spec = legacyLogsPanelSpecByCate[cate];
    const request = buildLegacyRequest(cate, spec.targets, spec.datasourceValue);

    expect(request.queries[0]).toMatchObject({
      ref_id: 'A',
      result_type: 'logs',
      datasource: { cate, id: spec.datasourceValue },
    });
  });

  // 各 cate 的就绪短路条件（对应 registry.ts 的 QUERY_READINESS）
  const brokenLegacyTargetByCate: Record<string, ReadonlyArray<unknown>> = {
    prometheus: [{ expr: '   ' }],
    elasticsearch: [{ query: { index: 'logs-*' } }],
    opensearch: [{ query: { index: 'logs-*' } }],
    iotdb: [{ query: { query: '   ' } }],
    tdengine: [{ query: { query: '   ' } }],
    ck: [{ query: { query: '   ' } }],
    mysql: [{ query: { query: '   ' } }],
    pgsql: [{ query: { sql: '   ' } }],
    oracle: [{ query: { sql: '   ' } }],
    sqlserver: [{ query: { sql: '   ' } }],
    redshift: [{ query: { sql: '   ' } }],
    influxdb: [{ query: { sql: '   ' } }],
    'aliyun-sls': [{ query: { mode: 'timeSeries' } }],
    cloudwatchlogs: [{ query: { region: 'us-east-1', log_group_names: ['app'] } }],
  };

  it.each(Object.keys(brokenLegacyTargetByCate))('silently skips an unready legacy %s target', (cate) => {
    const spec = legacyPanelSpecByCate[cate];
    const request = buildLegacyRequest(cate, brokenLegacyTargetByCate[cate], spec.datasourceValue);
    expect(request.queries).toEqual([]);
  });
});
