jest.mock('lodash', () => {
  const actual = jest.requireActual('lodash');
  return {
    __esModule: true,
    default: actual,
    ...actual,
  };
});

import { EVENT_FIELD_GROUPS, filterFieldGroups, EventFieldGroup } from './eventFields';

const GROUPS = [
  {
    key: 'common',
    fields: [
      { ref: '{{$labels}}', key: 'labels', type: 'map[string]string' },
      { ref: '{{timestamp}}', key: 'timestamp', type: 'string' },
    ],
  },
  {
    key: 'basic',
    fields: [
      { ref: '{{$event.RuleName}}', key: 'RuleName', type: 'string' },
      { ref: '{{$event.Severity}}', key: 'Severity', type: 'int' },
    ],
  },
] satisfies EventFieldGroup[];

const DESCS: Record<string, string> = {
  labels: '事件标签映射',
  timestamp: '当前时间',
  RuleName: '规则名称',
  Severity: '告警级别(1-3)',
};
const getDesc = (field: { key: string }) => DESCS[field.key] ?? '';

describe('filterFieldGroups', () => {
  it('空关键字返回全部分组', () => {
    expect(filterFieldGroups(GROUPS, '')).toEqual(GROUPS);
    expect(filterFieldGroups(GROUPS, '   ')).toEqual(GROUPS);
  });

  it('按引用表达式过滤，并丢掉过滤后为空的分组', () => {
    const result = filterFieldGroups(GROUPS, 'RuleName');
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('basic');
    expect(result[0].fields.map((f) => f.ref)).toEqual(['{{$event.RuleName}}']);
  });

  it('忽略大小写', () => {
    expect(filterFieldGroups(GROUPS, 'rulename')[0].fields).toHaveLength(1);
  });

  // 中文用户不会去搜 RuleName，只会搜「规则名称」
  it('说明文案也参与匹配', () => {
    const result = filterFieldGroups(GROUPS, '规则名称', getDesc);
    expect(result).toHaveLength(1);
    expect(result[0].fields[0].ref).toBe('{{$event.RuleName}}');
  });

  it('不传 getDesc 时只按表达式匹配，不会误报', () => {
    expect(filterFieldGroups(GROUPS, '规则名称')).toEqual([]);
  });

  it('无命中时返回空数组', () => {
    expect(filterFieldGroups(GROUPS, 'nope', getDesc)).toEqual([]);
  });

  it('不修改入参', () => {
    const before = JSON.stringify(GROUPS);
    filterFieldGroups(GROUPS, 'RuleName', getDesc);
    expect(JSON.stringify(GROUPS)).toBe(before);
  });
});

describe('EVENT_FIELD_GROUPS', () => {
  it('每个字段都是完整的模板引用表达式（可直接复制粘贴）', () => {
    for (const group of EVENT_FIELD_GROUPS) {
      for (const field of group.fields) {
        expect(field.ref.startsWith('{{')).toBe(true);
        expect(field.ref.endsWith('}}')).toBe(true);
      }
    }
  });

  it('每个字段都有 key 与 type（key 用于取 i18n 说明，缺了就会显示成裸 key）', () => {
    for (const group of EVENT_FIELD_GROUPS) {
      for (const field of group.fields) {
        expect(field.key).toBeTruthy();
        expect(field.type).toBeTruthy();
      }
    }
  });

  it('分组 key 不重复', () => {
    const keys = EVENT_FIELD_GROUPS.map((g) => g.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('引用表达式与 i18n key 在全局范围内都不重复', () => {
    const refs = EVENT_FIELD_GROUPS.flatMap((g) => g.fields.map((f) => f.ref));
    expect(new Set(refs).size).toBe(refs.length);
    const keys = EVENT_FIELD_GROUPS.flatMap((g) => g.fields.map((f) => f.key));
    expect(new Set(keys).size).toBe(keys.length);
  });
});
