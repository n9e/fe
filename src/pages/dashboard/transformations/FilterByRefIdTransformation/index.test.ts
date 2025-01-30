import FilterByRefIdTransformation from './index';
import { TimeSeries, TableData, QueryResult } from '../types';

describe('FilterByRefIdTransformation', () => {
  // 测试数据
  const timeSeriesData: TimeSeries = {
    refId: 'A',
    name: 'series1',
    labels: { region: 'us-east' },
    data: [{ timestamp: 1633072800, value: 10 }],
  };

  const tableData: TableData = {
    refId: 'B',
    columns: ['id', 'name'],
    rows: [{ id: 1, name: 'A' }],
  };

  const mixedData: QueryResult[] = [timeSeriesData, tableData];

  it('should filter time series data by refId', () => {
    const filter = new FilterByRefIdTransformation('A');
    const result = filter.apply([timeSeriesData]);

    expect(result).toHaveLength(1);
    expect(result[0].refId).toBe('A');
  });

  it('should filter table data by refId', () => {
    const filter = new FilterByRefIdTransformation('B');
    const result = filter.apply([tableData]);

    expect(result).toHaveLength(1);
    expect(result[0].refId).toBe('B');
  });

  it('should filter mixed data by refId', () => {
    const filter = new FilterByRefIdTransformation('A');
    const result = filter.apply(mixedData);

    expect(result).toHaveLength(1);
    expect(result[0].refId).toBe('A');
  });

  it('should return empty array if no matching refId is found', () => {
    const filter = new FilterByRefIdTransformation('C');
    const result = filter.apply(mixedData);

    expect(result).toHaveLength(0);
  });

  it('should handle empty input', () => {
    const filter = new FilterByRefIdTransformation('A');
    const result = filter.apply([]);

    expect(result).toHaveLength(0);
  });
});
