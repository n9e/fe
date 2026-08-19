import dashboardMigrator, { type LegacyPanel } from './dashboardMigrator';
import { DASHBOARD_DATASOURCE_CATES } from '@/pages/dashboard/Renderer/datasource/registry';
import { buildLegacyDashboard, catesUnderTest, legacyLogsPanelSpecByCate, legacyPanelSpecByCate, logsCatesUnderTest } from '@/pages/dashboard/test/fixtures/legacyDashboardsByCate';

// 与 registry.ts 中 LOG_CAPABLE_DATASOURCES 一致的日志类 cate（fixture 完整性守卫）
const LOG_CAPABLE_CATES = [
  'elasticsearch',
  'opensearch',
  'ck',
  'mysql',
  'pgsql',
  'doris',
  'oracle',
  'sqlserver',
  'redshift',
  'aliyun-sls',
  'tencent-cls',
  'volc-tls',
  'huawei-lts',
  'bce-bls',
  'cloudwatchlogs',
] as const;

describe('dashboardMigrator legacy cate coverage', () => {
  it('covers every supported dashboard datasource cate', () => {
    expect(Object.keys(legacyPanelSpecByCate).sort()).toEqual([...DASHBOARD_DATASOURCE_CATES].sort());
  });

  it('provides logs variants for every logs-capable cate', () => {
    expect(logsCatesUnderTest).toEqual([...LOG_CAPABLE_CATES].sort());
  });

  it.each(catesUnderTest)('migrates a legacy %s panel to v4 keeping the panel-level datasource', (cate) => {
    const spec = legacyPanelSpecByCate[cate];
    const migrated = dashboardMigrator(buildLegacyDashboard(spec));
    expect(migrated.version).toBe('4.0.0');

    const panel = migrated.panels[0] as LegacyPanel;
    expect(panel.version).toBe('4.0.0');
    // 旧面板迁移后数据源仍挂在 panel 级，target 上不出现 datasource
    expect(panel.datasourceCate).toBe(cate);
    expect(panel.datasourceValue).toBe(spec.datasourceValue);

    const target = panel.targets?.[0];
    expect(target?.refId).toBe('A');
    expect(target?.kind).toBe('query');
    expect(target?.resultType).toBe('time_series');
    expect(target).not.toHaveProperty('datasource');
  });

  it.each(logsCatesUnderTest)('infers logs resultType for legacy %s raw queries', (cate) => {
    const migrated = dashboardMigrator(buildLegacyDashboard(legacyLogsPanelSpecByCate[cate]));
    expect(migrated.panels[0].targets?.[0]?.resultType).toBe('logs');
  });

  it('migrates elasticsearch and opensearch syntax to filter_language', () => {
    for (const cate of ['elasticsearch', 'opensearch'] as const) {
      const migrated = dashboardMigrator(buildLegacyDashboard(legacyPanelSpecByCate[cate]));
      const target = migrated.panels[0].targets?.[0];
      expect(target?.query).toMatchObject({ filter_language: 'kql' });
      expect(target?.query).not.toHaveProperty('syntax');
      // 多 value 展开发生在请求层，迁移器保持 values 原样
      expect(target?.query?.values).toHaveLength(2);
    }
  });

  it('is idempotent for every cate', () => {
    for (const cate of catesUnderTest) {
      const once = dashboardMigrator(buildLegacyDashboard(legacyPanelSpecByCate[cate]));
      expect(dashboardMigrator(once)).toEqual(once);
    }
  });
});
