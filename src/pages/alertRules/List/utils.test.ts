import { getNorthstarRuleName, getProductRuleLink, isProductRule, matchSearch, matchTriggerType, TRIGGER_TYPE_OPTIONS } from './utils';

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

describe('getProductRuleLink', () => {
  const mapping = [{ business_id: 24, workspace_id: 6773224013418 }] as const;
  const firemapRule = {
    id: 1844,
    prod: 'firemap',
    name: 'firemap/1844/CPU 使用率过高',
    rule_config: { workspace_id: 6773224013418 },
  } as const;

  it('灭火图规则跳回灭火图，空间取 rule_config.workspace_id', () => {
    expect(getProductRuleLink(firemapRule, mapping)).toEqual({ path: '/firemap?spaceId=6773224013418&alertRuleId=1844', missingSpace: false });
  });

  it('北极星规则按名称里的业务线 ID，从映射里取空间', () => {
    expect(getProductRuleLink({ ...firemapRule, prod: 'northstar', name: 'northstar/24/sss' }, mapping)).toEqual({
      path: '/polaris/24?spaceId=6773224013418&alertRuleId=1844',
      missingSpace: false,
    });
    // 只有前缀 + 业务线 ID 也能解析
    expect(getProductRuleLink({ ...firemapRule, prod: 'northstar', name: 'northstar/24' }, mapping)).toEqual({
      path: '/polaris/24?spaceId=6773224013418&alertRuleId=1844',
      missingSpace: false,
    });
  });

  it('北极星不再使用 rule_config.workspace_id，映射缺失时按缺空间处理', () => {
    expect(getProductRuleLink({ id: 1, prod: 'northstar', name: 'northstar/24/sss', rule_config: { workspace_id: 99 } }, [])).toEqual({ missingSpace: true });
    expect(getProductRuleLink({ id: 1, prod: 'northstar', name: 'northstar/24/sss' }, undefined)).toEqual({ missingSpace: true });
    // 映射里没有该业务线
    expect(getProductRuleLink({ id: 1, prod: 'northstar', name: 'northstar/99/sss' }, mapping)).toEqual({ missingSpace: true });
  });

  it('北极星名称解析不出业务线 ID 时只降级纯文本，不提示缺空间', () => {
    ['sss', 'northstar', 'northstar/', 'northstar/abc/sss', '', undefined].forEach((name) => {
      expect(getProductRuleLink({ id: 1, prod: 'northstar', name }, mapping)).toEqual({ missingSpace: false });
    });
  });

  it('灭火图缺少 rule_config.workspace_id 时提示缺空间', () => {
    expect(getProductRuleLink({ id: 1844, prod: 'firemap', rule_config: {} })).toEqual({ missingSpace: true });
    expect(getProductRuleLink({ id: 1844, prod: 'firemap' })).toEqual({ missingSpace: true });
    expect(getProductRuleLink({ id: 1844, prod: 'firemap', rule_config: { workspace_id: '' } })).toEqual({ missingSpace: true });
  });

  it('识别不出规则 id 时不生成链接', () => {
    expect(getProductRuleLink({ prod: 'firemap', rule_config: { workspace_id: 1 } })).toEqual({ missingSpace: false });
  });

  it('普通数据源规则不生成产品链接', () => {
    expect(getProductRuleLink({ id: 1844, prod: 'metric', rule_config: { workspace_id: 1 } }, mapping)).toEqual({ missingSpace: false });
  });

  it('空间 ID 为数字或字符串都能拼进链接', () => {
    expect(getProductRuleLink({ id: 7, prod: 'firemap', rule_config: { workspace_id: 99 } })).toEqual({ path: '/firemap?spaceId=99&alertRuleId=7', missingSpace: false });
    expect(getProductRuleLink({ id: 7, prod: 'firemap', rule_config: { workspace_id: '99' } })).toEqual({ path: '/firemap?spaceId=99&alertRuleId=7', missingSpace: false });
    expect(getProductRuleLink({ id: 7, prod: 'northstar', name: 'northstar/24/x' }, [{ business_id: '24', workspace_id: '9' }])).toEqual({
      path: '/polaris/24?spaceId=9&alertRuleId=7',
      missingSpace: false,
    });
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
