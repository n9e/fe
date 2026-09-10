import { processResponseToSeries } from './processResponse';

describe('processResponseToSeries', () => {
  it('keeps the normalized bucket interval for every ES output series', () => {
    const series = processResponseToSeries(
      [
        {
          aggregations: {
            date: {
              buckets: [
                {
                  key: 1000,
                  doc_count: 2,
                  'avg latency': { value: 12 },
                },
              ],
            },
          },
        },
      ],
      [
        {
          index: 'logs-*',
          values: [{ func: 'avg', field: 'latency' }],
          interval: '300s',
        },
      ],
    );

    expect(series).toEqual([
      expect.objectContaining({
        bucketInterval: 300,
        data: [[1, 12]],
      }),
    ]);
  });
});
