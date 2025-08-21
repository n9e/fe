import TimeSeriesTableTransformation from './index';
import { TimeSeries, TableData, QueryResult } from '../types';

describe('TimeSeriesTableTransformation', () => {
  describe('TimeSeries input (should pass through unchanged)', () => {
    const inputTimeSeries: TimeSeries = {
      refId: 'A',
      name: 'cpu_usage',
      labels: { instance: 'server-01', region: 'us-east' },
      data: [
        { timestamp: 1633072800000, value: 10 },
        { timestamp: 1633076400000, value: 20 },
        { timestamp: 1633080000000, value: 30 },
        { timestamp: 1633083600000, value: 5 },
        { timestamp: 1633087200000, value: 25 },
      ],
    };

    it('should pass through TimeSeries unchanged', () => {
      const transformation = new TimeSeriesTableTransformation({
        functions: ['max', 'min', 'avg'],
        fieldName: 'cpu_usage',
      });

      const result = transformation.apply([inputTimeSeries]);

      expect(result.length).toBe(1);
      expect(result[0]).toBe(inputTimeSeries); // Should be the exact same object
    });
  });

  describe('TableData processing', () => {
    const inputTableData: TableData = {
      refId: 'A',
      fields: [
        {
          name: 'memory_usage',
          type: 'number',
          values: [1024, 2048, 1536, 3072],
          state: {
            calcs: {
              max: 3072,
              min: 1024,
              avg: 1920,
              sum: 7680,
              count: 4,
              last: 3072,
              variance: 614400,
              stdDev: 784,
            },
          },
        },
        {
          name: 'timestamp',
          type: 'time',
          values: ['10:00:00', '10:01:00', '10:02:00', '10:03:00'],
          state: {},
        },
      ],
    };

    it('should extract values from existing calcs', () => {
      const transformation = new TimeSeriesTableTransformation({
        functions: ['max', 'min', 'avg'],
        fieldName: 'memory_usage',
      });

      const result = transformation.apply([inputTableData]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields).toHaveLength(4); // name + 3 functions
      expect(result[0].fields[0].name).toBe('name');
      expect(result[0].fields[0].values).toEqual(['memory_usage']);

      // Check extracted values from calcs
      expect(result[0].fields[1].name).toBe('memory_usage_max');
      expect(result[0].fields[1].values).toEqual([3072]);
      expect(result[0].fields[2].name).toBe('memory_usage_min');
      expect(result[0].fields[2].values).toEqual([1024]);
      expect(result[0].fields[3].name).toBe('memory_usage_avg');
      expect(result[0].fields[3].values).toEqual([1920]);
    });

    it('should use custom output field names for TableData', () => {
      const transformation = new TimeSeriesTableTransformation({
        functions: ['max', 'avg'],
        fieldName: 'memory_usage',
        outputFieldNames: {
          max: 'peak_memory',
          avg: 'avg_memory',
        },
      });

      const result = transformation.apply([inputTableData]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields[1].name).toBe('peak_memory');
      expect(result[0].fields[2].name).toBe('avg_memory');
      expect(result[0].fields[1].values).toEqual([3072]);
      expect(result[0].fields[2].values).toEqual([1920]);
    });

    it('should return original data when field not found', () => {
      const transformation = new TimeSeriesTableTransformation({
        functions: ['max'],
        fieldName: 'non_existent_field',
      });

      const result = transformation.apply([inputTableData]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0]).toBe(inputTableData); // Should return original data
    });

    it('should return original data when field has no calcs', () => {
      const tableDataNoCalcs: TableData = {
        refId: 'A',
        fields: [
          {
            name: 'memory_usage',
            type: 'number',
            values: [1024, 2048, 1536, 3072],
            state: {}, // No calcs
          },
        ],
      };

      const transformation = new TimeSeriesTableTransformation({
        functions: ['max'],
        fieldName: 'memory_usage',
      });

      const result = transformation.apply([tableDataNoCalcs]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0]).toBe(tableDataNoCalcs); // Should return original data
    });
  });

  describe('Edge cases', () => {
    it('should return original data when functions not provided', () => {
      const inputTableData: TableData = {
        refId: 'A',
        fields: [
          {
            name: 'memory_usage',
            type: 'number',
            values: [1024, 2048, 1536, 3072],
            state: {
              calcs: {
                max: 3072,
                min: 1024,
                avg: 1920,
                sum: 7680,
                count: 4,
                last: 3072,
                variance: null,
                stdDev: null,
              },
            },
          },
        ],
      };

      const transformation = new TimeSeriesTableTransformation({
        fieldName: 'memory_usage',
      });

      const result = transformation.apply([inputTableData]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0]).toBe(inputTableData); // Should return original data
    });

    it('should return original data when fieldName not provided', () => {
      const inputTableData: TableData = {
        refId: 'A',
        fields: [
          {
            name: 'memory_usage',
            type: 'number',
            values: [1024, 2048, 1536, 3072],
            state: {
              calcs: {
                max: 3072,
                min: 1024,
                avg: 1920,
                sum: 7680,
                count: 4,
                last: 3072,
                variance: null,
                stdDev: null,
              },
            },
          },
        ],
      };

      const transformation = new TimeSeriesTableTransformation({
        functions: ['max', 'min'],
      });

      const result = transformation.apply([inputTableData]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0]).toBe(inputTableData); // Should return original data
    });

    it('should handle mixed TimeSeries and TableData', () => {
      const tableData: TableData = {
        refId: 'C',
        fields: [
          {
            name: 'cpu_usage',
            type: 'number',
            values: [50, 60, 70],
            state: {
              calcs: {
                max: 70,
                min: 50,
                avg: 60,
                sum: 180,
                count: 3,
                last: 70,
                variance: 66.67,
                stdDev: 8.16,
              },
            },
          },
        ],
      };

      const timeSeries: TimeSeries = {
        refId: 'A',
        name: 'test_series',
        labels: {},
        data: [{ timestamp: 1633072800000, value: 50 }],
      };

      const transformation = new TimeSeriesTableTransformation({
        functions: ['max'],
        fieldName: 'cpu_usage',
      });

      const result = transformation.apply([tableData, timeSeries]);

      expect(result.length).toBe(2);
      // TableData should be processed and return aggregated result
      expect((result[0] as TableData).fields[0].values).toEqual(['cpu_usage']);
      expect((result[0] as TableData).fields[1].values).toEqual([70]);
      // TimeSeries should pass through unchanged
      expect(result[1]).toBe(timeSeries);
    });
  });
});
