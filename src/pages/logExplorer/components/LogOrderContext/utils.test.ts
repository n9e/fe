import { detectSourceFields, esSupportsLogOrder, logOrderUnavailableReason, getLogOrderAnchor, logGeneration, matchesAllKeywords, mergeContextPage, LogContextPage } from './utils';

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
