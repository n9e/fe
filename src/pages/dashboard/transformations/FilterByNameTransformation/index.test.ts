import FilterTransformation from './index';
import { TimeSeries, TableData, QueryResult } from '../types';

describe('FilterTransformation', () => {
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
      columns: ['id', 'name', 'value'],
      rows: [
        { id: 1, name: 'A', value: 10 },
        { id: 2, name: 'B', value: 20 },
        { id: 3, name: 'C', value: 30 },
      ],
    },
  ];

  it('should filter time series by name (include mode)', () => {
    const filter = new FilterTransformation({ pattern: 'series1', include: true });
    const result = filter.apply(timeSeriesData);

    expect(result).toHaveLength(1);
    expect((result[0] as TimeSeries).name).toBe('series1');
  });

  it('should filter time series by name (exclude mode)', () => {
    const filter = new FilterTransformation({ pattern: 'series1', include: false });
    const result = filter.apply(timeSeriesData);

    expect(result).toHaveLength(1);
    expect((result[0] as TimeSeries).name).toBe('series2');
  });

  it('should filter time series by label (include mode)', () => {
    const filter = new FilterTransformation({ labelName: 'env', pattern: 'prod', include: true });
    const result = filter.apply(timeSeriesData);

    expect(result).toHaveLength(1);
    expect((result[0] as TimeSeries).labels.env).toBe('prod');
  });

  it('should filter time series by label (exclude mode)', () => {
    const filter = new FilterTransformation({ labelName: 'env', pattern: 'prod', include: false });
    const result = filter.apply(timeSeriesData);

    expect(result).toHaveLength(1);
    expect((result[0] as TimeSeries).labels.env).toBe('dev');
  });

  it('should filter table data by field name (include mode)', () => {
    const filter = new FilterTransformation({ fieldName: 'name', pattern: 'A', include: true });
    const result = filter.apply(tableData);

    expect(result).toHaveLength(1);
    expect((result[0] as TableData).rows).toHaveLength(1);
    expect((result[0] as TableData).rows[0].name).toBe('A');
  });

  it('should filter table data by field name (exclude mode)', () => {
    const filter = new FilterTransformation({ fieldName: 'name', pattern: 'A', include: false });
    const result = filter.apply(tableData);

    expect(result).toHaveLength(1);
    expect((result[0] as TableData).rows).toHaveLength(2);
    expect((result[0] as TableData).rows[0].name).toBe('B');
  });

  it('should return empty array if no data matches the filter', () => {
    const filter = new FilterTransformation({ pattern: 'non-existent', include: true });
    const result = filter.apply(timeSeriesData);

    expect(result).toHaveLength(0);
  });

  it('should handle empty input', () => {
    const filter = new FilterTransformation({ pattern: 'series1', include: true });
    const result = filter.apply([]);

    expect(result).toHaveLength(0);
  });
});
