import MergeTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('MergeTransformation', () => {
  describe('TimeSeries', () => {
    it('should merge multiple TimeSeries into one', () => {
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
            { timestamp: 1633080000000, value: 30 },
            { timestamp: 1633083600000, value: 40 },
          ],
        },
      ];

      const transformation = new MergeTransformation();
      const result = transformation.apply(input) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0].data).toEqual([
        { timestamp: 1633072800000, value: 10 },
        { timestamp: 1633076400000, value: 20 },
        { timestamp: 1633080000000, value: 30 },
        { timestamp: 1633083600000, value: 40 },
      ]);
    });
  });

  describe('TableData', () => {
    it('should merge multiple TableData into one', () => {
      const input: TableData[] = [
        {
          refId: 'A',
          fields: [
            {
              name: 'time',
              type: 'time',
              values: [1633072800000],
              state: {},
            },
            {
              name: 'value#A',
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
              name: 'value#B',
              type: 'number',
              values: [30],
              state: {},
            },
          ],
        },
      ];

      const transformation = new MergeTransformation();
      const result = transformation.apply(input) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields.length).toBe(3);

      const timeField = result[0].fields.find((f) => f.name === 'time');
      const valueFieldA = result[0].fields.find((f) => f.name === 'value#A');
      const valueFieldB = result[0].fields.find((f) => f.name === 'value#B');

      expect(timeField?.values).toEqual([1633072800000]);
      expect(valueFieldA?.values).toEqual([10]);
      expect(valueFieldB?.values).toEqual([30]);
    });

    it('should merge rows with same common field values and keep separate rows for different values', () => {
      const input: TableData[] = [
        {
          refId: 'A',
          fields: [
            {
              name: 'time',
              type: 'time',
              values: [1633072800000, 1633076400000],
              state: {},
            },
            {
              name: 'value#A',
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
              name: 'time',
              type: 'time',
              values: [1633072800000, 1633080000000],
              state: {},
            },
            {
              name: 'value#B',
              type: 'number',
              values: [30, 40],
              state: {},
            },
          ],
        },
      ];

      const transformation = new MergeTransformation();
      const result = transformation.apply(input) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields.length).toBe(3);

      const timeField = result[0].fields.find((f) => f.name === 'time');
      const valueFieldA = result[0].fields.find((f) => f.name === 'value#A');
      const valueFieldB = result[0].fields.find((f) => f.name === 'value#B');

      // 应该有3行：
      // 第一行：time=1633072800000, value#A=10, value#B=30 (合并)
      // 第二行：time=1633076400000, value#A=20, value#B=null
      // 第三行：time=1633080000000, value#A=null, value#B=40
      expect(timeField?.values.length).toBe(3);
      expect(timeField?.values).toEqual([1633072800000, 1633076400000, 1633080000000]);
      expect(valueFieldA?.values).toEqual([10, 20, null]);
      expect(valueFieldB?.values).toEqual([30, null, 40]);
    });

    it('should keep all rows when tables share no common fields (union 而非合并成一行)', () => {
      const input: TableData[] = [
        {
          refId: 'A',
          fields: [
            {
              name: 'a',
              type: 'string',
              values: ['a1', 'a2'],
              state: {},
            },
          ],
        },
        {
          refId: 'B',
          fields: [
            {
              name: 'b',
              type: 'string',
              values: ['b1', 'b2'],
              state: {},
            },
          ],
        },
      ];

      const result = new MergeTransformation().apply(input) as TableData[];

      expect(result.length).toBe(1);
      const fieldA = result[0].fields.find((f) => f.name === 'a');
      const fieldB = result[0].fields.find((f) => f.name === 'b');
      // 无共同字段时退化为逐行拼接，4 行数据不能丢失
      expect(fieldA?.values).toEqual(['a1', 'a2', null, null]);
      expect(fieldB?.values).toEqual([null, null, 'b1', 'b2']);
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
              name: 'time',
              type: 'time',
              values: [1633080000000, 1633083600000],
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

      const transformation = new MergeTransformation();
      const result = transformation.apply(input);

      expect(result).toEqual(input); // 返回原始数据
    });
  });
});
