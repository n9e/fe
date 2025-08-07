import FilterByValuesTransformation from './index';
import { TimeSeries, TableData, QueryResult } from '../types';

describe('FilterByValuesTransformation', () => {
  // 测试数据
  const timeSeriesData: TimeSeries[] = [
    {
      refId: 'A',
      name: 'series1',
      labels: { region: 'us-east', env: 'prod' },
      data: [{ timestamp: 1633072800, value: 10 }],
    },
    {
      refId: 'B',
      name: 'series2',
      labels: { region: 'us-west', env: 'dev' },
      data: [{ timestamp: 1633072800, value: 20 }],
    },
  ];

  const tableData: TableData[] = [
    {
      refId: 'C',
      fields: [
        {
          name: 'id',
          type: 'number',
          values: [1, 2, 3],
          state: {},
        },
        {
          name: 'name',
          type: 'string',
          values: ['A', 'B', 'C'],
          state: {},
        },
        {
          name: 'value',
          type: 'number',
          values: [10, 20, 30],
          state: {},
        },
      ],
    },
  ];

  it('should filter time series by label value', () => {
    const filter = new FilterByValuesTransformation({
      labelName: 'env',
      condition: (value) => value === 'prod',
    });
    const result = filter.apply(timeSeriesData);

    expect(result).toHaveLength(1);
    expect((result[0] as TimeSeries).labels.env).toBe('prod');
  });

  it('should filter time series by data point value', () => {
    const filter = new FilterByValuesTransformation({
      condition: (value) => value > 15,
    });
    const result = filter.apply(timeSeriesData);

    expect(result).toHaveLength(1);
    expect((result[0] as TimeSeries).name).toBe('series2');
  });

  it('should filter table data by field value', () => {
    const filter = new FilterByValuesTransformation({
      fieldName: 'value',
      condition: (value) => value > 15,
    });
    const result = filter.apply(tableData);

    expect(result).toHaveLength(1);
    // 应该只保留 value > 15 的行（索引 1 和 2）
    const valueField = (result[0] as TableData).fields.find((f) => f.name === 'value');
    expect(valueField?.values).toEqual([20, 30]);
    // 其他字段也应该被相应过滤
    const idField = (result[0] as TableData).fields.find((f) => f.name === 'id');
    expect(idField?.values).toEqual([2, 3]);
  });

  it('should return empty array if no data matches the condition', () => {
    const filter = new FilterByValuesTransformation({
      labelName: 'env',
      condition: (value) => value === 'staging',
    });
    const result = filter.apply(timeSeriesData);

    expect(result).toHaveLength(0);
  });

  it('should handle empty input', () => {
    const filter = new FilterByValuesTransformation({
      condition: (value) => value > 0,
    });
    const result = filter.apply([]);

    expect(result).toHaveLength(0);
  });
});
