import AddFieldFromCalculationTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('AddFieldFromCalculationTransformation', () => {
  describe('TableData', () => {
    it('should add a new field to TableData based on calculation', () => {
      const input: TableData = {
        refId: 'A',
        columns: ['id', 'value'],
        rows: [
          { id: 1, value: 10 },
          { id: 2, value: 20 },
        ],
      };

      const transformation = new AddFieldFromCalculationTransformation({
        fieldName: 'valueSquared',
        expression: (row) => row.value * row.value,
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].columns).toEqual(['id', 'value', 'valueSquared']);
      expect(result[0].rows).toEqual([
        { id: 1, value: 10, valueSquared: 100 },
        { id: 2, value: 20, valueSquared: 400 },
      ]);
    });
  });

  describe('TimeSeries', () => {
    it('should add a new field to TimeSeries based on calculation', () => {
      const input: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [
          { timestamp: 1633072800000, value: 10 },
          { timestamp: 1633076400000, value: 20 },
        ],
      };

      const transformation = new AddFieldFromCalculationTransformation({
        fieldName: 'valueDoubled',
        expression: () => 0, // Dummy expression for TableData
        timeSeriesExpression: (dataPoint) => dataPoint.value * 2,
      });

      const result = transformation.apply([input]) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0].data).toEqual([
        { timestamp: 1633072800000, value: 10, valueDoubled: 20 },
        { timestamp: 1633076400000, value: 20, valueDoubled: 40 },
      ]);
    });

    it('should throw an error if timeSeriesExpression is missing for TimeSeries', () => {
      const input: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [
          { timestamp: 1633072800000, value: 10 },
          { timestamp: 1633076400000, value: 20 },
        ],
      };

      const transformation = new AddFieldFromCalculationTransformation({
        fieldName: 'valueDoubled',
        expression: (row) => row.value * 2, // 未提供 timeSeriesExpression
      });

      expect(() => transformation.apply([input])).toThrowError('timeSeriesExpression is required for TimeSeries');
    });
  });

  describe('Mixed Data', () => {
    it('should handle mixed TimeSeries and TableData inputs', () => {
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

      const transformation = new AddFieldFromCalculationTransformation({
        fieldName: 'newField',
        expression: (row) => row.value * 2,
        timeSeriesExpression: (dataPoint) => dataPoint.value * 2,
      });

      const result = transformation.apply(input);

      expect((result[0] as TimeSeries).data).toEqual([
        { timestamp: 1633072800000, value: 10, newField: 20 },
        { timestamp: 1633076400000, value: 20, newField: 40 },
      ]);
      expect((result[1] as TableData).rows).toEqual([
        { id: 1, value: 10, newField: 20 },
        { id: 2, value: 20, newField: 40 },
      ]);
    });
  });
});
