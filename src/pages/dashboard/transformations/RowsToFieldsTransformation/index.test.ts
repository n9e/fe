import RowsToFieldsTransformation from './index';
import { QueryResult, TableData } from '../types';

describe('RowsToFieldsTransformation', () => {
  it('should transform rows to fields in TableData', () => {
    const input: TableData = {
      refId: 'A',
      fields: [
        {
          name: 'category',
          type: 'string',
          values: ['A', 'A', 'B', 'B'],
          state: {},
        },
        {
          name: 'metric',
          type: 'string',
          values: ['cpu', 'memory', 'cpu', 'memory'],
          state: {},
        },
        {
          name: 'value',
          type: 'number',
          values: [10, 20, 30, 40],
          state: {},
        },
      ],
    };

    const transformation = new RowsToFieldsTransformation({
      fieldName: 'metric', // 将 'metric' 列的值转换为字段
      valueField: 'value', // 将 'value' 列的值作为字段的值
    });

    const result = transformation.apply([input]) as TableData[];

    expect(result.length).toBe(1);
    expect(result[0].fields).toHaveLength(3); // category + cpu + memory
    expect(result[0].fields[0].name).toBe('category');
    expect(result[0].fields[1].name).toBe('cpu');
    expect(result[0].fields[2].name).toBe('memory');
    // cpu 字段应该有值 [10, null, 30, null]
    expect(result[0].fields[1].values).toEqual([10, null, 30, null]);
    // memory 字段应该有值 [null, 20, null, 40]
    expect(result[0].fields[2].values).toEqual([null, 20, null, 40]);
  });

  it('should handle empty TableData', () => {
    const input: TableData = {
      refId: 'A',
      fields: [
        {
          name: 'category',
          type: 'string',
          values: [],
          state: {},
        },
        {
          name: 'metric',
          type: 'string',
          values: [],
          state: {},
        },
        {
          name: 'value',
          type: 'number',
          values: [],
          state: {},
        },
      ],
    };

    const transformation = new RowsToFieldsTransformation({
      fieldName: 'metric',
      valueField: 'value',
    });

    const result = transformation.apply([input]) as TableData[];

    expect(result.length).toBe(1);
    expect(result[0].fields).toHaveLength(1); // 只有 category 字段保留
    expect(result[0].fields[0].name).toBe('category');
  });

  it('should handle missing fields in rows', () => {
    const input: TableData = {
      refId: 'A',
      fields: [
        {
          name: 'category',
          type: 'string',
          values: ['A', 'A', 'B'],
          state: {},
        },
        {
          name: 'metric',
          type: 'string',
          values: ['cpu', 'memory', 'cpu'],
          state: {},
        },
        {
          name: 'value',
          type: 'number',
          values: [10, null, 30], // memory 缺少值
          state: {},
        },
      ],
    };

    const transformation = new RowsToFieldsTransformation({
      fieldName: 'metric',
      valueField: 'value',
    });

    const result = transformation.apply([input]) as TableData[];

    expect(result.length).toBe(1);
    expect(result[0].fields).toHaveLength(3); // category + cpu + memory
    expect(result[0].fields[0].name).toBe('category');
    expect(result[0].fields[1].name).toBe('cpu');
    expect(result[0].fields[2].name).toBe('memory');
    // cpu 字段应该有值 [10, null, 30]
    expect(result[0].fields[1].values).toEqual([10, null, 30]);
    // memory 字段应该有值 [null, null, null]
    expect(result[0].fields[2].values).toEqual([null, null, null]);
  });
});
