import LabelsToFieldsTransformation from './index';
import { QueryResult, TimeSeries } from '../types';

describe('LabelsToFieldsTransformation', () => {
  it('should add labels as fields to TimeSeries data points', () => {
    const input: TimeSeries = {
      refId: 'A',
      name: 'series1',
      labels: {
        region: 'us-east',
        env: 'production',
      },
      data: [
        { timestamp: 1633072800000, value: 10 },
        { timestamp: 1633076400000, value: 20 },
      ],
    };

    const transformation = new LabelsToFieldsTransformation();
    const result = transformation.apply([input]) as TimeSeries[];

    expect(result.length).toBe(1);
    expect(result[0].data).toEqual([
      { timestamp: 1633072800000, value: 10, region: 'us-east', env: 'production' },
      { timestamp: 1633076400000, value: 20, region: 'us-east', env: 'production' },
    ]);
  });

  it('should return original TimeSeries if no labels are present', () => {
    const input: TimeSeries = {
      refId: 'A',
      name: 'series1',
      labels: {},
      data: [
        { timestamp: 1633072800000, value: 10 },
        { timestamp: 1633076400000, value: 20 },
      ],
    };

    const transformation = new LabelsToFieldsTransformation();
    const result = transformation.apply([input]) as TimeSeries[];

    expect(result.length).toBe(1);
    expect(result[0]).toEqual(input); // 返回原始数据
  });

  it('should handle mixed QueryResult inputs', () => {
    const input: QueryResult[] = [
      {
        refId: 'A',
        name: 'series1',
        labels: {
          region: 'us-east',
          env: 'production',
        },
        data: [
          { timestamp: 1633072800000, value: 10 },
          { timestamp: 1633076400000, value: 20 },
        ],
      },
      {
        refId: 'B',
        columns: ['id', 'value'],
        rows: [
          { id: 1, value: 10 },
          { id: 2, value: 20 },
        ],
      },
    ];

    const transformation = new LabelsToFieldsTransformation();
    const result = transformation.apply(input);

    expect((result[0] as TimeSeries).data).toEqual([
      { timestamp: 1633072800000, value: 10, region: 'us-east', env: 'production' },
      { timestamp: 1633076400000, value: 20, region: 'us-east', env: 'production' },
    ]);
    expect(result[1]).toEqual(input[1]); // TableData 保持不变
  });
});
