import dashboardMigrator, { decodeLegacyDashboard } from './dashboardMigrator';

describe('dashboard v4 migration', () => {
  const legacyPanel = {
    id: 'panel-1',
    version: '3.4.0',
    type: 'timeseries',
    datasourceCate: 'prometheus',
    datasourceValue: '${metrics}',
    targets: [
      {
        refId: 'A',
        expr: 'up',
      },
      {
        refId: 'B',
        __mode__: '__expr__',
        expr: '$A * 100',
      },
    ],
    custom: {},
    options: {},
  };

  it('keeps a shared datasource on ordinary panels and migrates row children', () => {
    const migrated = dashboardMigrator({
      version: '3.4.0',
      panels: [
        legacyPanel,
        {
          id: 'row-1',
          version: '3.4.0',
          type: 'row',
          panels: [
            {
              ...legacyPanel,
              id: 'nested-panel',
              datasourceCate: 'elasticsearch',
              datasourceValue: 18,
            },
          ],
          custom: {},
          options: {},
        },
      ],
    });

    expect(migrated.version).toBe('4.1.0');
    expect(migrated.panels[0]).toMatchObject({
      datasourceCate: 'prometheus',
      datasourceValue: '${metrics}',
    });
    expect(migrated.panels[0].targets[0]).toMatchObject({
      refId: 'A',
      kind: 'query',
      resultType: 'time_series',
    });
    expect(migrated.panels[0].targets[0]).not.toHaveProperty('datasource');
    expect(migrated.panels[0].targets[1]).toEqual({
      refId: 'B',
      kind: 'expression',
      expression: '$A * 100',
    });
    expect(migrated.panels[1].panels[0]).toMatchObject({
      datasourceCate: 'elasticsearch',
      datasourceValue: 18,
    });
  });

  it('uses mixed mode when query targets have different datasources', () => {
    const migrated = dashboardMigrator({
      version: '4.0.0',
      panels: [
        {
          id: 'panel-mixed',
          version: '4.0.0',
          type: 'timeseries',
          targets: [
            { refId: 'A', kind: 'query', datasource: { cate: 'prometheus', id: 1 }, expr: 'up' },
            { refId: 'B', kind: 'query', datasource: { cate: 'elasticsearch', id: 2 }, query: {} },
          ],
          custom: {},
          options: {},
        },
      ],
    });

    expect(migrated.panels[0]).toMatchObject({
      datasourceCate: 'mixed',
      datasourceValue: 'mixed',
    });
    expect(migrated.panels[0].targets[0].datasource).toEqual({ cate: 'prometheus', id: 1 });
    expect(migrated.panels[0].targets[1].datasource).toEqual({ cate: 'elasticsearch', id: 2 });
  });

  it('preserves query datasources when loading an existing v4 mixed panel', () => {
    const migrated = dashboardMigrator({
      version: '4.0.0',
      var: [],
      panels: [
        {
          type: 'tableNG',
          id: 'panel-mixed',
          version: '4.0.0',
          datasourceCate: 'mixed',
          datasourceValue: 'mixed',
          targets: [
            {
              refId: 'A',
              datasource: { cate: 'prometheus', id: 1 },
              expr: 'cpu_usage_idle',
              kind: 'query',
            },
            {
              refId: 'B',
              query: {
                mode: 'raw',
                project: 'sls-api-testing',
                logstore: 'demo_nginx_access_log',
              },
              kind: 'query',
              datasource: { cate: 'aliyun-sls', id: 2 },
              resultType: 'time_series',
            },
          ],
          custom: {},
          options: {},
        },
      ],
    });

    expect(migrated.panels[0]).toMatchObject({
      datasourceCate: 'mixed',
      datasourceValue: 'mixed',
      targets: [
        {
          refId: 'A',
          kind: 'query',
          datasource: { cate: 'prometheus', id: 1 },
          resultType: 'time_series',
        },
        {
          refId: 'B',
          kind: 'query',
          datasource: { cate: 'aliyun-sls', id: 2 },
          resultType: 'logs',
        },
      ],
    });
  });

  it('preserves the datasource when a v4 mixed panel has one query and one expression', () => {
    const migrated = dashboardMigrator({
      version: '4.0.0',
      panels: [
        {
          id: 'panel-mixed-expression',
          version: '4.0.0',
          type: 'timeseries',
          datasourceCate: 'mixed',
          datasourceValue: 'mixed',
          targets: [
            {
              refId: 'A',
              kind: 'query',
              datasource: { cate: 'prometheus', id: 1 },
              expr: 'avg(cpu_usage_idle)',
              resultType: 'time_series',
            },
            {
              refId: 'B',
              kind: 'expression',
              expression: '$A + 100',
              legend: 'B+100',
            },
          ],
          custom: {},
          options: {},
        },
      ],
    });

    expect(migrated.panels[0].targets).toEqual([
      {
        refId: 'A',
        kind: 'query',
        datasource: { cate: 'prometheus', id: 1 },
        expr: 'avg(cpu_usage_idle)',
        resultType: 'time_series',
      },
      {
        refId: 'B',
        kind: 'expression',
        expression: '$A + 100',
        legend: 'B+100',
      },
    ]);
  });

  it('normalizes legacy expression markers in an otherwise v4 panel', () => {
    const migrated = dashboardMigrator({
      version: '4.0.0',
      panels: [
        {
          id: 'panel-legacy-expression-marker',
          version: '4.0.0',
          type: 'timeseries',
          datasourceCate: 'aliyun-sls',
          datasourceValue: 2,
          targets: [
            {
              refId: 'A',
              kind: 'query',
              query: { mode: 'timeSeries' },
            },
            {
              refId: 'B',
              kind: 'query',
              __mode__: '__expr__',
              expr: '$A + 100',
            },
          ],
          custom: {},
          options: {},
        },
      ],
    });

    expect(migrated.panels[0].targets[1]).toEqual({
      refId: 'B',
      kind: 'expression',
      expression: '$A + 100',
    });
  });

  it('migrates the legacy Elasticsearch syntax field to filter_language', () => {
    const migrated = dashboardMigrator({
      version: '4.0.0',
      panels: [
        {
          id: 'panel-es-kql',
          version: '4.0.0',
          type: 'tableNG',
          datasourceCate: 'elasticsearch',
          datasourceValue: 12,
          targets: [
            {
              refId: 'A',
              kind: 'query',
              query: {
                index_type: 'index',
                index: 'application-*',
                syntax: 'kuery',
                filter: 'status >= 500',
              },
            },
          ],
          custom: {},
          options: {},
        },
      ],
    });

    expect(migrated.panels[0].targets[0].query).toMatchObject({
      filter: 'status >= 500',
      filter_language: 'kql',
    });
    expect(migrated.panels[0].targets[0].query).not.toHaveProperty('syntax');
  });

  it('preserves the Elasticsearch SQL query mode', () => {
    const migrated = dashboardMigrator({
      version: '4.0.0',
      panels: [{
        id: 'panel-es-sql',
        version: '4.0.0',
        type: 'tableNG',
        datasourceCate: 'elasticsearch',
        datasourceValue: 12,
        targets: [{
          refId: 'A',
          kind: 'query',
          query: { syntax: 'sql', mode: 'timeSeries', sql: 'SELECT time, value FROM logs', keys: { valueKey: ['value'], timeKey: 'time' } },
        }],
        custom: {},
        options: {},
      }],
    });

    expect(migrated.panels[0].targets[0].query).toMatchObject({ syntax: 'sql', sql: 'SELECT time, value FROM logs' });
  });

  it('is idempotent', () => {
    const once = dashboardMigrator({
      version: '3.4.0',
      panels: [legacyPanel],
    });
    expect(dashboardMigrator(once)).toEqual(once);
  });

  it('migrates old row state by dashboard version and removes panel versions', () => {
    const migrated = dashboardMigrator({
      version: '4.0.0',
      panels: [
        { id: 'row-collapsed', type: 'row', version: '4.0.0', collapsed: true },
        { id: 'chart', type: 'timeseries', version: '4.0.0', targets: [], custom: {}, options: {} },
        {
          id: 'row-expanded',
          type: 'row',
          version: '4.0.0',
          collapsed: false,
          panels: [{ id: 'nested-chart', type: 'timeseries', version: '4.0.0', targets: [], custom: {}, options: {} }],
        },
      ],
    });

    expect(migrated).toMatchObject({
      version: '4.1.0',
      panels: [
        { id: 'row-collapsed', collapsed: false },
        { id: 'chart', type: 'timeseries' },
        { id: 'row-expanded', collapsed: true, panels: [{ id: 'nested-chart' }] },
      ],
    });
    expect(migrated.panels[0]).not.toHaveProperty('version');
    expect(migrated.panels[1]).not.toHaveProperty('version');
    expect(migrated.panels[2].panels?.[0]).not.toHaveProperty('version');
    expect(dashboardMigrator(migrated)).toEqual(migrated);
  });

  it('skips legacy panel migrations when dashboard version is v4.1.0', () => {
    const migrated = dashboardMigrator({
      version: '4.1.0',
      panels: [
        { id: 'row-current', type: 'row', version: '4.0.0', collapsed: true },
        { id: 'chart-legacy', type: 'timeseries', version: '3.4.0', targets: [{ expr: 'up' }], custom: {}, options: {} },
      ],
    });

    expect(migrated).toMatchObject({
      version: '4.1.0',
      panels: [
        { id: 'row-current', collapsed: true },
        { id: 'chart-legacy', targets: [{ expr: 'up' }] },
      ],
    });
    expect(migrated.panels[0]).not.toHaveProperty('version');
    expect(migrated.panels[1]).not.toHaveProperty('version');
  });

  it('returns an empty dashboard for invalid input and drops invalid panels and targets', () => {
    expect(dashboardMigrator(null)).toEqual({ panels: [] });
    expect(dashboardMigrator({ panels: {} })).toEqual({ panels: [] });
    expect(decodeLegacyDashboard({ panels: [null, { targets: [null, { expr: 'up' }] }] })).toEqual({
      panels: [{ targets: [{ expr: 'up' }] }],
    });
  });

  it('preserves embedded Grafana dashboard configs', () => {
    const iframeDashboard = {
      mode: 'iframe',
      iframe_url: 'https://grafana.example.com/d/abc',
      version: '4.0.0',
    };

    expect(dashboardMigrator(iframeDashboard)).toEqual(iframeDashboard);
  });

  it('migrates missing-version panels through the legacy version chain', () => {
    const panel = dashboardMigrator({
      panels: [{ targets: [{ expr: 'up', maxDataPoints: 100, time: { start: 'now-2h', end: 'now' } }], options: {}, custom: {} }],
    }).panels[0];

    expect(panel).toMatchObject({
      maxDataPoints: 100,
      queryOptionsTime: { start: 'now-2h', end: 'now' },
      datasourceCate: 'prometheus',
      targets: [{ refId: 'A', kind: 'query', resultType: 'time_series' }],
    });
    expect(panel).not.toHaveProperty('version');
    expect(panel.targets[0]).not.toHaveProperty('maxDataPoints');
    expect(panel.targets[0]).not.toHaveProperty('time');
  });

  it('migrates v3.3 options, bar gauge settings, and old row children', () => {
    const migrated = dashboardMigrator({
      panels: [
        {
          version: '3.0.0',
          type: 'barGauge',
          targets: [],
          custom: { maxValue: 90, baseColor: 'red', stack: 'noraml' },
          options: { standardOptions: { util: 'percent' } },
          overrides: [{ properties: { rightYAxisDisplay: 'noraml', standardOptions: { util: 'bytesSI' } } }],
        },
        { version: '3.1.0', type: 'row', panels: [{ targets: [{ expr: 'up', maxDataPoints: 12 }], custom: {}, options: {} }] },
      ],
    });

    expect(migrated.panels[0]).toMatchObject({
      options: { standardOptions: { unit: 'percent', max: 90 }, thresholds: { steps: [{ color: 'red' }] } },
      custom: { stack: 'normal' },
      overrides: [{ properties: { rightYAxisDisplay: 'normal', standardOptions: { unit: 'bytesSI' } } }],
    });
    expect(migrated.panels[1].panels[0]).toMatchObject({ maxDataPoints: 12 });
    expect(migrated.panels[1].panels[0]).not.toHaveProperty('version');
  });

  it('preserves existing bar gauge thresholds and normalizes OpenSearch and log targets', () => {
    const migrated = dashboardMigrator({
      panels: [
        {
          version: '3.0.0',
          type: 'barGauge',
          datasourceCate: 'opensearch',
          datasourceValue: 1,
          options: { thresholds: { mode: 'percentage' } },
          custom: { baseColor: 'red' },
          targets: [{ query: { syntax: 'sql', mode: 'logs' } }, { query: { values: [{ func: 'rawData' }] } }],
        },
      ],
    }).panels[0];

    expect(migrated.options?.thresholds).toEqual({ mode: 'percentage' });
    expect(migrated.targets).toMatchObject([
      { refId: 'A', resultType: 'logs', query: { syntax: 'sql', mode: 'logs' } },
      { refId: 'B', resultType: 'logs' },
    ]);
    expect(migrated.targets[0].query).not.toHaveProperty('filter_language');
  });
});
