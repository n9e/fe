import _ from 'lodash';

import { mappingsToFullFields } from '@/plugins/elasticsearch/utils/mappingsToFields';

import {
  detectSourceFields,
  esSupportsLogOrder,
  filterLogOrderFields,
  logOrderUnavailableReason,
  getLogOrderAnchor,
  logGeneration,
  matchesAllKeywords,
  mergeContextPage,
  LogContextPage,
} from './utils';

describe('log order utils', () => {
  it('splits the generation out of a sequence above 2^53 without losing bits', () => {
    expect(logGeneration('9008298766368777')).toBe('8193');
    expect(logGeneration('7696582443008')).toBe('7');
    expect(logGeneration(undefined)).toBeUndefined();
  });

  it('builds an anchor only when both order fields and the time are present', () => {
    const row = { ts: '2026-10-27 10:00:00.123', __log_stream_id__: 's-1', __log_seq__: '9008298766368777' };
    expect(getLogOrderAnchor(row, 'ts')).toEqual({ streamId: 's-1', seq: '9008298766368777', time: '2026-10-27 10:00:00.123' });
    expect(getLogOrderAnchor({ ...row, __log_seq__: undefined }, 'ts')).toBeUndefined();
    expect(getLogOrderAnchor({ ...row, __log_seq__: '1 OR 1=1' }, 'ts')).toBeUndefined();
    expect(getLogOrderAnchor(row, 'missing')).toBeUndefined();
  });

  it('enables ES order sorting only when the template mapped both fields', () => {
    expect(
      esSupportsLogOrder([
        { field: '__log_stream_id__', type: 'keyword' },
        { field: '__log_seq__', type: 'long' },
      ]),
    ).toBe(true);
    expect(
      esSupportsLogOrder([
        { field: '__log_stream_id__', type: 'text' },
        { field: '__log_seq__', type: 'text' },
      ]),
    ).toBe(false);
    expect(esSupportsLogOrder([])).toBe(false);
  });

  it('filters the two log order fields out of a field list', () => {
    const fields = [{ field: 'message' }, { field: '__log_stream_id__' }, { field: '__log_seq__' }, { field: '@timestamp' }];
    expect(filterLogOrderFields(fields)).toEqual([{ field: 'message' }, { field: '@timestamp' }]);
    expect(filterLogOrderFields([])).toEqual([]);
  });

  it('merges a page into loaded context by row index and moves only that side', () => {
    const row = (i: number) => ({ __index_number__: i, message: `m${i}` });
    const cur = (i: number) => ({ time: 't', seq: String(100 + i), index: i });
    const prev: LogContextPage = {
      logs: [row(-1), row(0), row(1)],
      back_cursor: cur(-1),
      forward_cursor: cur(1),
      has_back: true,
      has_forward: true,
      back_scan_limited: false,
      forward_scan_limited: false,
    };
    const next: LogContextPage = {
      ...prev,
      logs: [row(-3), row(-2), row(-1)],
      back_cursor: cur(-3),
      forward_cursor: cur(-1),
      has_back: false,
      back_scan_limited: true,
      has_forward: false,
    };
    const merged = mergeContextPage(prev, next, 'back');
    expect(merged.logs.map((r) => r.__index_number__)).toEqual([-3, -2, -1, 0, 1]);
    expect(merged.back_cursor).toEqual(cur(-3));
    expect(merged.has_back).toBe(false);
    expect(merged.back_scan_limited).toBe(true);
    expect(merged.forward_cursor).toEqual(cur(1));
    expect(merged.has_forward).toBe(true);
  });

  it('narrows like grep a | grep b and matches values only', () => {
    const hidden = ['__index_number__'];
    const row = { message: 'load_id=e44d node=10.98.1.248:8060 say "hi"', host: 'lzs-doris-test-002', __index_number__: -18 };
    const other = { message: 'load_id=e44d node=10.98.1.247:8060', host: 'lzs-doris-test-002', __index_number__: -17 };
    expect(matchesAllKeywords(row, ['e44d', '10.98.1.248'], hidden)).toBe(true);
    expect(matchesAllKeywords(other, ['e44d', '10.98.1.248'], hidden)).toBe(false);
    expect(matchesAllKeywords(row, ['message'], hidden)).toBe(false);
    expect(matchesAllKeywords(row, ['say "hi"'], hidden)).toBe(true);
    expect(matchesAllKeywords(row, ['-18'], hidden)).toBe(false);
    expect(matchesAllKeywords(row, [], hidden)).toBe(true);
    expect(matchesAllKeywords(row, ['LOAD_ID', 'Say "HI"'], hidden)).toBe(true);
  });

  it('detects source fields as those identical on every row, whatever they are named', () => {
    const hidden = ['__index_number__', '__log_seq__', 'ts'];
    const rows = [0, 1, 2, 3, 4].map((i) => ({
      __index_number__: i,
      __log_seq__: String(i),
      ts: i,
      host: { name: 'web-1' },
      src_ip: '10.0.0.1',
      level: i === 3 ? 'WARN' : 'INFO',
      message: `line ${i}`,
      long: 'x'.repeat(65),
      ...(i === 4 ? {} : { path: '/var/log/app.log' }),
    }));
    expect(detectSourceFields(rows, hidden)).toEqual([
      ['host', '{"name":"web-1"}'],
      ['src_ip', '10.0.0.1'],
    ]);
    expect(detectSourceFields(rows.slice(0, 4), hidden)).toEqual([]);
  });

  it('explains why a row has no context entry', () => {
    const row = { ts: '2026-10-27 10:00:00', __log_stream_id__: 's-1', __log_seq__: '42' };
    expect(logOrderUnavailableReason(row, 'ts')).toBeUndefined();
    expect(logOrderUnavailableReason({ ts: row.ts, message: 'x' }, 'ts')).toBe('no_fields');
    expect(logOrderUnavailableReason({ ...row, __log_seq__: 'abc' }, 'ts')).toBe('no_fields');
    expect(logOrderUnavailableReason({ ...row, ts: undefined }, 'ts')).toBe('no_time');
  });
});

/** 索引侧栏字段来自 getFullFields -> mappingsToFullFields，而不是手写的 { type: 'keyword' } */
const esMappingOf = (seqType: string) => ({
  mappings: {
    properties: {
      '@timestamp': { type: 'date' },
      message: { type: 'keyword' },
      __log_stream_id__: { type: 'keyword' },
      __log_seq__: { type: seqType },
    },
  },
});

const toFields = (mappings: Record<string, unknown>) => mappingsToFullFields(mappings as any);

describe('ES 侧栏字段链路（_mapping -> mappingsToFullFields -> esSupportsLogOrder）', () => {
  it('保留侧栏展示类型，并用原始类型判断排序能力', () => {
    const fields = toFields({ 'logs-2026.10.28': esMappingOf('long') });
    expect(_.find(fields, { field: '__log_stream_id__' })?.type).toBe('string');
    expect(_.find(fields, { field: '__log_seq__' })?.type).toBe('long');
  });

  it('跨索引类型冲突时禁用排序，保留既有展示类型', () => {
    const fields = toFields({ 'logs-2026.10.28': esMappingOf('long'), 'logs-2026.10.29': esMappingOf('text') });
    expect(_.filter(fields, { field: '__log_seq__' })).toHaveLength(1);
    expect(_.find(fields, { field: '__log_seq__' })?.logOrderTypes).toEqual(['long', 'text']);
    expect(esSupportsLogOrder(fields)).toBe(false);
  });

  it('索引字段确实满足条件时应启用原文顺序排序', () => {
    expect(esSupportsLogOrder(toFields({ 'logs-2026.10.28': esMappingOf('long') }))).toBe(true);
  });
});

describe('空时间值', () => {
  it('时间字段为空串时不应生成锚点', () => {
    expect(getLogOrderAnchor({ ts: '', __log_stream_id__: 's-1', __log_seq__: '42' }, 'ts')).toBeUndefined();
  });
});

describe('符合后端契约的空上下文页', () => {
  const prev: LogContextPage = {
    logs: [{ __index_number__: 0 }],
    back_cursor: { seq: '1', time: 't', index: 0 },
    forward_cursor: { seq: '1', time: 't', index: 0 },
    has_back: true,
    has_forward: true,
    back_scan_limited: false,
    forward_scan_limited: false,
  };

  it('空页保留已有日志并更新这一侧游标和结束状态', () => {
    const emptyPage: LogContextPage = { ...prev, logs: [], back_cursor: { seq: '0', time: 'earlier', index: -1 }, has_back: false };
    const merged = mergeContextPage(prev, emptyPage, 'back');
    expect(merged.logs).toEqual(prev.logs);
    expect(merged.back_cursor).toEqual(emptyPage.back_cursor);
    expect(merged.has_back).toBe(false);
    expect(merged.forward_cursor).toEqual(prev.forward_cursor);
  });
});

describe('原文排序能力边界', () => {
  it.each([
    ['long', 'text'],
    ['text', 'long'],
  ])('拒绝跨索引冲突，不依赖返回顺序 %s/%s', (first, second) => {
    expect(esSupportsLogOrder(toFields({ a: esMappingOf(first), b: esMappingOf(second) }))).toBe(false);
  });

  it('多个索引类型一致时支持排序', () => {
    expect(esSupportsLogOrder(toFields({ a: esMappingOf('long'), b: esMappingOf('long') }))).toBe(true);
  });

  it('stream 字段 keyword/text 冲突时拒绝排序', () => {
    const other = esMappingOf('long');
    other.mappings.properties.__log_stream_id__.type = 'text';
    expect(esSupportsLogOrder(toFields({ a: esMappingOf('long'), b: other }))).toBe(false);
  });

  it('没有原始类型信息时不能把普通 string 当成 keyword', () => {
    expect(
      esSupportsLogOrder([
        { field: '__log_stream_id__', type: 'string' },
        { field: '__log_seq__', type: 'long' },
      ]),
    ).toBe(false);
  });

  it.each(['', '  ', '\t', null, undefined, NaN, Infinity, {}, false])('拒绝不可用时间 %p', (time) => {
    const row = { ts: time, __log_stream_id__: 's-1', __log_seq__: '42' };
    expect(getLogOrderAnchor(row, 'ts')).toBeUndefined();
    expect(logOrderUnavailableReason(row, 'ts')).toBe('no_time');
  });

  it('时间戳 0 是有效锚点', () => {
    expect(getLogOrderAnchor({ ts: 0, __log_stream_id__: 's-1', __log_seq__: '42' }, 'ts')?.time).toBe(0);
  });
});
