import RowsToFieldsTransformation from './index';
import { QueryResult, TableData } from '../types';

describe('RowsToFieldsTransformation', () => {
  it('should transform rows to fields in TableData', () => {
    const input: TableData = {
      refId: 'A',
      columns: ['category', 'metric', 'value'],
      rows: [
        { category: 'A', metric: 'cpu', value: 10 },
        { category: 'A', metric: 'memory', value: 20 },
        { category: 'B', metric: 'cpu', value: 30 },
        { category: 'B', metric: 'memory', value: 40 },
      ],
    };

    const transformation = new RowsToFieldsTransformation({
      fieldName: 'metric', // 将 'metric' 列的值转换为字段
      valueField: 'value', // 将 'value' 列的值作为字段的值
    });

    const result = transformation.apply([input]) as TableData[];

    expect(result.length).toBe(1);
    expect(result[0].columns).toEqual(['cpu', 'memory', 'cpu', 'memory']);
    expect(result[0].rows).toEqual([
      { category: 'B', cpu: 30 },
      { category: 'B', memory: 40 },
    ]);
  });

  it('should handle empty TableData', () => {
    const input: TableData = {
      refId: 'A',
      columns: ['category', 'metric', 'value'],
      rows: [],
    };

    const transformation = new RowsToFieldsTransformation({
      fieldName: 'metric',
      valueField: 'value',
    });

    const result = transformation.apply([input]) as TableData[];

    expect(result.length).toBe(1);
    expect(result[0].columns).toEqual([]);
    expect(result[0].rows).toEqual([]);
  });

  it('should handle missing fields in rows', () => {
    const input: TableData = {
      refId: 'A',
      columns: ['category', 'metric', 'value'],
      rows: [
        { category: 'A', metric: 'cpu', value: 10 },
        { category: 'A', metric: 'memory' }, // 缺少 'value' 字段
        { category: 'B', metric: 'cpu', value: 30 },
      ],
    };

    const transformation = new RowsToFieldsTransformation({
      fieldName: 'metric',
      valueField: 'value',
    });

    const result = transformation.apply([input]) as TableData[];

    expect(result.length).toBe(1);
    expect(result[0].columns).toEqual(['cpu', 'memory', 'cpu', 'memory']);
    expect(result[0].rows).toEqual([
      { category: 'B', cpu: 30 },
      { category: 'A', memory: undefined },
    ]);
  });
});
