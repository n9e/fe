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

    // 检查字段结构
    const resultTable = result[0];
    expect(resultTable.fields.length).toBe(5); // timestamp, value, name, region, env

    // 检查字段名称
    const fieldNames = resultTable.fields.map((f) => f.name);
    expect(fieldNames).toContain('timestamp');
    expect(fieldNames).toContain('value');
    expect(fieldNames).toContain('name');
    expect(fieldNames).toContain('region');
    expect(fieldNames).toContain('env');

    // 检查数据长度
    expect(resultTable.fields[0].values.length).toBe(4); // 4个数据点

    // 检查时间戳字段
    const timestampField = resultTable.fields.find((f) => f.name === 'timestamp');
    expect(timestampField?.values).toEqual([1633072800000, 1633076400000, 1633072800000, 1633076400000]);

    // 检查值字段
    const valueField = resultTable.fields.find((f) => f.name === 'value');
    expect(valueField?.values).toEqual([10, 20, 30, 40]);

    // 检查名称字段
    const nameField = resultTable.fields.find((f) => f.name === 'name');
    expect(nameField?.values).toEqual(['series1', 'series1', 'series2', 'series2']);

    // 检查region字段
    const regionField = resultTable.fields.find((f) => f.name === 'region');
    expect(regionField?.values).toEqual(['us-east', 'us-east', 'us-west', 'us-west']);

    // 检查env字段
    const envField = resultTable.fields.find((f) => f.name === 'env');
    expect(envField?.values).toEqual(['production', 'production', 'staging', 'staging']);
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

    // 检查字段结构
    const resultTable = result[0];
    expect(resultTable.fields.length).toBe(3); // timestamp, value, name

    // 检查字段名称
    const fieldNames = resultTable.fields.map((f) => f.name);
    expect(fieldNames).toContain('timestamp');
    expect(fieldNames).toContain('value');
    expect(fieldNames).toContain('name');

    // 检查数据长度
    expect(resultTable.fields[0].values.length).toBe(2); // 2个数据点

    // 检查时间戳字段
    const timestampField = resultTable.fields.find((f) => f.name === 'timestamp');
    expect(timestampField?.values).toEqual([1633072800000, 1633076400000]);

    // 检查值字段
    const valueField = resultTable.fields.find((f) => f.name === 'value');
    expect(valueField?.values).toEqual([10, 20]);

    // 检查名称字段
    const nameField = resultTable.fields.find((f) => f.name === 'name');
    expect(nameField?.values).toEqual(['series1', 'series1']);
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

    // 检查字段结构
    const resultTable = result[0];
    expect(resultTable.fields.length).toBe(3); // timestamp, value, name

    // 检查字段名称
    const fieldNames = resultTable.fields.map((f) => f.name);
    expect(fieldNames).toContain('timestamp');
    expect(fieldNames).toContain('value');
    expect(fieldNames).toContain('name');

    // 检查数据长度（应该为空）
    expect(resultTable.fields[0].values.length).toBe(0);

    // 检查所有字段都为空
    resultTable.fields.forEach((field) => {
      expect(field.values).toEqual([]);
    });
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
        fields: [
          { name: 'id', type: 'number', values: [1, 2], state: {} },
          { name: 'value', type: 'number', values: [100, 200], state: {} },
        ],
      },
    ];

    const transformation = new SeriesToRowsTransformation();
    const result = transformation.apply(input);

    expect(result.length).toBe(1); // 只转换 TimeSeries

    // 检查转换后的 TableData
    const resultTable = result[0] as TableData;
    expect(resultTable.fields.length).toBe(4); // timestamp, value, name, region

    // 检查字段名称
    const fieldNames = resultTable.fields.map((f) => f.name);
    expect(fieldNames).toContain('timestamp');
    expect(fieldNames).toContain('value');
    expect(fieldNames).toContain('name');
    expect(fieldNames).toContain('region');

    // 检查数据长度
    expect(resultTable.fields[0].values.length).toBe(2);

    // 检查时间戳字段
    const timestampField = resultTable.fields.find((f) => f.name === 'timestamp');
    expect(timestampField?.values).toEqual([1633072800000, 1633076400000]);

    // 检查值字段
    const valueField = resultTable.fields.find((f) => f.name === 'value');
    expect(valueField?.values).toEqual([10, 20]);

    // 检查名称字段
    const nameField = resultTable.fields.find((f) => f.name === 'name');
    expect(nameField?.values).toEqual(['series1', 'series1']);

    // 检查region字段
    const regionField = resultTable.fields.find((f) => f.name === 'region');
    expect(regionField?.values).toEqual(['us-east', 'us-east']);
  });
});
