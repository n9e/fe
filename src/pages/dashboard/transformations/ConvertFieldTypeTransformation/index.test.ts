import ConvertFieldTypeTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('ConvertFieldTypeTransformation', () => {
  describe('TableData', () => {
    it('should convert a field to string type in TableData', () => {
      const input: TableData = {
        refId: 'A',
        columns: ['id', 'value'],
        rows: [
          { id: 1, value: 10 },
          { id: 2, value: 20 },
        ],
      };

      const transformation = new ConvertFieldTypeTransformation({
        fieldName: 'value',
        targetType: 'string',
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].rows).toEqual([
        { id: 1, value: '10' },
        { id: 2, value: '20' },
      ]);
    });

    it('should convert a field to number type in TableData', () => {
      const input: TableData = {
        refId: 'A',
        columns: ['id', 'value'],
        rows: [
          { id: 1, value: '10' },
          { id: 2, value: '20' },
        ],
      };

      const transformation = new ConvertFieldTypeTransformation({
        fieldName: 'value',
        targetType: 'number',
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].rows).toEqual([
        { id: 1, value: 10 },
        { id: 2, value: 20 },
      ]);
    });

    it('should convert a field to boolean type in TableData', () => {
      const input: TableData = {
        refId: 'A',
        columns: ['id', 'isActive'],
        rows: [
          { id: 1, isActive: 1 },
          { id: 2, isActive: 0 },
        ],
      };

      const transformation = new ConvertFieldTypeTransformation({
        fieldName: 'isActive',
        targetType: 'boolean',
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].rows).toEqual([
        { id: 1, isActive: true },
        { id: 2, isActive: false },
      ]);
    });
  });

  describe('TimeSeries', () => {
    it('should convert a field to string type in TimeSeries', () => {
      const input: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [
          { timestamp: 1633072800000, value: 10 },
          { timestamp: 1633076400000, value: 20 },
        ],
      };

      const transformation = new ConvertFieldTypeTransformation({
        fieldName: 'value',
        targetType: 'string',
      });

      const result = transformation.apply([input]) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0].data).toEqual([
        { timestamp: 1633072800000, value: '10' },
        { timestamp: 1633076400000, value: '20' },
      ]);
    });

    it('should convert a field to number type in TimeSeries', () => {
      const input: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [
          // @ts-ignore
          { timestamp: 1633072800000, value: '10' },
          // @ts-ignore
          { timestamp: 1633076400000, value: '20' },
        ],
      };

      const transformation = new ConvertFieldTypeTransformation({
        fieldName: 'value',
        targetType: 'number',
      });

      const result = transformation.apply([input]) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0].data).toEqual([
        { timestamp: 1633072800000, value: 10 },
        { timestamp: 1633076400000, value: 20 },
      ]);
    });

    it('should convert a field to boolean type in TimeSeries', () => {
      const input: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [
          { timestamp: 1633072800000, value: 1 },
          { timestamp: 1633076400000, value: 0 },
        ],
      };

      const transformation = new ConvertFieldTypeTransformation({
        fieldName: 'value',
        targetType: 'boolean',
      });

      const result = transformation.apply([input]) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0].data).toEqual([
        { timestamp: 1633072800000, value: true },
        { timestamp: 1633076400000, value: false },
      ]);
    });
  });

  describe('Mixed Data', () => {
    it('should handle mixed TableData and TimeSeries inputs', () => {
      const input: QueryResult[] = [
        {
          refId: 'A',
          columns: ['id', 'value'],
          rows: [
            { id: 1, value: '10' },
            { id: 2, value: '20' },
          ],
        },
        {
          refId: 'B',
          name: 'series1',
          labels: {},
          data: [
            // @ts-ignore
            { timestamp: 1633072800000, value: '30' },
            // @ts-ignore
            { timestamp: 1633076400000, value: '40' },
          ],
        },
      ];

      const transformation = new ConvertFieldTypeTransformation({
        fieldName: 'value',
        targetType: 'number',
      });

      const result = transformation.apply(input);

      expect((result[0] as TableData).rows).toEqual([
        { id: 1, value: 10 },
        { id: 2, value: 20 },
      ]);
      expect((result[1] as TimeSeries).data).toEqual([
        { timestamp: 1633072800000, value: 30 },
        { timestamp: 1633076400000, value: 40 },
      ]);
    });
  });
});
