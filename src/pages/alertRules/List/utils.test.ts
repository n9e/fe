import { getNorthstarRuleName, getProductRulePath, hasProductRuleSpaceId, isProductRule, matchSearch, matchTriggerType, TRIGGER_TYPE_OPTIONS } from './utils';

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

  it('命中其他数据源统一查询字段 query_string、promql、expression 中的片段', () => {
    expect(matchSearch(searchRule({ queries: [{ query_string: 'fields @message | filter qa_es_unique' }] }), 'qa_es_unique')).toBe(true);
    expect(matchSearch(searchRule({ queries: [{ query_type: 'promql', promql: 'sum(gcm_request_count)' }] }), 'gcm_request_count')).toBe(true);
    expect(matchSearch(searchRule({ queries: [{ expression: 'SUM(METRICS())' }] }), 'metrics()')).toBe(true);
  });

  it('没有查询语句的规则只按名称和标签匹配', () => {
    expect(matchSearch(searchRule(), 'node_')).toBe(false);
    expect(matchSearch(searchRule({}), 'node_')).toBe(false);
    // 主机类规则的查询不含查询语句字段，字段名和非字符串值都不参与匹配
    expect(matchSearch(searchRule({ queries: [{ key: 'group_ids', op: '==', values: [1] }] }), 'group_ids')).toBe(false);
    expect(matchSearch(searchRule({ queries: [{ query: { index: 'logs' } }] }), 'logs')).toBe(false);
  });
});

describe('isProductRule', () => {
  it('灭火图、北极星规则识别为产品规则', () => {
    expect(isProductRule({ prod: 'firemap' })).toBe(true);
    expect(isProductRule({ prod: 'northstar' })).toBe(true);
  });

  it('普通数据源规则、缺省 prod 不是产品规则', () => {
    expect(isProductRule({ prod: 'metric' })).toBe(false);
    expect(isProductRule({ prod: 'host' })).toBe(false);
    expect(isProductRule({})).toBe(false);
    expect(isProductRule(undefined)).toBe(false);
  });
});

describe('getProductRulePath', () => {
  const firemapRule = {
    id: 1844,
    prod: 'firemap',
    name: 'firemap/1844/CPU 使用率过高',
    rule_config: { workspace_id: 6773224013418 },
  } as const;

  it('灭火图规则跳回灭火图，带上空间与规则 id', () => {
    expect(getProductRulePath(firemapRule)).toBe('/firemap?spaceId=6773224013418&alertRuleId=1844');
  });

  it('北极星规则从名称里解析业务线 ID', () => {
    expect(getProductRulePath({ ...firemapRule, prod: 'northstar', name: 'northstar/24/sss' })).toBe('/polaris/24?spaceId=6773224013418&alertRuleId=1844');
    // 只有前缀 + 业务线 ID 也能解析
    expect(getProductRulePath({ ...firemapRule, prod: 'northstar', name: 'northstar/24' })).toBe('/polaris/24?spaceId=6773224013418&alertRuleId=1844');
  });

  it('北极星规则名称解析不出业务线 ID 时不生成链接', () => {
    ['sss', 'northstar', 'northstar/', 'northstar/abc/sss', '', undefined].forEach((name) => {
      expect(getProductRulePath({ id: 1844, prod: 'northstar', name, rule_config: { workspace_id: 1 } })).toBeUndefined();
    });
  });

  it('北极星不再从 rule_config 兜底 business_id', () => {
    expect(getProductRulePath({ id: 1844, prod: 'northstar', name: 'sss', rule_config: { workspace_id: 1, business_id: 12 } })).toBeUndefined();
  });

  it('rule_config 缺少 workspace_id 时不生成链接（降级为纯文本）', () => {
    expect(getProductRulePath({ id: 1844, prod: 'firemap', rule_config: {} })).toBeUndefined();
    expect(getProductRulePath({ id: 1844, prod: 'firemap' })).toBeUndefined();
    expect(getProductRulePath({ id: 1844, prod: 'firemap', rule_config: { workspace_id: '' } })).toBeUndefined();
  });

  it('识别不出规则 id 时不生成链接', () => {
    expect(getProductRulePath({ prod: 'firemap', rule_config: { workspace_id: 1 } })).toBeUndefined();
  });

  it('普通数据源规则不生成产品链接', () => {
    expect(getProductRulePath({ id: 1844, prod: 'metric', rule_config: { workspace_id: 1 } })).toBeUndefined();
  });

  it('空间 ID 为数字或字符串都能拼进链接', () => {
    expect(getProductRulePath({ id: 7, prod: 'firemap', rule_config: { workspace_id: 99 } })).toBe('/firemap?spaceId=99&alertRuleId=7');
    expect(getProductRulePath({ id: 7, prod: 'firemap', rule_config: { workspace_id: '99' } })).toBe('/firemap?spaceId=99&alertRuleId=7');
  });
});

describe('hasProductRuleSpaceId', () => {
  it('rule_config.workspace_id 有值时返回 true', () => {
    expect(hasProductRuleSpaceId({ rule_config: { workspace_id: 99 } })).toBe(true);
    expect(hasProductRuleSpaceId({ rule_config: { workspace_id: '99' } })).toBe(true);
  });

  it('缺少 rule_config、workspace_id 或值为空时返回 false', () => {
    expect(hasProductRuleSpaceId({})).toBe(false);
    expect(hasProductRuleSpaceId({ rule_config: {} })).toBe(false);
    expect(hasProductRuleSpaceId({ rule_config: { workspace_id: '' } })).toBe(false);
    expect(hasProductRuleSpaceId(undefined)).toBe(false);
  });
});

describe('getNorthstarRuleName', () => {
  it('从 northstar/<业务线 ID>/<规则名> 里取出真实规则名', () => {
    expect(getNorthstarRuleName('northstar/24/sss')).toBe('sss');
    expect(getNorthstarRuleName('northstar/24/CPU 使用率过高')).toBe('CPU 使用率过高');
    expect(getNorthstarRuleName('northstar/24/sss/extra')).toBe('sss/extra');
    expect(getNorthstarRuleName('  northstar/24/sss  ')).toBe('sss');
  });

  it('没有真实规则名或格式不符时返回 undefined', () => {
    ['northstar/24', 'northstar/24/', 'northstar/24/   ', 'sss', 'northstar', 'northstar/abc/sss', '', undefined].forEach((name) => {
      expect(getNorthstarRuleName(name)).toBeUndefined();
    });
  });
});
