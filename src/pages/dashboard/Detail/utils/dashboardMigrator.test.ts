import dashboardMigrator from './dashboardMigrator';

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

    expect(migrated.version).toBe('4.0.0');
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

  it('is idempotent', () => {
    const once = dashboardMigrator({
      version: '3.4.0',
      panels: [legacyPanel],
    });
    expect(dashboardMigrator(once)).toEqual(once);
  });
});
