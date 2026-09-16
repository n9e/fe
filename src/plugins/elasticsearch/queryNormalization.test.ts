import {
  normalizeElasticsearchAlertRuleQueryForPersist,
  normalizeElasticsearchDashboardTargetForPersist,
  normalizeElasticsearchRecordingRuleQueryForPersist,
} from './queryNormalization';

describe('Elasticsearch query persistence normalization', () => {
  it('SQL 保存时只保留 SQL 配置', () => {
    const query = {
      syntax: 'sql',
      sql: 'SELECT count(*) FROM logs',
      keys: { valueKey: ['count'] },
      editMode: 'code',
      interval: 60,
      index: 'logs-*',
      filter: 'service:web',
      date_field: '@timestamp',
      value: { func: 'count' },
      group_by: [{ field: 'host' }],
      builderConfig: { index: 'logs-*' },
    };

    expect(normalizeElasticsearchAlertRuleQueryForPersist(query)).toEqual({
      syntax: 'sql',
      sql: 'SELECT count(*) FROM logs',
      keys: { valueKey: ['count'] },
      editMode: 'code',
      interval: 60,
    });
    expect(query).toHaveProperty('index', 'logs-*');
    expect(query).toHaveProperty('builderConfig');
  });

  it('DSL 保存时清理 SQL 与 UI 状态', () => {
    const query = {
      syntax: 'dsl',
      index_type: 'index_pattern',
      index: 'logs-*',
      index_pattern: 'logs-pattern',
      value: { func: 'count' },
      sql: 'SELECT 1',
      keys: { valueKey: ['count'] },
      editMode: 'builder',
      builderConfig: { index: 'logs-*' },
    };

    expect(normalizeElasticsearchAlertRuleQueryForPersist(query)).toEqual({
      syntax: 'dsl',
      index_type: 'index_pattern',
      index_pattern: 'logs-pattern',
      value: { func: 'count' },
    });
    expect(query).toHaveProperty('index', 'logs-*');
  });

  it('DSL 索引模式为索引时清理索引模式字段', () => {
    expect(
      normalizeElasticsearchAlertRuleQueryForPersist({
        syntax: 'dsl',
        index_type: 'index',
        index: 'logs-*',
        index_pattern: 'logs-pattern',
      }),
    ).toEqual({
      syntax: 'dsl',
      index_type: 'index',
      index: 'logs-*',
    });
  });

  it('记录规则和仪表盘使用各自的嵌套结构', () => {
    const recordingQuery = normalizeElasticsearchRecordingRuleQueryForPersist({
      cate: 'elasticsearch',
      config: { syntax: 'sql', sql: 'SELECT 1', index: 'logs-*' },
    });
    const dashboardTarget = normalizeElasticsearchDashboardTargetForPersist({
      refId: 'A',
      query: { syntax: 'dsl', index: 'logs-*', sql: 'SELECT 1', mode: 'raw' },
    });

    expect(recordingQuery.config).toEqual({ syntax: 'sql', sql: 'SELECT 1' });
    expect(dashboardTarget.query).toEqual({ syntax: 'dsl', index: 'logs-*' });
  });
});
