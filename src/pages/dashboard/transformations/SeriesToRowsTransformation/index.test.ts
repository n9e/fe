import SeriesToRowsTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('SeriesToRowsTransformation', () => {
  it('should convert multiple TimeSeries to TableData rows', () => {
    const input: QueryResult[] = [
      {
        refId: 'A',
        name: 'series1',
        labels: { region: 'us-east', env: 'production' },
        data: [
          { timestamp: 1633072800000, value: 10 },
          { timestamp: 1633076400000, value: 20 },
        ],
      },
      {
        refId: 'B',
        name: 'series2',
        labels: { region: 'us-west', env: 'staging' },
        data: [
          { timestamp: 1633072800000, value: 30 },
          { timestamp: 1633076400000, value: 40 },
        ],
      },
    ];

    const transformation = new SeriesToRowsTransformation();
    const result = transformation.apply(input) as TableData[];

    expect(result.length).toBe(1);
    expect(result[0].columns).toEqual(['timestamp', 'value', 'name', 'region', 'env']);
    expect(result[0].rows).toEqual([
      { timestamp: 1633072800000, value: 10, name: 'series1', region: 'us-east', env: 'production' },
      { timestamp: 1633076400000, value: 20, name: 'series1', region: 'us-east', env: 'production' },
      { timestamp: 1633072800000, value: 30, name: 'series2', region: 'us-west', env: 'staging' },
      { timestamp: 1633076400000, value: 40, name: 'series2', region: 'us-west', env: 'staging' },
    ]);
  });

  it('should handle TimeSeries without labels', () => {
    const input: QueryResult[] = [
      {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [
          { timestamp: 1633072800000, value: 10 },
          { timestamp: 1633076400000, value: 20 },
        ],
      },
    ];

    const transformation = new SeriesToRowsTransformation();
    const result = transformation.apply(input) as TableData[];

    expect(result.length).toBe(1);
    expect(result[0].columns).toEqual(['timestamp', 'value', 'name']);
    expect(result[0].rows).toEqual([
      { timestamp: 1633072800000, value: 10, name: 'series1' },
      { timestamp: 1633076400000, value: 20, name: 'series1' },
    ]);
  });

  it('should handle empty TimeSeries', () => {
    const input: QueryResult[] = [
      {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [],
      },
    ];

    const transformation = new SeriesToRowsTransformation();
    const result = transformation.apply(input) as TableData[];

    expect(result.length).toBe(1);
    expect(result[0].columns).toEqual(['timestamp', 'value', 'name']);
    expect(result[0].rows).toEqual([]);
  });

  it('should handle mixed QueryResult inputs', () => {
    const input: QueryResult[] = [
      {
        refId: 'A',
        name: 'series1',
        labels: { region: 'us-east' },
        data: [
          { timestamp: 1633072800000, value: 10 },
          { timestamp: 1633076400000, value: 20 },
        ],
      },
      {
        refId: 'B',
        columns: ['id', 'value'],
        rows: [
          { id: 1, value: 100 },
          { id: 2, value: 200 },
        ],
      },
    ];

    const transformation = new SeriesToRowsTransformation();
    const result = transformation.apply(input);

    expect(result.length).toBe(1); // 只转换 TimeSeries
    expect((result[0] as TableData).columns).toEqual(['timestamp', 'value', 'name', 'region']);
    expect((result[0] as TableData).rows).toEqual([
      { timestamp: 1633072800000, value: 10, name: 'series1', region: 'us-east' },
      { timestamp: 1633076400000, value: 20, name: 'series1', region: 'us-east' },
    ]);
  });
});
