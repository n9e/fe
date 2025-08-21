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
              values: [1633072800000, 1633076400000],
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
      const result = transformation.apply(input) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields.length).toBe(2);

      const timeField = result[0].fields.find((f) => f.name === 'time');
      const valueField = result[0].fields.find((f) => f.name === 'value');

      expect(timeField?.values).toEqual([1633072800000, 1633076400000, 1633080000000, 1633083600000]);
      expect(valueField?.values).toEqual([10, 20, 30, 40]);
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
