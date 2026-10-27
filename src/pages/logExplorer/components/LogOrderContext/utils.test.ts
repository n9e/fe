import { esSupportsLogOrder, getLogOrderAnchor, logGeneration } from './utils';

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
});
