import LimitTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('LimitTransformation', () => {
  describe('TableData', () => {
    it('should limit the number of rows in TableData', () => {
      const input: TableData = {
        refId: 'A',
        columns: ['id', 'value'],
        rows: [
          { id: 1, value: 10 },
          { id: 2, value: 20 },
          { id: 3, value: 30 },
        ],
      };

      const transformation = new LimitTransformation({ limit: 2 });
      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].rows).toEqual([
        { id: 1, value: 10 },
        { id: 2, value: 20 },
      ]);
    });

    it('should handle empty TableData', () => {
      const input: TableData = {
        refId: 'A',
        columns: ['id', 'value'],
        rows: [],
      };

      const transformation = new LimitTransformation({ limit: 2 });
      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].rows).toEqual([]);
    });
  });

  describe('TimeSeries', () => {
    it('should limit the number of data points in TimeSeries', () => {
      const input: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [
          { timestamp: 1633072800000, value: 10 },
          { timestamp: 1633076400000, value: 20 },
          { timestamp: 1633080000000, value: 30 },
        ],
      };

      const transformation = new LimitTransformation({ limit: 2 });
      const result = transformation.apply([input]) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0].data).toEqual([
        { timestamp: 1633072800000, value: 10 },
        { timestamp: 1633076400000, value: 20 },
      ]);
    });

    it('should handle empty TimeSeries', () => {
      const input: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [],
      };

      const transformation = new LimitTransformation({ limit: 2 });
      const result = transformation.apply([input]) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0].data).toEqual([]);
    });
  });

  describe('Mixed Data', () => {
    it('should handle mixed TableData and TimeSeries inputs', () => {
      const input: QueryResult[] = [
        {
          refId: 'A',
          columns: ['id', 'value'],
          rows: [
            { id: 1, value: 10 },
            { id: 2, value: 20 },
            { id: 3, value: 30 },
          ],
        },
        {
          refId: 'B',
          name: 'series1',
          labels: {},
          data: [
            { timestamp: 1633072800000, value: 10 },
            { timestamp: 1633076400000, value: 20 },
            { timestamp: 1633080000000, value: 30 },
          ],
        },
      ];

      const transformation = new LimitTransformation({ limit: 2 });
      const result = transformation.apply(input);

      expect((result[0] as TableData).rows).toEqual([
        { id: 1, value: 10 },
        { id: 2, value: 20 },
      ]);
      expect((result[1] as TimeSeries).data).toEqual([
        { timestamp: 1633072800000, value: 10 },
        { timestamp: 1633076400000, value: 20 },
      ]);
    });
  });
});
