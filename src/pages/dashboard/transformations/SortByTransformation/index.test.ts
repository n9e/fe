import SortByTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('SortByTransformation', () => {
  describe('TableData', () => {
    it('should sort TableData rows in ascending order', () => {
      const input: TableData = {
        refId: 'A',
        fields: [
          { name: 'id', type: 'number', values: [2, 1, 3], state: {} },
          { name: 'value', type: 'number', values: [20, 10, 30], state: {} },
        ],
      };

      const transformation = new SortByTransformation({
        field: 'id',
        order: 'asc',
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields).toEqual([
        { name: 'id', type: 'number', values: [1, 2, 3], state: {} },
        { name: 'value', type: 'number', values: [10, 20, 30], state: {} },
      ]);
    });

    it('should sort TableData rows in descending order', () => {
      const input: TableData = {
        refId: 'A',
        fields: [
          { name: 'id', type: 'number', values: [2, 1, 3], state: {} },
          { name: 'value', type: 'number', values: [20, 10, 30], state: {} },
        ],
      };

      const transformation = new SortByTransformation({
        field: 'value',
        order: 'desc',
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields).toEqual([
        { name: 'id', type: 'number', values: [3, 2, 1], state: {} },
        { name: 'value', type: 'number', values: [30, 20, 10], state: {} },
      ]);
    });

    it('should handle empty TableData', () => {
      const input: TableData = {
        refId: 'A',
        fields: [
          { name: 'id', type: 'number', values: [], state: {} },
          { name: 'value', type: 'number', values: [], state: {} },
        ],
      };

      const transformation = new SortByTransformation({
        field: 'id',
        order: 'asc',
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields).toEqual([
        { name: 'id', type: 'number', values: [], state: {} },
        { name: 'value', type: 'number', values: [], state: {} },
      ]);
    });
  });

  describe('TimeSeries', () => {
    it('should sort TimeSeries data points in ascending order', () => {
      const input: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [
          { timestamp: 1633076400000, value: 20 },
          { timestamp: 1633072800000, value: 10 },
          { timestamp: 1633080000000, value: 30 },
        ],
      };

      const transformation = new SortByTransformation({
        field: 'timestamp',
        order: 'asc',
      });

      const result = transformation.apply([input]) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0].data).toEqual([
        { timestamp: 1633072800000, value: 10 },
        { timestamp: 1633076400000, value: 20 },
        { timestamp: 1633080000000, value: 30 },
      ]);
    });

    it('should sort TimeSeries data points in descending order', () => {
      const input: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [
          { timestamp: 1633076400000, value: 20 },
          { timestamp: 1633072800000, value: 10 },
          { timestamp: 1633080000000, value: 30 },
        ],
      };

      const transformation = new SortByTransformation({
        field: 'value',
        order: 'desc',
      });

      const result = transformation.apply([input]) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0].data).toEqual([
        { timestamp: 1633080000000, value: 30 },
        { timestamp: 1633076400000, value: 20 },
        { timestamp: 1633072800000, value: 10 },
      ]);
    });

    it('should handle empty TimeSeries', () => {
      const input: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [],
      };

      const transformation = new SortByTransformation({
        field: 'timestamp',
        order: 'asc',
      });

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
            { name: 'id', type: 'number', values: [2, 1, 3], state: {} },
            { name: 'value', type: 'number', values: [20, 10, 30], state: {} },
          ],
        },
        {
          refId: 'B',
          name: 'series1',
          labels: {},
          data: [
            { timestamp: 1633076400000, value: 20 },
            { timestamp: 1633072800000, value: 10 },
            { timestamp: 1633080000000, value: 30 },
          ],
        },
      ];

      const transformation = new SortByTransformation({
        field: 'value',
        order: 'asc',
      });

      const result = transformation.apply(input);

      expect((result[0] as TableData).fields).toEqual([
        { name: 'id', type: 'number', values: [1, 2, 3], state: {} },
        { name: 'value', type: 'number', values: [10, 20, 30], state: {} },
      ]);
      expect((result[1] as TimeSeries).data).toEqual([
        { timestamp: 1633072800000, value: 10 },
        { timestamp: 1633076400000, value: 20 },
        { timestamp: 1633080000000, value: 30 },
      ]);
    });
  });
});
