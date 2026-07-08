import { buildLokiSelector, getContextTimeRanges, getLogIdentity, getReliableLokiLabels, mergeContextLogs } from './context';

describe('Loki raw context utils', () => {
  it('builds exact selector from valid labels with escaping', () => {
    expect(buildLokiSelector({ job: 'api', pod: 'a"b', 'bad-name': 'x' })).toBe('{job="api",pod="a\\"b"}');
  });

  it('uses only explicit labels', () => {
    expect(getReliableLokiLabels({ labels: { job: 'api' }, parsed_fields: { trace_id: '1' } })).toEqual({ job: 'api' });
    expect(getReliableLokiLabels({ parsed_fields: { trace_id: '1' } })).toEqual({});
  });

  it('builds a stable empty identity for missing logs', () => {
    expect(getLogIdentity()).toBe('{}||');
  });

  it('builds nanosecond context windows around current log', () => {
    expect(getContextTimeRanges('1710000000000000000')).toEqual({
      backward: {
        start: '1709992800000000000',
        end: '1709999999999999999',
      },
      forward: {
        start: '1710000000000000001',
        end: '1710007200000000000',
      },
    });
  });

  it('dedupes and sorts merged context logs by raw timestamp', () => {
    const current = { timestamp: 2, __timestamp__: '2', line: 'current', labels: { job: 'api' }, parsed_fields: {} };
    const older = { timestamp: 1, __timestamp__: '1', line: 'older', labels: { job: 'api' }, parsed_fields: {} };
    const newer = { timestamp: 3, __timestamp__: '3', line: 'newer', labels: { job: 'api' }, parsed_fields: {} };
    expect(mergeContextLogs(current, [older, current], [newer]).map((item) => item.line)).toEqual(['older', 'current', 'newer']);
  });
});
