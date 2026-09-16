import { normalizeDashboardPanelForPersist } from './normalization';

describe('dashboard panel persistence normalization', () => {
  it('按 target 数据源清理 ES SQL 遗留的 DSL 配置', () => {
    const panel: any = {
      targets: [
        {
          refId: 'A',
          datasource: { cate: 'elasticsearch', id: 1 },
          query: { syntax: 'sql', sql: 'SELECT 1', index: 'logs-*', values: [{ func: 'count' }] },
        },
        {
          refId: 'B',
          datasource: { cate: 'prometheus', id: 2 },
          query: { syntax: 'sql', sql: 'up', index: 'must-stay' },
        },
      ],
    };

    const result = normalizeDashboardPanelForPersist(panel);

    expect(result.targets?.[0].query).toEqual({ syntax: 'sql', sql: 'SELECT 1' });
    expect(result.targets?.[1]).toBe(panel.targets[1]);
    expect(panel.targets[0].query).toHaveProperty('index', 'logs-*');
  });

  it('兼容旧面板级数据源，并在 DSL 保存时清理 SQL 状态', () => {
    const result = normalizeDashboardPanelForPersist({
      datasourceCate: 'opensearch',
      targets: [
        {
          refId: 'A',
          query: { syntax: 'dsl', index: 'logs-*', sql: 'SELECT 1', keys: { valueKey: ['count'] }, editMode: 'builder', mode: 'raw' },
        },
      ],
    } as any);

    expect(result.targets?.[0].query).toEqual({ syntax: 'dsl', index: 'logs-*' });
  });
});
