import ConvertFieldTypeTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('ConvertFieldTypeTransformation', () => {
  describe('TableData', () => {
    it('should convert a field to string type in TableData', () => {
      const input: TableData = {
        refId: 'A',
        fields: [
          {
            name: 'id',
            type: 'number',
            values: [1, 2],
            state: {},
          },
          {
            name: 'value',
            type: 'number',
            values: [10, 20],
            state: {},
          },
        ],
      };

      const transformation = new ConvertFieldTypeTransformation({
        fieldName: 'value',
        targetType: 'string',
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields[1]).toEqual({
        name: 'value',
        type: 'string',
        values: ['10', '20'],
        state: {},
      });
    });

    it('should convert a field to number type in TableData', () => {
      const input: TableData = {
        refId: 'A',
        fields: [
          {
            name: 'id',
            type: 'number',
            values: [1, 2],
            state: {},
          },
          {
            name: 'value',
            type: 'string',
            values: ['10', '20'],
            state: {},
          },
        ],
      };

      const transformation = new ConvertFieldTypeTransformation({
        fieldName: 'value',
        targetType: 'number',
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields[1]).toEqual({
        name: 'value',
        type: 'number',
        values: [10, 20],
        state: {},
      });
    });

    it('should convert a field to boolean type in TableData', () => {
      const input: TableData = {
        refId: 'A',
        fields: [
          {
            name: 'id',
            type: 'number',
            values: [1, 2],
            state: {},
          },
          {
            name: 'isActive',
            type: 'number',
            values: [1, 0],
            state: {},
          },
        ],
      };

      const transformation = new ConvertFieldTypeTransformation({
        fieldName: 'isActive',
        targetType: 'boolean',
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields[1]).toEqual({
        name: 'isActive',
        type: 'boolean',
        values: [true, false],
        state: {},
      });
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
          fields: [
            {
              name: 'id',
              type: 'number',
              values: [1, 2],
              state: {},
            },
            {
              name: 'value',
              type: 'string',
              values: ['10', '20'],
              state: {},
            },
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

      expect((result[0] as TableData).fields[1]).toEqual({
        name: 'value',
        type: 'number',
        values: [10, 20],
        state: {},
      });
      expect((result[1] as TimeSeries).data).toEqual([
        { timestamp: 1633072800000, value: 30 },
        { timestamp: 1633076400000, value: 40 },
      ]);
    });
  });
});
