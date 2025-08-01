import JoinByFieldTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('JoinByFieldTransformation', () => {
  describe('TimeSeries', () => {
    it('should join TimeSeries by timestamp (inner join)', () => {
      const input: TimeSeries[] = [
        {
          refId: 'A',
          name: 'series1',
          labels: {},
          data: [
            { timestamp: 1633072800000, value: 10 },
            { timestamp: 1633076400000, value: 20 },
          ],
        },
        {
          refId: 'B',
          name: 'series2',
          labels: {},
          data: [
            { timestamp: 1633076400000, value: 30 },
            { timestamp: 1633080000000, value: 40 },
          ],
        },
      ];

      const transformation = new JoinByFieldTransformation({ byField: 'timestamp', mode: 'inner' });
      const result = transformation.apply(input) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0].data).toEqual([
        { timestamp: 1633076400000, value: 50 }, // 20 + 30
      ]);
    });

    it('should join TimeSeries by timestamp (outer join)', () => {
      const input: TimeSeries[] = [
        {
          refId: 'A',
          name: 'series1',
          labels: {},
          data: [
            { timestamp: 1633072800000, value: 10 },
            { timestamp: 1633076400000, value: 20 },
          ],
        },
        {
          refId: 'B',
          name: 'series2',
          labels: {},
          data: [
            { timestamp: 1633076400000, value: 30 },
            { timestamp: 1633080000000, value: 40 },
          ],
        },
      ];

      const transformation = new JoinByFieldTransformation({ byField: 'timestamp', mode: 'outer' });
      const result = transformation.apply(input) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0].data).toEqual([
        { timestamp: 1633072800000, value: 10 }, // 10 + 0 (缺失值用0填充)
        { timestamp: 1633076400000, value: 50 }, // 20 + 30
        { timestamp: 1633080000000, value: 40 }, // 0 + 40 (缺失值用0填充)
      ]);
    });
  });

  describe('TableData', () => {
    it('should join TableData by field (inner join)', () => {
      const input: TableData[] = [
        {
          refId: 'A',
          columns: ['id', 'value'],
          rows: [
            { id: 1, value: 10 },
            { id: 2, value: 20 },
          ],
        },
        {
          refId: 'B',
          columns: ['id', 'value'],
          rows: [
            { id: 2, value: 30 },
            { id: 3, value: 40 },
          ],
        },
      ];

      const transformation = new JoinByFieldTransformation({ byField: 'id', mode: 'inner' });
      const result = transformation.apply(input) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].rows).toEqual([
        { id: 2, value_0: 20, value_1: 30 }, // 字段名 'value' 重复，加索引后缀
      ]);
    });

    it('should join TableData by field (outer join)', () => {
      const input: TableData[] = [
        {
          refId: 'A',
          columns: ['id', 'value'],
          rows: [
            { id: 1, value: 10 },
            { id: 2, value: 20 },
          ],
        },
        {
          refId: 'B',
          columns: ['id', 'value'],
          rows: [
            { id: 2, value: 30 },
            { id: 3, value: 40 },
          ],
        },
      ];

      const transformation = new JoinByFieldTransformation({ byField: 'id', mode: 'outer' });
      const result = transformation.apply(input) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].rows).toHaveLength(3);
      expect(result[0].rows).toEqual(
        expect.arrayContaining([
          { id: 1, value_0: 10, value_1: null }, // 字段名 'value' 重复，加索引后缀
          { id: 2, value_0: 20, value_1: 30 }, // 字段名 'value' 重复，加索引后缀
          { id: 3, value_0: null, value_1: 40 }, // 字段名 'value' 重复，加索引后缀
        ]),
      );
    });

    it('should warn and return original data if field is missing in TableData', () => {
      const input: TableData[] = [
        {
          refId: 'A',
          columns: ['id', 'value'],
          rows: [{ id: 1, value: 10 }],
        },
        {
          refId: 'B',
          columns: ['time', 'value'],
          rows: [{ time: 1633072800000, value: 30 }],
        },
      ];

      const transformation = new JoinByFieldTransformation({ byField: 'id', mode: 'inner' });
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = transformation.apply(input);

      expect(consoleSpy).toHaveBeenCalledWith('Field "id" is missing in one or more tables');
      expect(result).toEqual(input); // 应该返回原始数据

      consoleSpy.mockRestore();
    });

    it('should join TableData without adding index suffix when field names are different', () => {
      const input: TableData[] = [
        {
          refId: 'A',
          columns: ['id', 'name'],
          rows: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ],
        },
        {
          refId: 'B',
          columns: ['id', 'age'],
          rows: [
            { id: 2, age: 25 },
            { id: 3, age: 30 },
          ],
        },
      ];

      const transformation = new JoinByFieldTransformation({ byField: 'id', mode: 'inner' });
      const result = transformation.apply(input) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].rows).toEqual([
        { id: 2, name: 'Bob', age: 25 }, // 字段名不重复，不加后缀
      ]);
    });

    it('should join TableData without adding index suffix when field names are different (outer join)', () => {
      const input: TableData[] = [
        {
          refId: 'A',
          columns: ['id', 'name'],
          rows: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ],
        },
        {
          refId: 'B',
          columns: ['id', 'age'],
          rows: [
            { id: 2, age: 25 },
            { id: 3, age: 30 },
          ],
        },
      ];

      const transformation = new JoinByFieldTransformation({ byField: 'id', mode: 'outer' });
      const result = transformation.apply(input) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].rows).toHaveLength(3);
      expect(result[0].rows).toEqual(
        expect.arrayContaining([
          { id: 1, name: 'Alice', age: null }, // 字段名不重复，不加后缀
          { id: 2, name: 'Bob', age: 25 },
          { id: 3, name: null, age: 30 },
        ]),
      );
    });
  });

  describe('Mixed Data', () => {
    it('should return original data if input contains mixed types', () => {
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
        {
          refId: 'B',
          columns: ['id', 'value'],
          rows: [
            { id: 1, value: 10 },
            { id: 2, value: 20 },
          ],
        },
      ];

      const transformation = new JoinByFieldTransformation({ byField: 'id', mode: 'inner' });
      const result = transformation.apply(input);

      expect(result).toEqual(input); // 返回原始数据
    });
  });
});
