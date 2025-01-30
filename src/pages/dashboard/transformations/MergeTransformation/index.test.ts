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
          columns: ['time', 'value'],
          rows: [
            { time: 1633072800000, value: 10 },
            { time: 1633076400000, value: 20 },
          ],
        },
        {
          refId: 'B',
          columns: ['time', 'value'],
          rows: [
            { time: 1633080000000, value: 30 },
            { time: 1633083600000, value: 40 },
          ],
        },
      ];

      const transformation = new MergeTransformation();
      const result = transformation.apply(input) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].rows).toEqual([
        { time: 1633072800000, value: 10 },
        { time: 1633076400000, value: 20 },
        { time: 1633080000000, value: 30 },
        { time: 1633083600000, value: 40 },
      ]);
    });

    it('should throw an error if TableData columns are inconsistent', () => {
      const input: TableData[] = [
        {
          refId: 'A',
          columns: ['time', 'value'],
          rows: [{ time: 1633072800000, value: 10 }],
        },
        {
          refId: 'B',
          columns: ['timestamp', 'value'],
          rows: [{ timestamp: 1633080000000, value: 30 }],
        },
      ];

      const transformation = new MergeTransformation();

      expect(() => transformation.apply(input)).toThrowError('Cannot merge tables with different columns');
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
          columns: ['time', 'value'],
          rows: [
            { time: 1633080000000, value: 30 },
            { time: 1633083600000, value: 40 },
          ],
        },
      ];

      const transformation = new MergeTransformation();
      const result = transformation.apply(input);

      expect(result).toEqual(input); // 返回原始数据
    });
  });
});
