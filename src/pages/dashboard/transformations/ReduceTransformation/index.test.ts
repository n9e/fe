import ReduceTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('ReduceTransformation', () => {
  describe('TimeSeries', () => {
    it('should sum values in TimeSeries', () => {
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

      const transformation = new ReduceTransformation({ operation: 'sum' });
      const result = transformation.apply([input]) as TimeSeries[];

      expect(result[0].data).toEqual([{ timestamp: 1633072800000, value: 60 }]);
    });

    it('should calculate average values in TimeSeries', () => {
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

      const transformation = new ReduceTransformation({ operation: 'avg' });
      const result = transformation.apply([input]) as TimeSeries[];

      expect(result[0].data).toEqual([{ timestamp: 1633072800000, value: 20 }]);
    });

    it('should find max value in TimeSeries', () => {
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

      const transformation = new ReduceTransformation({ operation: 'max' });
      const result = transformation.apply([input]) as TimeSeries[];

      expect(result[0].data).toEqual([{ timestamp: 1633072800000, value: 30 }]);
    });

    it('should find min value in TimeSeries', () => {
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

      const transformation = new ReduceTransformation({ operation: 'min' });
      const result = transformation.apply([input]) as TimeSeries[];

      expect(result[0].data).toEqual([{ timestamp: 1633072800000, value: 10 }]);
    });
  });

  describe('TableData', () => {
    it('should return original TableData without modification', () => {
      const input: TableData = {
        refId: 'B',
        columns: ['time', 'value'],
        rows: [
          { time: 1633072800000, value: 10 },
          { time: 1633076400000, value: 20 },
          { time: 1633080000000, value: 30 },
        ],
      };

      const transformation = new ReduceTransformation({ operation: 'sum' });
      const result = transformation.apply([input]) as TableData[];

      expect(result[0]).toEqual(input);
    });
  });

  describe('Mixed Data', () => {
    it('should handle mixed TimeSeries and TableData inputs', () => {
      const timeSeriesInput: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [
          { timestamp: 1633072800000, value: 10 },
          { timestamp: 1633076400000, value: 20 },
          { timestamp: 1633080000000, value: 30 },
        ],
      };

      const tableDataInput: TableData = {
        refId: 'B',
        columns: ['time', 'value'],
        rows: [
          { time: 1633072800000, value: 10 },
          { time: 1633076400000, value: 20 },
          { time: 1633080000000, value: 30 },
        ],
      };

      const transformation = new ReduceTransformation({ operation: 'sum' });
      const result = transformation.apply([timeSeriesInput, tableDataInput]);

      expect((result[0] as TimeSeries).data).toEqual([{ timestamp: 1633072800000, value: 60 }]); // TimeSeries result
      expect(result[1]).toEqual(tableDataInput); // TableData remains unchanged
    });
  });
});
