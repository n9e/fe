import moment from 'moment';

import { formatMuteTag, formatSeverities, isMuteScopeUnlimited, buildMuteScopeText, formatDuration } from './utils';

describe('formatMuteTag', () => {
  it('等值匹配用 key=value 表达', () => {
    expect(formatMuteTag({ key: 'ident', func: '==', value: 'host01' })).toBe('ident=host01');
  });

  it('非等值匹配保留运算符', () => {
    expect(formatMuteTag({ key: 'service', func: '=~', value: 'api.*' })).toBe('service =~ api.*');
  });

  it('缺少 func 时默认按等值处理', () => {
    expect(formatMuteTag({ key: 'ident', value: 'host01' })).toBe('ident=host01');
  });

  it('没有 key 的空行返回空字符串', () => {
    expect(formatMuteTag({})).toBe('');
    expect(formatMuteTag(undefined)).toBe('');
  });

  it('只填了 key 还没填 value 时返回空字符串', () => {
    expect(formatMuteTag({ key: 'ident', func: '==' })).toBe('');
  });
});

describe('formatSeverities', () => {
  it('全选或为空时不展示等级', () => {
    expect(formatSeverities([1, 2, 3])).toBe('');
    expect(formatSeverities([])).toBe('');
    expect(formatSeverities(undefined)).toBe('');
  });

  it('部分选中时按顺序展示', () => {
    expect(formatSeverities([2, 1])).toBe('S1/S2');
  });
});

describe('isMuteScopeUnlimited', () => {
  it('没有标签且没有数据源时视为无限制', () => {
    expect(isMuteScopeUnlimited({})).toBe(true);
    expect(isMuteScopeUnlimited({ tags: [{ func: '==' }], datasource_ids: [] })).toBe(true);
  });

  it('数据源选了 $all 仍视为无限制', () => {
    expect(isMuteScopeUnlimited({ datasource_ids: [0] })).toBe(true);
  });

  it('配置了标签或具体数据源时不再提示', () => {
    expect(isMuteScopeUnlimited({ tags: [{ key: 'ident', func: '==', value: 'host01' }] })).toBe(false);
    expect(isMuteScopeUnlimited({ datasource_ids: [1] })).toBe(false);
  });
});

describe('buildMuteScopeText', () => {
  const base = {
    separator: '、',
    fallbackText: '全部告警',
  };

  it('优先使用标签条件，最多取两个', () => {
    expect(
      buildMuteScopeText({
        ...base,
        tags: [
          { key: 'ident', func: '==', value: 'host01' },
          { key: 'service', func: '==', value: 'api' },
          { key: 'env', func: '==', value: 'prod' },
        ],
        datasourceNames: ['ds1'],
        cateLabel: 'Prometheus',
      }),
    ).toBe('ident=host01、service=api');
  });

  it('没有标签时退化到数据源名称', () => {
    expect(buildMuteScopeText({ ...base, datasourceNames: ['ds1'], cateLabel: 'Prometheus' })).toBe('ds1');
  });

  it('没有标签和数据源时退化到数据源类型', () => {
    expect(buildMuteScopeText({ ...base, cateLabel: 'Prometheus' })).toBe('Prometheus');
  });

  it('非全选的事件等级追加在末尾', () => {
    expect(buildMuteScopeText({ ...base, cateLabel: 'Prometheus', severities: [1, 2] })).toBe('Prometheus S1/S2');
  });

  it('什么都没有时使用兜底文案', () => {
    expect(buildMuteScopeText(base)).toBe('全部告警');
  });
});

describe('formatDuration', () => {
  it('按天/时/分组合展示时长', () => {
    const btime = moment('2026-07-21 10:00:00');
    expect(formatDuration(btime, moment('2026-07-21 11:30:00'))).toBe('1h 30m');
    expect(formatDuration(btime, moment('2026-07-22 12:00:00'))).toBe('1d 2h');
  });

  it('结束时间不晚于开始时间时返回空字符串', () => {
    const btime = moment('2026-07-21 10:00:00');
    expect(formatDuration(btime, moment('2026-07-21 10:00:00'))).toBe('');
    expect(formatDuration(undefined, btime)).toBe('');
  });
});
