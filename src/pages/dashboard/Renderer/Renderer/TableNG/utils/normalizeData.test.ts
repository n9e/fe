import normalizeData from './normalizeData';

describe('TableNG normalizeData', () => {
  it('在混合时序和日志结果中为日志 RefID 生成表格行', () => {
    const data = normalizeData([
      {
        id: 'A-series',
        refId: 'A',
        metric: { instance: 'localhost:9090' },
        data: [[1710000000, 1]],
        mode: 'timeSeries',
      },
      {
        id: 'B-log-1',
        refId: 'B',
        metric: { host: 'web-01', message: 'request completed' },
        data: [],
        mode: 'raw',
      },
      {
        id: 'B-log-2',
        refId: 'B',
        metric: { host: 'web-02', message: 'request failed', status: '500' },
        data: [],
        mode: 'raw',
      },
    ]);

    expect(data).toHaveLength(2);
    expect(data[0]).toMatchObject({
      id: '#A',
      refId: 'A',
      columns: ['__time', 'instance', '__value_#A'],
    });
    expect(data[0].rows).toEqual([
      {
        __time: 1710000000,
        instance: 'localhost:9090',
        '__value_#A': 1,
      },
    ]);
    expect(data[1]).toMatchObject({
      id: '#B',
      refId: 'B',
      columns: ['host', 'message', 'status'],
    });
    expect(data[1].rows).toEqual([
      {
        host: 'web-01',
        message: 'request completed',
        status: null,
      },
      {
        host: 'web-02',
        message: 'request failed',
        status: '500',
      },
    ]);
  });
});
