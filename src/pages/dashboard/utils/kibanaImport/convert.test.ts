import fs from 'fs';

import { DASHBOARD_VERSION } from '../../constants';
import { convertKibanaNdjson } from './convert';

function ndjson(rows: unknown[]) {
  return rows.map((row) => JSON.stringify(row)).join('\n');
}

function lens(id: string, title: string, visualizationType: string, state: Record<string, unknown>) {
  return {
    type: 'lens',
    id,
    attributes: { title, visualizationType, state },
    references: [{ id: 'logs', name: 'indexpattern-datasource-layer-layer1', type: 'index-pattern' }],
  };
}

function panel(id: string, refId: string, kind: string, grid: { x: number; y: number; w: number; h: number }) {
  return { type: kind, panelIndex: id, gridData: { ...grid, i: id } };
}

const indexPattern = {
  type: 'index-pattern',
  id: 'logs',
  attributes: { title: 'logs-nginx.access-*', timeFieldName: '@timestamp' },
};

describe('convertKibanaNdjson', () => {
  it('converts Lens panels into an Elasticsearch dashboard variable', () => {
    const raw = ndjson([
      indexPattern,
      lens('count', '总请求数', 'lnsMetric', {
        visualization: { metricAccessor: 'metric' },
        datasourceStates: { formBased: { layers: { layer1: { columnOrder: ['metric'], columns: { metric: { operationType: 'count', label: 'Count' } } } } } },
        query: { language: 'kuery', query: '' },
      }),
      lens('ips', '独立客户端 IP', 'lnsMetric', {
        visualization: { metricAccessor: 'metric' },
        datasourceStates: {
          formBased: { layers: { layer1: { columnOrder: ['metric'], columns: { metric: { operationType: 'unique_count', sourceField: 'client.ip', label: 'Unique' } } } } },
        },
        query: { language: 'kuery', query: '' },
      }),
      lens('error', '错误率', 'lnsMetric', {
        visualization: { metricAccessor: 'metric' },
        datasourceStates: {
          formBased: {
            layers: {
              layer1: {
                columnOrder: ['metric'],
                columns: { metric: { operationType: 'formula', label: '错误率', params: { formula: "count(kql='http.response.status_code >= 400') / count()" } } },
              },
            },
          },
        },
        query: { language: 'kuery', query: '' },
      }),
      lens('pie', '状态类别占比', 'lnsPie', {
        visualization: {
          shape: 'donut',
          layers: [{ primaryGroups: ['bucket'], metrics: ['metric'], numberDisplay: 'percent', legendDisplay: 'default', legendPosition: 'right' }],
        },
        datasourceStates: {
          formBased: {
            layers: {
              layer1: {
                columnOrder: ['bucket', 'metric'],
                columns: {
                  bucket: { operationType: 'terms', sourceField: 'http.response.status_class', params: { size: 5, orderDirection: 'desc', orderBy: { type: 'column' } } },
                  metric: { operationType: 'count', label: 'Count' },
                },
              },
            },
          },
        },
        query: { language: 'kuery', query: '' },
      }),
      {
        type: 'dashboard',
        id: 'dash',
        attributes: {
          title: 'Nginx 访问日志',
          description: '访问情况',
          optionsJSON: JSON.stringify({ syncCursor: true, syncTooltips: false }),
          panelsJSON: JSON.stringify([
            panel('count', 'count', 'vis', { x: 0, y: 0, w: 12, h: 8 }),
            panel('ips', 'ips', 'vis', { x: 12, y: 0, w: 12, h: 8 }),
            panel('error', 'error', 'vis', { x: 24, y: 0, w: 12, h: 8 }),
            panel('pie', 'pie', 'vis', { x: 0, y: 8, w: 24, h: 12 }),
          ]),
          kibanaSavedObjectMeta: { searchSourceJSON: JSON.stringify({ query: { language: 'kuery', query: '' } }) },
        },
        references: [
          { name: 'count:savedObjectRef', id: 'count', type: 'lens' },
          { name: 'ips:savedObjectRef', id: 'ips', type: 'lens' },
          { name: 'error:savedObjectRef', id: 'error', type: 'lens' },
          { name: 'pie:savedObjectRef', id: 'pie', type: 'lens' },
        ],
      },
    ]);

    const { dashboard, warnings } = convertKibanaNdjson(raw, { defaultDatasourceId: 9 });

    expect(dashboard.name).toBe('Nginx 访问日志');
    expect(dashboard.configs.version).toBe(DASHBOARD_VERSION);
    expect(dashboard.configs.graphTooltip).toBe('sharedCrosshair');
    expect(dashboard.configs.var[0]).toMatchObject({ type: 'datasource', name: 'datasource', definition: 'elasticsearch', defaultValue: 9 });
    expect(dashboard.configs.panels).toHaveLength(4);

    const [count, ips, error, pie] = dashboard.configs.panels;
    expect(count.type).toBe('stat');
    expect(count.datasourceValue).toBe('${datasource}');
    expect(count.targets[0].datasource).toEqual({ cate: 'elasticsearch', id: '${datasource}' });
    expect(count.targets[0].query).toMatchObject({ syntax: 'dsl', index: 'logs-nginx.access-*', interval: 315360000 });

    expect(ips.targets[0].query).toMatchObject({ syntax: 'sql' });
    expect(String(ips.targets[0].query?.sql)).toContain('COUNT(DISTINCT "client.ip")');
    expect(String(ips.targets[0].query?.sql)).toContain('${__from_date_iso}');

    expect(error.targets.map((target) => target.refId)).toEqual(['A', 'B', 'C']);
    expect(error.targets[2]).toMatchObject({ kind: 'expression', expression: '($A / $B)' });
    expect(error.targets[0].hide).toBe(true);

    expect(pie.type).toBe('pie');
    expect(pie.custom.labelWithValue).toBe(false);
    expect(pie.targets[0].legend).toBe('{{http.response.status_class}}');
    expect(warnings.some((item) => item.includes('饼图百分比'))).toBe(true);
  });

  it('rejects an export without a dashboard', () => {
    expect(() => convertKibanaNdjson(ndjson([{ type: 'index-pattern', id: 'logs', attributes: {} }]))).toThrow('NDJSON 里没有 dashboard');
  });

  const sample = process.env.KIBANA_NDJSON;
  (sample ? it : it.skip)('converts a local Kibana export when KIBANA_NDJSON is set', () => {
    const { dashboard, warnings } = convertKibanaNdjson(fs.readFileSync(sample as string, 'utf8'));
    expect(dashboard.configs.panels.length).toBeGreaterThan(10);
    expect(dashboard.configs.var[0]).toMatchObject({ name: 'datasource', definition: 'elasticsearch' });
    expect(warnings.join('\n')).not.toMatch(/没有可转换的查询/);
  });
});
