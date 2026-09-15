import { migrateDashboardSchema, DASHBOARD_SCHEMA_VERSION } from './migrate';

describe('migrateDashboardSchema', () => {
  it('migrates a schema 37 dashboard to 42 and writes back schemaVersion', () => {
    const input = {
      schemaVersion: 37,
      title: 'test',
      panels: [
        {
          id: 1,
          type: 'timeseries',
          options: { legend: { displayMode: 'hidden' } },
          fieldConfig: { overrides: [{ properties: [{ id: 'custom.hideFrom', value: { viz: true } }] }] },
        },
      ],
      refresh: true,
      timepicker: { time_options: ['5m', '15m'] },
    };
    const { dashboard, migrations } = migrateDashboardSchema(input);

    expect(dashboard.schemaVersion).toBe(42);
    expect(dashboard.refresh).toBe('');
    expect(dashboard.timepicker.time_options).toBeUndefined();
    // v42：override 中 hideFrom.viz === true → 补 tooltip（与 grafana 源码一致，只处理 overrides）
    expect(dashboard.panels[0].fieldConfig.overrides[0].properties[0].value.tooltip).toBe(true);
    // 台账覆盖 38-42
    const versions = migrations.map((m) => m.version);
    expect(versions).toEqual(expect.arrayContaining([38, 39, 40, 41, 42]));
    expect(migrations.find((m) => m.version === 40)?.status).toBe('applied');
  });

  it('does not mutate the input and is idempotent', () => {
    const input: any = {
      schemaVersion: 30,
      title: 'x',
      panels: [{ id: 1, type: 'stat' }],
      refresh: false,
    };
    const before = JSON.stringify(input);
    const first = migrateDashboardSchema(input).dashboard;
    expect(JSON.stringify(input)).toBe(before);
    const second = migrateDashboardSchema(first).dashboard;
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it('migrates v38 displayMode to cellOptions in defaults and overrides', () => {
    const input: any = {
      schemaVersion: 37,
      panels: [
        {
          id: 1,
          type: 'table',
          fieldConfig: {
            defaults: { custom: { displayMode: 'color-background' } },
            overrides: [{ properties: [{ id: 'custom.displayMode', value: 'basic' }] }],
          },
        },
      ],
    };
    const { dashboard } = migrateDashboardSchema(input);
    const fieldConfig = dashboard.panels[0].fieldConfig;
    expect(fieldConfig.defaults.custom.cellOptions).toEqual({ type: 'color-background', mode: 'gradient' });
    expect(fieldConfig.defaults.custom.displayMode).toBeUndefined();
    expect(fieldConfig.overrides[0].properties[0]).toEqual({ id: 'custom.cellOptions', value: { type: 'gauge', mode: 'basic' } });
  });

  it('migrates v39 timeSeriesTable refIdToStat', () => {
    const input: any = {
      schemaVersion: 38,
      panels: [
        {
          id: 1,
          type: 'timeseries',
          transformations: [{ id: 'timeSeriesTable', options: { refIdToStat: { A: 'mean', B: 'max' } } }],
        },
      ],
    };
    const { dashboard } = migrateDashboardSchema(input);
    expect(dashboard.panels[0].transformations[0].options).toEqual({ A: { stat: 'mean' }, B: { stat: 'max' } });
  });

  it('migrates v16 rows to grid layout', () => {
    const input: any = {
      schemaVersion: 15,
      rows: [{ title: 'r1', panels: [{ id: 1, type: 'stat', span: 6, height: '200px' }] }],
    };
    const { dashboard } = migrateDashboardSchema(input);
    expect(dashboard.rows).toBeUndefined();
    expect(Array.isArray(dashboard.panels)).toBe(true);
    expect(dashboard.panels.length).toBeGreaterThan(0);
    expect(dashboard.panels[0].gridPos).toBeDefined();
  });

  it('records skipped migrations for runtime-dependent versions', () => {
    const { migrations } = migrateDashboardSchema({ schemaVersion: 0, panels: [] });
    const skipped = migrations.filter((m) => m.status === 'skipped').map((m) => m.version);
    expect(skipped).toEqual(expect.arrayContaining([4, 9, 13, 31, 33, 34, 35, 36]));
  });

  it('returns early without changes when already at target version', () => {
    const input = { schemaVersion: DASHBOARD_SCHEMA_VERSION, panels: [] };
    const { dashboard, migrations } = migrateDashboardSchema(input);
    expect(migrations).toEqual([]);
    expect(dashboard.schemaVersion).toBe(42);
  });
});
