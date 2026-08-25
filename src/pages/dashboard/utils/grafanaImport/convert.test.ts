import { convertDashboardGrafanaToN9E, convertDashboardGrafanaToN9EWithReport } from './convert';
import { formatDatasource } from '../../Variables/utils/formatString';
import { validateDashboardConfig } from '../validateDashboardConfig';
import dashboardMigrator from '../../Detail/utils/dashboardMigrator';

// plus: 在 jest 下是存根，这里虚拟 mock addPrefixToTableNames 验证 postgres 接线
jest.mock(
  'plus:/utils/convertDashboardGrafanaToN9E/addPrefixToTableNames',
  () => ({
    __esModule: true,
    default: (sql: string) => `PREFIXED:${sql}`,
  }),
  { virtual: true },
);

describe('convertDashboardGrafanaToN9EWithReport', () => {
  it('converts a modern prometheus dashboard to true 4.0.0', () => {
    const input = {
      schemaVersion: 42,
      title: 'Prom Demo',
      tags: ['a', 'b'],
      panels: [
        {
          id: 1,
          type: 'timeseries',
          title: 'CPU',
          gridPos: { h: 8, w: 12, x: 0, y: 0 },
          datasource: { type: 'prometheus', uid: '${DS_PROMETHEUS}' },
          targets: [{ refId: 'A', expr: 'up', legendFormat: '{{job}}', instant: false }],
          fieldConfig: {
            defaults: {
              unit: 'percent',
              min: 0,
              max: 100,
              decimals: 2,
              thresholds: {
                mode: 'absolute',
                steps: [
                  { color: 'green', value: null },
                  { color: 'red', value: 80 },
                ],
              },
              custom: { drawStyle: 'line', lineInterpolation: 'smooth', fillOpacity: 50, stacking: { mode: 'normal' } },
            },
          },
        },
      ],
      templating: { list: [{ name: 'DS_PROMETHEUS', type: 'datasource', query: 'prometheus', hide: 0 }] },
    };
    const { dashboard, report } = convertDashboardGrafanaToN9EWithReport(input);

    expect(dashboard.name).toBe('Prom Demo');
    expect(dashboard.tags).toBe('a b');
    expect(dashboard.configs.version).toBe('4.0.0');
    expect(dashboard.configs.graphTooltip).toBe('default');
    expect(dashboard.configs.graphZoom).toBe('default');

    const panel = dashboard.configs.panels[0];
    expect(panel.id).toBe('1');
    expect(panel.layout.i).toBe('1');
    expect(panel.type).toBe('timeseries');
    expect(panel.datasourceCate).toBe('prometheus');
    expect(panel.datasourceValue).toBe('${DS_PROMETHEUS}');
    expect(panel.targets[0]).toMatchObject({
      refId: 'A',
      expr: 'up',
      legend: '{{job}}',
      kind: 'query',
      resultType: 'time_series',
    });
    // 单一数据源 → target 不带 datasource
    expect(panel.targets[0].datasource).toBeUndefined();
    // unit 用 unit（非 util typo）、thresholds 颜色转 hex、base 标记
    expect(panel.options.standardOptions.unit).toBe('percent');
    expect(panel.options.thresholds.steps[0].color).toBe('#73BF69');
    expect(panel.options.thresholds.steps[0].type).toBe('base');
    // custom
    expect(panel.custom.drawStyle).toBe('lines');
    expect(panel.custom.fillOpacity).toBe(0.5);
    expect(panel.custom.stack).toBe('normal');
    // 变量：templating datasource 变量保留
    expect(dashboard.configs.var).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'DS_PROMETHEUS', type: 'datasource', definition: 'prometheus' })]));
    // 无 unsupported
    expect(report.unsupportedItems).toEqual([]);
  });

  it('keeps prometheus query conditions (expr unchanged) and emits queryable target', () => {
    const input = {
      schemaVersion: 42,
      panels: [
        { id: 2, type: 'timeseries', title: 'Q', gridPos: { h: 6, w: 12, x: 0, y: 0 }, datasource: null, targets: [{ refId: 'A', expr: 'rate(up[5m])', legendFormat: '{{job}}' }] },
      ],
    };
    const { dashboard } = convertDashboardGrafanaToN9EWithReport(input);
    const target = dashboard.configs.panels[0].targets[0];
    expect(target.expr).toBe('rate(up[5m])');
    expect(target.legend).toBe('{{job}}');
    expect(target.kind).toBe('query');
    expect(target.resultType).toBe('time_series');
  });

  it('keeps unsupported panel types as unknown (renderer shows placeholder) and reports downgrade', () => {
    const input = { schemaVersion: 42, panels: [{ id: 3, type: 'alertlist', title: 'alerts', gridPos: { h: 4, w: 12, x: 0, y: 0 } }] };
    const { dashboard, report } = convertDashboardGrafanaToN9EWithReport(input);
    // 面板保留为 unknown 类型，而不是被丢弃
    expect(dashboard.configs.panels).toHaveLength(1);
    expect(dashboard.configs.panels[0].type).toBe('unknown');
    expect(dashboard.configs.panels[0].id).toBe('3');
    expect(report.unsupportedItems).toEqual(expect.arrayContaining([expect.objectContaining({ scope: 'panel', action: 'downgraded', path: '$.panels[id=3]' })]));
  });

  it('handles mixed datasource panels with target-level datasource', () => {
    const input = {
      schemaVersion: 42,
      panels: [
        {
          id: 4,
          type: 'timeseries',
          title: 'M',
          gridPos: { h: 6, w: 12, x: 0, y: 0 },
          datasource: { uid: '-- Mixed --' },
          targets: [
            { refId: 'A', expr: 'up', datasource: { type: 'prometheus', uid: '${DS_PROMETHEUS}' } },
            { refId: 'B', expr: 'down', datasource: { type: 'prometheus', uid: '${DS_PROMETHEUS_2}' } },
          ],
        },
      ],
      templating: {
        list: [
          { name: 'DS_PROMETHEUS', type: 'datasource', query: 'prometheus', hide: 0 },
          { name: 'DS_PROMETHEUS_2', type: 'datasource', query: 'prometheus', hide: 0 },
        ],
      },
    };
    const { dashboard } = convertDashboardGrafanaToN9EWithReport(input);
    const panel = dashboard.configs.panels[0];
    expect(panel.datasourceCate).toBe('mixed');
    expect(panel.datasourceValue).toBe('mixed');
    expect(panel.targets[0].datasource).toEqual({ cate: 'prometheus', id: '${DS_PROMETHEUS}' });
    expect(panel.targets[1].datasource).toEqual({ cate: 'prometheus', id: '${DS_PROMETHEUS_2}' });
  });

  it('resolves $datasource to the first __inputs datasource variable', () => {
    const input = {
      schemaVersion: 42,
      __inputs: [{ name: 'DS_PROMETHEUS', type: 'datasource', pluginId: 'prometheus' }],
      panels: [{ id: 5, type: 'stat', title: 'S', gridPos: { h: 4, w: 6, x: 0, y: 0 }, datasource: '$datasource', targets: [{ refId: 'A', expr: 'up' }] }],
    };
    const { dashboard } = convertDashboardGrafanaToN9EWithReport(input);
    const panel = dashboard.configs.panels[0];
    expect(panel.datasourceCate).toBe('prometheus');
    expect(panel.datasourceValue).toBe('${DS_PROMETHEUS}');
    expect(dashboard.configs.var).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'DS_PROMETHEUS', type: 'datasource', definition: 'prometheus' })]));
  });

  it('creates separate datasource variables per cate for prometheus + postgres mix', () => {
    const input = {
      schemaVersion: 42,
      panels: [
        { id: 6, type: 'timeseries', title: 'P', gridPos: { h: 6, w: 12, x: 0, y: 0 }, datasource: { type: 'prometheus', uid: 'abc' }, targets: [{ refId: 'A', expr: 'up' }] },
        { id: 7, type: 'timeseries', title: 'PG', gridPos: { h: 6, w: 12, x: 0, y: 12 }, datasource: { type: 'postgres' }, targets: [{ refId: 'A', rawSql: 'select 1 from t' }] },
      ],
    };
    const { dashboard } = convertDashboardGrafanaToN9EWithReport(input);
    const dsVars = dashboard.configs.var.filter((v: any) => v.type === 'datasource');
    expect(dsVars.map((v: any) => v.definition)).toEqual(expect.arrayContaining(['prometheus', 'pgsql']));
    const promPanel = dashboard.configs.panels.find((p: any) => p.id === '6');
    const pgsqlPanel = dashboard.configs.panels.find((p: any) => p.id === '7');
    expect(promPanel.datasourceCate).toBe('prometheus');
    expect(promPanel.datasourceValue).toBe('${datasource}');
    expect(pgsqlPanel.datasourceCate).toBe('pgsql');
    expect(pgsqlPanel.datasourceValue).toBe('${datasource_pgsql}');
    expect(pgsqlPanel.targets[0]).toMatchObject({ kind: 'query', resultType: 'time_series' });
    expect(pgsqlPanel.targets[0].query.sql).toBe('PREFIXED:select 1 from t');
  });

  it('drops the All option (downgraded) when includeAll is set without multi, keeping single-select', () => {
    const input = {
      schemaVersion: 42,
      templating: {
        list: [
          { name: 'DS_PROMETHEUS', type: 'datasource', query: 'prometheus', hide: 0 },
          {
            name: 'h',
            type: 'query',
            datasource: { type: 'prometheus', uid: '${DS_PROMETHEUS}' },
            query: 'label_values(up, host)',
            includeAll: true,
            multi: false,
            regex: '',
            hide: 0,
          },
        ],
      },
      panels: [],
    };
    const { dashboard, report } = convertDashboardGrafanaToN9EWithReport(input);
    const qvar = dashboard.configs.var.find((v: any) => v.name === 'h');
    // 保持单选，移除 All 选项
    expect(qvar.allOption).toBe(false);
    expect(qvar.multi).toBe(false);
    expect(qvar.datasource).toEqual({ cate: 'prometheus', value: '${DS_PROMETHEUS}' });
    const item = report.unsupportedItems.find((i) => i.scope === 'variable' && i.path === '$.templating.list[name=h]');
    expect(item?.action).toBe('downgraded');
  });

  it('round-trips datasource reference through the runtime formatter', () => {
    const input = {
      schemaVersion: 42,
      panels: [{ id: 8, type: 'timeseries', title: 'R', gridPos: { h: 6, w: 12, x: 0, y: 0 }, datasource: null, targets: [{ refId: 'A', expr: 'up' }] }],
    };
    const { dashboard } = convertDashboardGrafanaToN9EWithReport(input);
    const panel = dashboard.configs.panels[0];
    expect(panel.datasourceValue).toBe('${datasource}');
    // 运行时 replaceDatasourceVariables → formatDatasource：变量值(数字 id) 替换后转 number
    expect(formatDatasource(panel.datasourceValue, { datasource: 7 })).toBe(7);
  });

  it('keeps exported dashboard shape for the legacy entry', () => {
    const dashboard = convertDashboardGrafanaToN9E({
      schemaVersion: 42,
      title: 'T',
      panels: [{ id: 1, type: 'timeseries', gridPos: { h: 4, w: 12, x: 0, y: 0 }, targets: [{ refId: 'A', expr: 'up' }] }],
    });
    expect(dashboard.name).toBe('T');
    expect(dashboard.configs.version).toBe('4.0.0');
    expect(dashboard.configs.panels[0].targets[0]).toMatchObject({ kind: 'query', resultType: 'time_series' });
  });

  it('rejects non-classic payloads', () => {
    expect(() => convertDashboardGrafanaToN9E({ elements: {}, layout: {} })).toThrow();
    expect(() => convertDashboardGrafanaToN9E({})).toThrow();
  });

  it('falls back to default datasource variable when templated uid has no matching variable', () => {
    const input = {
      schemaVersion: 42,
      panels: [{ id: 9, type: 'timeseries', gridPos: { h: 4, w: 12, x: 0, y: 0 }, datasource: { type: 'prometheus', uid: '${DS_PROM}' }, targets: [{ refId: 'A', expr: 'up' }] }],
    };
    const { dashboard } = convertDashboardGrafanaToN9EWithReport(input);
    const panel = dashboard.configs.panels[0];
    expect(panel.datasourceValue).toBe('${datasource}');
    expect(dashboard.configs.var).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'datasource', type: 'datasource', definition: 'prometheus' })]));
  });

  it('handles datasource type with different casing (e.g. query "Prometheus") and keeps targets', () => {
    const input = {
      schemaVersion: 42,
      templating: { list: [{ name: 'DS_PROMETHEUS', type: 'datasource', query: 'Prometheus', hide: 0 }] },
      panels: [
        { id: 10, type: 'timeseries', gridPos: { h: 4, w: 12, x: 0, y: 0 }, datasource: { type: 'prometheus', uid: '${DS_PROMETHEUS}' }, targets: [{ refId: 'A', expr: 'up' }] },
      ],
    };
    const { dashboard } = convertDashboardGrafanaToN9EWithReport(input);
    const panel = dashboard.configs.panels[0];
    expect(panel.targets).toHaveLength(1);
    expect(panel.datasourceCate).toBe('prometheus');
    expect(panel.datasourceValue).toBe('${DS_PROMETHEUS}');
    expect(dashboard.configs.var.find((v: any) => v.name === 'DS_PROMETHEUS').definition).toBe('prometheus');
  });

  it('end-to-end: migrates a legacy schema 6 fixture to 42 and converts to N9E', () => {
    const input = {
      title: 'Core migration fixture',
      tags: ['ops', 'schema42'],
      schemaVersion: 6,
      sharedCrosshair: true,
      refresh: true,
      timepicker: { time_options: ['5m'] },
      templating: {
        list: [{ name: 'job', type: 'filter', query: 'label_values(up, job)', hideVariable: true, allFormat: null, tags: ['legacy'], refresh: false, options: [{ text: 'old' }] }],
      },
      panels: [
        {
          id: 7,
          type: 'timeseries',
          title: 'Up',
          gridPos: { h: 8, w: 12, x: 0, y: 0 },
          datasource: { type: 'prometheus', uid: '${DS_PROM}' },
          targets: [{ refId: 'A', expr: 'up', legendFormat: '{{instance}}' }],
          fieldConfig: { defaults: { unit: 'bits', thresholds: { mode: 'absolute', steps: [{ color: 'green', value: null }] }, mappings: [] } },
          options: { legend: { displayMode: 'hidden' } },
          transformations: [{ id: 'organize', options: {} }],
        },
      ],
    };
    const { dashboard, report } = convertDashboardGrafanaToN9EWithReport(input);
    const configs = dashboard.configs;

    expect(dashboard.tags).toBe('ops schema42');
    expect(configs.graphTooltip).toBe('default');
    expect(configs.version).toBe('4.0.0');

    const panel = configs.panels[0];
    expect(panel.id).toBe('7');
    expect(panel.datasourceCate).toBe('prometheus');
    // ${DS_PROM} 无对应变量 → 回退默认 prom 数据源变量
    expect(panel.datasourceValue).toBe('${datasource}');
    expect(panel.targets[0]).toMatchObject({ refId: 'A', expr: 'up', legend: '{{instance}}', kind: 'query', resultType: 'time_series' });
    expect(panel.options.standardOptions.unit).toBe('bitsIEC');
    expect(panel.options.legend).toEqual({ displayMode: 'hidden', placement: 'bottom' });

    // 变量：schemaVersion 6 时 v6 迁移（filter→query）不生效，filter 变量被丢弃并报告；
    // 兜底 prom 数据源变量存在
    expect(configs.var.find((v: any) => v.name === 'job')).toBeUndefined();
    expect(configs.var.some((v: any) => v.type === 'datasource' && v.definition === 'prometheus')).toBe(true);
    expect(report.unsupportedItems.some((i) => i.scope === 'variable' && i.action === 'dropped')).toBe(true);

    // transformations 被报告（scope custom + 面板 path）
    expect(report.unsupportedItems.some((i) => i.scope === 'custom' && i.path === '$.panels[id=7]')).toBe(true);
  });

  it('output is valid 4.0.0 and needs no dashboardMigrator migration (no implicit fallback)', () => {
    const input = {
      schemaVersion: 42,
      title: 'RT',
      panels: [
        {
          id: 1,
          type: 'timeseries',
          title: 'P1',
          gridPos: { h: 8, w: 12, x: 0, y: 0 },
          datasource: { type: 'prometheus', uid: '${DS_PROMETHEUS}' },
          targets: [{ refId: 'A', expr: 'up', legendFormat: '{{job}}' }],
        },
        {
          id: 2,
          type: 'row',
          title: 'Row',
          collapsed: true,
          gridPos: { h: 1, w: 24, x: 0, y: 8 },
          panels: [{ id: 3, type: 'stat', title: 'S', gridPos: { h: 4, w: 6, x: 0, y: 9 }, targets: [{ refId: 'A', expr: 'down' }] }],
        },
      ],
      templating: { list: [{ name: 'DS_PROMETHEUS', type: 'datasource', query: 'prometheus', hide: 0 }] },
    };
    const { dashboard } = convertDashboardGrafanaToN9EWithReport(input);
    const configs = dashboard.configs;

    const validation = validateDashboardConfig(configs);
    expect(validation.valid).toBe(true);

    const migrated = dashboardMigrator(configs);
    expect(migrated.version).toBe('4.0.0');
    // 已是真正的 4.0.0（target 带 kind/resultType、非 mixed 面板级 datasource），不应再发生迁移
    expect(migrated.panels).toEqual(configs.panels);
  });

  it('keeps variables visible when hide is undefined or 1, hides only when hide === 2', () => {
    const input = {
      schemaVersion: 42,
      templating: {
        list: [
          { name: 'a', type: 'query', datasource: { type: 'prometheus', uid: '${DS_PROMETHEUS}' }, query: 'label_values(up, a)' },
          { name: 'b', type: 'query', datasource: { type: 'prometheus', uid: '${DS_PROMETHEUS}' }, query: 'label_values(up, b)', hide: 1 },
          { name: 'c', type: 'query', datasource: { type: 'prometheus', uid: '${DS_PROMETHEUS}' }, query: 'label_values(up, c)', hide: 2 },
          { name: 'DS_PROMETHEUS', type: 'datasource', query: 'prometheus' },
        ],
      },
      panels: [],
    };
    const { dashboard } = convertDashboardGrafanaToN9EWithReport(input);
    const byName = (n: string) => dashboard.configs.var.find((v: any) => v.name === n);
    expect(byName('a').hide).toBe(false);
    expect(byName('b').hide).toBe(false);
    expect(byName('c').hide).toBe(true);
    expect(byName('DS_PROMETHEUS').hide).toBe(false);
  });

  it('fills default value for datasource variables from the provided datasource list', () => {
    const input = {
      schemaVersion: 42,
      templating: { list: [{ name: 'DS_PROMETHEUS', type: 'datasource', query: 'prometheus' }] },
      panels: [
        { id: 1, type: 'timeseries', gridPos: { h: 4, w: 12, x: 0, y: 0 }, datasource: { type: 'prometheus', uid: '${DS_PROMETHEUS}' }, targets: [{ refId: 'A', expr: 'up' }] },
      ],
    };
    const { dashboard } = convertDashboardGrafanaToN9EWithReport(input, {
      datasourceList: {
        prometheus: [
          { id: 11, is_default: true },
          { id: 22, is_default: false },
        ],
      },
    });
    const dsVar = dashboard.configs.var.find((v: any) => v.name === 'DS_PROMETHEUS');
    expect(dsVar.defaultValue).toBe(11);
  });

  it('reports unsupported items with JSON path', () => {
    const input = {
      schemaVersion: 42,
      panels: [
        {
          id: 1,
          type: 'timeseries',
          gridPos: { h: 4, w: 12, x: 0, y: 0 },
          datasource: { type: 'prometheus' },
          targets: [{ refId: 'A', expr: 'up' }],
          fieldConfig: { defaults: { unit: 'currencyUSD' } },
        },
      ],
    };
    const { report } = convertDashboardGrafanaToN9EWithReport(input);
    const unitItem = report.unsupportedItems.find((i) => i.action === 'downgraded');
    expect(unitItem).toBeDefined();
    expect(unitItem?.path).toBe('$.panels[id=1]');
  });

  it('does not report downgrade for unit "none" (N9E supports it)', () => {
    const input = {
      schemaVersion: 42,
      panels: [
        {
          id: 1,
          type: 'timeseries',
          gridPos: { h: 4, w: 12, x: 0, y: 0 },
          datasource: { type: 'prometheus' },
          targets: [{ refId: 'A', expr: 'up' }],
          fieldConfig: { defaults: { unit: 'none' } },
        },
      ],
    };
    const { dashboard, report } = convertDashboardGrafanaToN9EWithReport(input);
    expect(dashboard.configs.panels[0].options.standardOptions.unit).toBe('none');
    expect(report.unsupportedItems.some((i) => i.scope === 'option' && i.action === 'downgraded')).toBe(false);
  });

  it('downgrades percent stacking to off with a clear report', () => {
    const input = {
      schemaVersion: 42,
      panels: [
        {
          id: 1,
          type: 'timeseries',
          gridPos: { h: 4, w: 12, x: 0, y: 0 },
          datasource: { type: 'prometheus' },
          targets: [{ refId: 'A', expr: 'up' }],
          fieldConfig: { defaults: { custom: { stacking: { mode: 'percent' } } } },
        },
      ],
    };
    const { dashboard, report } = convertDashboardGrafanaToN9EWithReport(input);
    expect(dashboard.configs.panels[0].custom.stack).toBe('off');
    const item = report.unsupportedItems.find((i) => i.scope === 'option' && i.action === 'downgraded');
    expect(item).toBeDefined();
    expect(item?.path).toBe('$.panels[id=1]');
    expect(item?.reason).toContain('百分比');
  });

  it('drops all overrides with a single report entry and empty overrides output', () => {
    const input = {
      schemaVersion: 42,
      panels: [
        {
          id: 1,
          type: 'timeseries',
          gridPos: { h: 4, w: 12, x: 0, y: 0 },
          datasource: { type: 'prometheus' },
          targets: [{ refId: 'A', expr: 'up' }],
          fieldConfig: {
            overrides: [
              { matcher: { id: 'byName', value: 'x' }, properties: [{ id: 'unit', value: 'percent' }] },
              { matcher: { id: 'byFrameRefID', value: 'A' }, properties: [{ id: 'width', value: 120 }] },
            ],
          },
        },
      ],
    };
    const { dashboard, report } = convertDashboardGrafanaToN9EWithReport(input);
    expect(dashboard.configs.panels[0].overrides).toEqual([]);
    const overrideItems = report.unsupportedItems.filter((i) => i.scope === 'custom' && i.path === '$.panels[id=1]' && i.reason.includes('overrides'));
    expect(overrideItems).toHaveLength(1);
  });

  it('drops dashboards-type links with a single aggregate report', () => {
    const input = {
      schemaVersion: 42,
      title: 'L',
      links: [
        { type: 'link', title: 'A', url: 'http://a' },
        { type: 'dashboards', title: 'OS', tags: ['OS'] },
        { type: 'dashboards', title: 'MySQL', tags: ['MySQL'] },
      ],
      panels: [],
    };
    const { dashboard, report } = convertDashboardGrafanaToN9EWithReport(input);
    // 仅普通链接保留，dashboards 链接丢弃
    expect(dashboard.configs.links).toHaveLength(1);
    expect(dashboard.configs.links[0]).toMatchObject({ type: 'link', title: 'A', url: 'http://a' });
    // dashboards 类型整体只报告一条（不按条数逐条报）
    const linkItems = report.unsupportedItems.filter((i) => i.path === '$.links' && i.reason.includes('dashboards'));
    expect(linkItems).toHaveLength(1);
    expect(linkItems[0].action).toBe('dropped');
  });

  it('keeps panel links without a type field (DataLink style)', () => {
    const input = {
      schemaVersion: 42,
      panels: [
        {
          id: 13,
          type: 'timeseries',
          gridPos: { h: 4, w: 12, x: 0, y: 0 },
          datasource: { type: 'prometheus' },
          targets: [{ refId: 'A', expr: 'up' }],
          links: [{ title: 'Drill', url: '/dashboards/1' }],
        },
      ],
    };
    const { dashboard, report } = convertDashboardGrafanaToN9EWithReport(input);
    expect(dashboard.configs.panels[0].links).toEqual([{ type: 'link', title: 'Drill', url: '/dashboards/1' }]);
    expect(report.unsupportedItems.some((i) => i.path === '$.panels[id=13].links[0]')).toBe(false);
  });

  it('drops unknown link types with indexed paths', () => {
    const input = {
      schemaVersion: 42,
      title: 'L',
      links: [
        { type: 'link', title: 'A', url: 'http://a' },
        { type: 'weird', title: 'B' },
      ],
      panels: [],
    };
    const { dashboard, report } = convertDashboardGrafanaToN9EWithReport(input);
    expect(dashboard.configs.links).toHaveLength(1);
    const dropped = report.unsupportedItems.filter((i) => i.scope === 'custom' && i.action === 'dropped');
    expect(dropped).toHaveLength(1);
    expect(dropped[0].path).toBe('$.links[1]');
  });

  it('deduplicates datasource variables declared in both __inputs and templating', () => {
    const input = {
      schemaVersion: 42,
      __inputs: [{ name: 'DS_PROMETHEUS', type: 'datasource', pluginId: 'prometheus' }],
      templating: { list: [{ name: 'DS_PROMETHEUS', type: 'datasource', query: 'prometheus', hide: 0 }] },
      panels: [
        { id: 1, type: 'timeseries', gridPos: { h: 4, w: 12, x: 0, y: 0 }, datasource: { type: 'prometheus', uid: '${DS_PROMETHEUS}' }, targets: [{ refId: 'A', expr: 'up' }] },
      ],
    };
    const { dashboard } = convertDashboardGrafanaToN9EWithReport(input);
    const dsVars = dashboard.configs.var.filter((v: any) => v.type === 'datasource' && v.name === 'DS_PROMETHEUS');
    expect(dsVars).toHaveLength(1);
    // 面板仍引用该变量
    expect(dashboard.configs.panels[0].datasourceValue).toBe('${DS_PROMETHEUS}');
  });
});
