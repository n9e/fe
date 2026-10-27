import { esSupportsLogOrder, getLogOrderAnchor, logGeneration, mergeContextPage, LogContextPage } from './utils';

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
});
