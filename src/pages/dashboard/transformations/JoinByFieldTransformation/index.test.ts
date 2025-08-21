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
          fields: [
            {
              name: 'id',
              type: 'number',
              values: [1, 2],
              state: {},
            },
            {
              name: 'value',
              type: 'number',
              values: [10, 20],
              state: {},
            },
          ],
        },
        {
          refId: 'B',
          fields: [
            {
              name: 'id',
              type: 'number',
              values: [2, 3],
              state: {},
            },
            {
              name: 'value',
              type: 'number',
              values: [30, 40],
              state: {},
            },
          ],
        },
      ];

      const transformation = new JoinByFieldTransformation({ byField: 'id', mode: 'inner' });
      const result = transformation.apply(input) as TableData[];

      expect(result.length).toBe(1);
      const idField = result[0].fields.find((f) => f.name === 'id');
      const value0Field = result[0].fields.find((f) => f.name === 'value_0');
      const value1Field = result[0].fields.find((f) => f.name === 'value_1');

      expect(idField?.values).toEqual([2]);
      expect(value0Field?.values).toEqual([20]);
      expect(value1Field?.values).toEqual([30]);
    });

    it('should join TableData by field (outer join)', () => {
      const input: TableData[] = [
        {
          refId: 'A',
          fields: [
            {
              name: 'id',
              type: 'number',
              values: [1, 2],
              state: {},
            },
            {
              name: 'value',
              type: 'number',
              values: [10, 20],
              state: {},
            },
          ],
        },
        {
          refId: 'B',
          fields: [
            {
              name: 'id',
              type: 'number',
              values: [2, 3],
              state: {},
            },
            {
              name: 'value',
              type: 'number',
              values: [30, 40],
              state: {},
            },
          ],
        },
      ];

      const transformation = new JoinByFieldTransformation({ byField: 'id', mode: 'outer' });
      const result = transformation.apply(input) as TableData[];

      expect(result.length).toBe(1);
      const idField = result[0].fields.find((f) => f.name === 'id');
      const value0Field = result[0].fields.find((f) => f.name === 'value_0');
      const value1Field = result[0].fields.find((f) => f.name === 'value_1');

      expect(idField?.values).toEqual(expect.arrayContaining([1, 2, 3]));
      expect(value0Field?.values).toEqual(expect.arrayContaining([10, 20, null]));
      expect(value1Field?.values).toEqual(expect.arrayContaining([null, 30, 40]));
    });

    it('should warn and return original data if field is missing in TableData', () => {
      const input: TableData[] = [
        {
          refId: 'A',
          fields: [
            {
              name: 'id',
              type: 'number',
              values: [1],
              state: {},
            },
            {
              name: 'value',
              type: 'number',
              values: [10],
              state: {},
            },
          ],
        },
        {
          refId: 'B',
          fields: [
            {
              name: 'time',
              type: 'time',
              values: [1633072800000],
              state: {},
            },
            {
              name: 'value',
              type: 'number',
              values: [30],
              state: {},
            },
          ],
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
          fields: [
            {
              name: 'id',
              type: 'number',
              values: [1, 2],
              state: {},
            },
            {
              name: 'name',
              type: 'string',
              values: ['Alice', 'Bob'],
              state: {},
            },
          ],
        },
        {
          refId: 'B',
          fields: [
            {
              name: 'id',
              type: 'number',
              values: [2, 3],
              state: {},
            },
            {
              name: 'age',
              type: 'number',
              values: [25, 30],
              state: {},
            },
          ],
        },
      ];

      const transformation = new JoinByFieldTransformation({ byField: 'id', mode: 'inner' });
      const result = transformation.apply(input) as TableData[];

      expect(result.length).toBe(1);
      const idField = result[0].fields.find((f) => f.name === 'id');
      const nameField = result[0].fields.find((f) => f.name === 'name');
      const ageField = result[0].fields.find((f) => f.name === 'age');

      expect(idField?.values).toEqual([2]);
      expect(nameField?.values).toEqual(['Bob']);
      expect(ageField?.values).toEqual([25]);
    });

    it('should join TableData without adding index suffix when field names are different (outer join)', () => {
      const input: TableData[] = [
        {
          refId: 'A',
          fields: [
            {
              name: 'id',
              type: 'number',
              values: [1, 2],
              state: {},
            },
            {
              name: 'name',
              type: 'string',
              values: ['Alice', 'Bob'],
              state: {},
            },
          ],
        },
        {
          refId: 'B',
          fields: [
            {
              name: 'id',
              type: 'number',
              values: [2, 3],
              state: {},
            },
            {
              name: 'age',
              type: 'number',
              values: [25, 30],
              state: {},
            },
          ],
        },
      ];

      const transformation = new JoinByFieldTransformation({ byField: 'id', mode: 'outer' });
      const result = transformation.apply(input) as TableData[];

      expect(result.length).toBe(1);
      const idField = result[0].fields.find((f) => f.name === 'id');
      const nameField = result[0].fields.find((f) => f.name === 'name');
      const ageField = result[0].fields.find((f) => f.name === 'age');

      expect(idField?.values).toEqual(expect.arrayContaining([1, 2, 3]));
      expect(nameField?.values).toEqual(expect.arrayContaining(['Alice', 'Bob', null]));
      expect(ageField?.values).toEqual(expect.arrayContaining([null, 25, 30]));
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
          fields: [
            {
              name: 'id',
              type: 'number',
              values: [1, 2],
              state: {},
            },
            {
              name: 'value',
              type: 'number',
              values: [10, 20],
              state: {},
            },
          ],
        },
      ];

      const transformation = new JoinByFieldTransformation({ byField: 'id', mode: 'inner' });
      const result = transformation.apply(input);

      expect(result).toEqual(input); // 返回原始数据
    });
  });
});
