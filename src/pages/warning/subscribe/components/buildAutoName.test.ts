jest.mock('lodash', () => {
  const actual = jest.requireActual('lodash');
  return {
    __esModule: true,
    default: actual,
    ...actual,
  };
});

import { buildAutoName, AutoNameTexts } from './buildAutoName';

const TEXTS = {
  joiner: '-',
  separator: '、',
  all: '全部告警',
  escalation: '升级',
} satisfies AutoNameTexts;

describe('buildAutoName (订阅规则自动命名)', () => {
  it('优先使用订阅的告警规则名，最多取 2 个', () => {
    const input = {
      ruleNames: ['CPU 使用率过高', '内存使用率过高', '磁盘使用率过高'],
      severities: [1, 2, 3],
    } as const;

    expect(buildAutoName(input, TEXTS)).toBe('CPU 使用率过高、内存使用率过高');
  });

  it('没有告警规则时回退到业务组条件', () => {
    const input = {
      busiGroups: [{ func: 'in', value: ['中间件', '数据库'] }],
    } as const;

    expect(buildAutoName(input, TEXTS)).toBe('中间件、数据库');
  });

  it('没有告警规则和业务组时回退到事件标签条件', () => {
    const input = {
      tags: [{ key: 'env', func: '==', value: 'prod' }],
    } as const;

    expect(buildAutoName(input, TEXTS)).toBe('env=prod');
  });

  it('没有任何筛选条件时回退到数据源类型', () => {
    expect(buildAutoName({ cateLabel: 'Host' }, TEXTS)).toBe('Host');
  });

  it('只配置了接收方时用「全部告警」兜底主体', () => {
    expect(buildAutoName({ receiverNames: ['值班组'] }, TEXTS)).toBe('全部告警-值班组');
  });

  it('筛选与通知都为空时返回空串，避免污染用户输入', () => {
    expect(buildAutoName({}, TEXTS)).toBe('');
    expect(buildAutoName({ severities: [1] }, TEXTS)).toBe('');
  });

  it('等级未全选时追加等级片段，全选时不追加', () => {
    expect(buildAutoName({ cateLabel: 'Host', severities: [2, 1] }, TEXTS)).toBe('Host-S1/S2');
    expect(buildAutoName({ cateLabel: 'Host', severities: [1, 2, 3] }, TEXTS)).toBe('Host');
  });

  it('配置了持续时长时追加升级标识', () => {
    expect(buildAutoName({ cateLabel: 'Host', forDuration: 3600 }, TEXTS)).toBe('Host-升级');
    expect(buildAutoName({ cateLabel: 'Host', forDuration: 0 }, TEXTS)).toBe('Host');
  });

  it('追加接收方名称，最多取 2 个', () => {
    const input = {
      ruleNames: ['CPU 使用率过高'],
      severities: [1],
      forDuration: 3600,
      receiverNames: ['值班组', '运维组', '研发组'],
    } as const;

    expect(buildAutoName(input, TEXTS)).toBe('CPU 使用率过高-S1-升级-值班组、运维组');
  });

  it('忽略空值条件', () => {
    const input = {
      ruleNames: [],
      busiGroups: [{ func: '==', value: '' }],
      tags: [{ key: 'env', func: '==', value: '' }],
      cateLabel: 'Prometheus',
    } as const;

    expect(buildAutoName(input, TEXTS)).toBe('Prometheus');
  });

  it('相同入参多次调用结果一致（幂等性）', () => {
    const input = {
      ruleNames: ['CPU 使用率过高'],
      severities: [1, 2],
      receiverNames: ['值班组'],
    } as const;

    expect(buildAutoName(input, TEXTS)).toBe(buildAutoName(input, TEXTS));
  });
});
