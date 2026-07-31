import { matchTriggerType, TRIGGER_TYPE_OPTIONS } from './utils';

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
