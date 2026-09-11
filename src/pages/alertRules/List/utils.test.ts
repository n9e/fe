import { matchSearch, matchTriggerType, TRIGGER_TYPE_OPTIONS } from './utils';

const rule = (rule_config?: unknown) => ({ rule_config });

describe('matchTriggerType', () => {
  it('未指定 triggerType 时返回 true（不参与过滤）', () => {
    expect(matchTriggerType(rule({}), undefined)).toBe(true);
    expect(matchTriggerType(rule(), undefined)).toBe(true);
    expect(matchTriggerType(undefined, undefined)).toBe(true);
  });

  describe('阈值告警', () => {
    it('exp_trigger_disable 为 false 时命中', () => {
      expect(matchTriggerType(rule({ exp_trigger_disable: false }), 'threshold')).toBe(true);
    });

    it('exp_trigger_disable 为 true（已禁用）时不命中', () => {
      expect(matchTriggerType(rule({ exp_trigger_disable: true }), 'threshold')).toBe(false);
    });

    it('exp_trigger_disable 缺省时视为阈值告警', () => {
      expect(matchTriggerType(rule({}), 'threshold')).toBe(true);
      expect(matchTriggerType(rule(), 'threshold')).toBe(true);
    });
  });

  describe('无数据告警', () => {
    it('nodata_trigger.enable 为 true 时命中', () => {
      expect(matchTriggerType(rule({ nodata_trigger: { enable: true } }), 'nodata')).toBe(true);
    });

    it('nodata_trigger.enable 为 false 或缺省时不命中', () => {
      expect(matchTriggerType(rule({ nodata_trigger: { enable: false } }), 'nodata')).toBe(false);
      expect(matchTriggerType(rule({}), 'nodata')).toBe(false);
      expect(matchTriggerType(rule(), 'nodata')).toBe(false);
    });
  });

  describe('智能告警', () => {
    it('anomaly_trigger.enable 为 true 时命中', () => {
      expect(matchTriggerType(rule({ anomaly_trigger: { enable: true } }), 'anomaly')).toBe(true);
    });

    it('anomaly_trigger.enable 为 false 或缺省时不命中', () => {
      expect(matchTriggerType(rule({ anomaly_trigger: { enable: false } }), 'anomaly')).toBe(false);
      expect(matchTriggerType(rule({}), 'anomaly')).toBe(false);
      expect(matchTriggerType(rule(), 'anomaly')).toBe(false);
    });
  });
});

describe('TRIGGER_TYPE_OPTIONS', () => {
  it('包含阈值告警、无数据告警、智能告警三种类型', () => {
    expect(TRIGGER_TYPE_OPTIONS.map((opt) => opt.value)).toEqual(['threshold', 'nodata', 'anomaly']);
  });
});

describe('matchSearch', () => {
  const searchRule = (rule_config?: unknown) => ({ name: 'CPU 使用率过高', append_tags: ['team=infra', 'env=prod'], rule_config });

  it('未输入搜索词时返回 true（不参与过滤）', () => {
    expect(matchSearch(searchRule(), undefined)).toBe(true);
    expect(matchSearch(searchRule(), '')).toBe(true);
  });

  it('按名称或附加标签匹配，不区分大小写', () => {
    expect(matchSearch(searchRule(), 'cpu')).toBe(true);
    expect(matchSearch(searchRule(), 'ENV=PROD')).toBe(true);
    expect(matchSearch(searchRule(), 'memory')).toBe(false);
  });

  it('命中 Prometheus 普通模式 prom_ql 中的片段', () => {
    const target = searchRule({ queries: [{ prom_ql: 'rate(node_cpu_seconds_total[5m]) == 0', severity: 2 }] });
    expect(matchSearch(target, 'node_cpu_seconds_total')).toBe(true);
    expect(matchSearch(target, '== 0')).toBe(true);
    expect(matchSearch(target, 'node_load1')).toBe(false);
  });

  it('命中 Prometheus 高级模式（v2）query 中的片段', () => {
    const target = searchRule({ version: 'v2', queries: [{ ref: 'A', query: 'up{job="node"}' }] });
    expect(matchSearch(target, 'job="node"')).toBe(true);
  });

  it('多条查询任意一条命中即可', () => {
    const target = searchRule({ queries: [{ prom_ql: 'node_load1 > 10' }, { prom_ql: 'node_memory_MemAvailable_bytes < 1e9' }] });
    expect(matchSearch(target, 'memavailable')).toBe(true);
    expect(matchSearch(target, 'NODE_LOAD1')).toBe(true);
  });

  it('命中 SQL 类数据源 sql 中的片段', () => {
    const target = searchRule({ queries: [{ sql: 'SELECT count(*) FROM orders' }] });
    expect(matchSearch(target, 'from orders')).toBe(true);
  });

  it('命中 Elasticsearch filter 中的查询条件（名称和标签未命中）', () => {
    const target = searchRule({ queries: [{ index: 'logs-*', filter: 'status:500' }] });
    expect(matchSearch(target, 'status:500')).toBe(true);
  });

  it('没有查询语句的规则只按名称和标签匹配', () => {
    expect(matchSearch(searchRule(), 'node_')).toBe(false);
    expect(matchSearch(searchRule({}), 'node_')).toBe(false);
    // 主机类规则的查询不含查询语句字段，字段名和非字符串值都不参与匹配
    expect(matchSearch(searchRule({ queries: [{ key: 'group_ids', op: '==', values: [1] }] }), 'group_ids')).toBe(false);
    expect(matchSearch(searchRule({ queries: [{ query: { index: 'logs' } }] }), 'logs')).toBe(false);
  });
});
