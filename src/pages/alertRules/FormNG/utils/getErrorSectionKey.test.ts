import getErrorSectionKey from './getErrorSectionKey';

describe('getErrorSectionKey', () => {
  it('顶层字段映射到所在分区', () => {
    expect(getErrorSectionKey(['name'])).toBe('basic');
    expect(getErrorSectionKey(['cate'])).toBe('datasource');
    expect(getErrorSectionKey(['datasource_queries', 0, 'values'])).toBe('datasource');
    expect(getErrorSectionKey(['notify_repeat_step'])).toBe('notify');
    expect(getErrorSectionKey(['effective_time', 0, 'enable_stime'])).toBe('effective');
    expect(getErrorSectionKey(['pipeline_configs', 0, 'pipeline_id'])).toBe('pipeline');
  });

  it('rule_config 默认映射到 rule，特殊子路径映射到各自所在分区', () => {
    expect(getErrorSectionKey(['rule_config', 'triggers', 0, 'severity'])).toBe('rule');
    expect(getErrorSectionKey(['rule_config', 'queries', 0, 'prom_ql'])).toBe('rule');
    expect(getErrorSectionKey(['rule_config', 'event_relabel_config', 0, 'action'])).toBe('pipeline');
    // 自愈任务模板渲染在通知分区，不能跟着 rule_config 落到 rule
    expect(getErrorSectionKey(['rule_config', 'task_tpls', 0, 'tpl_id'])).toBe('notify');
  });

  it('extra_config 按第二级路径映射', () => {
    expect(getErrorSectionKey(['extra_config', 'custom_notify_tpl', 'email'])).toBe('notify');
    expect(getErrorSectionKey(['extra_config', 'service_cal_configs', 0])).toBe('effective');
    expect(getErrorSectionKey(['extra_config', 'enrich_queries', 0])).toBe('pipeline');
    expect(getErrorSectionKey(['extra_config', 'unknown_field'])).toBeUndefined();
  });

  it('未登记字段与空入参返回 undefined（调用方走全部展开兜底）', () => {
    expect(getErrorSectionKey(['some_unknown_field'])).toBeUndefined();
    expect(getErrorSectionKey([])).toBeUndefined();
    expect(getErrorSectionKey(undefined)).toBeUndefined();
  });
});
