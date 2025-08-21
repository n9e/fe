import LimitTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('LimitTransformation', () => {
  describe('TableData', () => {
    it('should limit the number of rows in TableData', () => {
      const input: TableData = {
        refId: 'A',
        fields: [
          {
            name: 'id',
            type: 'number',
            values: [1, 2, 3],
            state: {},
          },
          {
            name: 'value',
            type: 'number',
            values: [10, 20, 30],
            state: {},
          },
        ],
      };

      const transformation = new LimitTransformation({ limit: 2 });
      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields[0].values).toEqual([1, 2]);
      expect(result[0].fields[1].values).toEqual([10, 20]);
    });

    it('should handle empty TableData', () => {
      const input: TableData = {
        refId: 'A',
        fields: [
          {
            name: 'id',
            type: 'number',
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

      const transformation = new LimitTransformation({ limit: 2 });
      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields[0].values).toEqual([]);
      expect(result[0].fields[1].values).toEqual([]);
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
          fields: [
            { name: 'id', type: 'number', values: [1, 2, 3], state: {} },
            { name: 'value', type: 'number', values: [10, 20, 30], state: {} },
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

      expect((result[0] as TableData).fields).toEqual([
        { name: 'id', type: 'number', values: [1, 2], state: {} },
        { name: 'value', type: 'number', values: [10, 20], state: {} },
      ]);
      expect((result[1] as TimeSeries).data).toEqual([
        { timestamp: 1633072800000, value: 10 },
        { timestamp: 1633076400000, value: 20 },
      ]);
    });
  });
});
