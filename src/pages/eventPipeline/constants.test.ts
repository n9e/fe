import _ from 'lodash';

import { getDefaultProcessorConfig, RELABEL_DEFAULT_SEPARATOR, CALLBACK_DEFAULT_TIMEOUT, AI_SUMMARY_DEFAULT_TIMEOUT, DEFAULT_VALUES } from './constants';

// 编辑器里 Form.Item initialValue 写进 config 的字段。
// 这些必须落在 getDefaultProcessorConfig 的结果里，否则卡片一挂载 config 就与默认值不等，
// Processor/index.tsx 的 touched 判定恒为 true，用户一个字没改也会被弹「切换会清空配置」。
const EDITOR_INITIAL_VALUES: Record<string, Record<string, unknown>> = {
  relabel: { separator: RELABEL_DEFAULT_SEPARATOR },
  ai_summary: { timeout: AI_SUMMARY_DEFAULT_TIMEOUT },
};

const t = (key: string) => `translated:${key}`;

describe('getDefaultProcessorConfig', () => {
  it('covers every value the editors write via initialValue', () => {
    _.forEach(EDITOR_INITIAL_VALUES, (initialValues, typ) => {
      const defaults = getDefaultProcessorConfig(typ, t);
      _.forEach(initialValues, (value, field) => {
        expect([typ, field, defaults[field]]).toEqual([typ, field, value]);
      });
    });
  });

  // 这条是 P1-5 的核心不变量：刚挂载、用户没动过的处理器不能被判成「改过」
  it('makes a freshly mounted processor compare equal to its defaults', () => {
    _.forEach(['relabel', 'callback', 'event_update', 'ai_summary'], (typ) => {
      const mounted = { ...getDefaultProcessorConfig(typ, t), ...EDITOR_INITIAL_VALUES[typ] };
      expect(_.isEqual(mounted, getDefaultProcessorConfig(typ, t))).toBe(true);
    });
  });

  it('returns fresh objects so callers cannot mutate the defaults', () => {
    const a = getDefaultProcessorConfig('relabel', t);
    a.action = 'labeldrop';
    expect(getDefaultProcessorConfig('relabel', t).action).toBe('replace');
  });

  it('localises the ai_summary prompt template through the passed translator', () => {
    expect(getDefaultProcessorConfig('ai_summary', t).prompt_template).toBe('translated:ai_summary.prompt_template_placeholder');
    expect(getDefaultProcessorConfig('ai_summary', t).timeout).toBe(AI_SUMMARY_DEFAULT_TIMEOUT);
  });

  it('falls back to an empty config for unknown or missing types', () => {
    expect(getDefaultProcessorConfig(undefined, t)).toEqual({});
    expect(getDefaultProcessorConfig('no_such_processor', t)).toEqual({});
  });

  it('keeps callback and event_update on the same timeout default', () => {
    expect(getDefaultProcessorConfig('callback', t).timeout).toBe(CALLBACK_DEFAULT_TIMEOUT);
    expect(getDefaultProcessorConfig('event_update', t).timeout).toBe(CALLBACK_DEFAULT_TIMEOUT);
  });
});

describe('DEFAULT_VALUES', () => {
  // 新建页不预选处理器类型：relabel 门槛最高，event_drop 是破坏性的，都不适合替用户决定
  it('starts a new workflow with one unconfigured processor', () => {
    expect(DEFAULT_VALUES.processors).toHaveLength(1);
    expect(DEFAULT_VALUES.processors[0]).toEqual({});
  });
});
