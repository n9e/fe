import ExtractFieldsTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('ExtractFieldsTransformation', () => {
  describe('TableData', () => {
    it('should extract specified fields from TableData', () => {
      const input: TableData = {
        refId: 'A',
        columns: ['id', 'name', 'value'],
        rows: [
          { id: 1, name: 'Alice', value: 10 },
          { id: 2, name: 'Bob', value: 20 },
        ],
      };

      const transformation = new ExtractFieldsTransformation({
        fields: ['id', 'value'],
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].columns).toEqual(['id', 'value']);
      expect(result[0].rows).toEqual([
        { id: 1, value: 10 },
        { id: 2, value: 20 },
      ]);
    });

    it('should ignore non-existent fields in TableData', () => {
      const input: TableData = {
        refId: 'A',
        columns: ['id', 'name'],
        rows: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
      };

      const transformation = new ExtractFieldsTransformation({
        fields: ['id', 'value'], // 'value' 字段不存在
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].columns).toEqual(['id']);
      expect(result[0].rows).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  // describe('TimeSeries', () => {
  //   it('should extract specified fields from TimeSeries', () => {
  //     const input: TimeSeries = {
  //       refId: 'A',
  //       name: 'series1',
  //       labels: {},
  //       data: [
  //         { timestamp: 1633072800000, value: 10, category: 'A' },
  //         { timestamp: 1633076400000, value: 20, category: 'B' },
  //       ],
  //     };

  //     const transformation = new ExtractFieldsTransformation({
  //       fields: ['timestamp', 'value'],
  //     });

  //     const result = transformation.apply([input]) as TimeSeries[];

  //     expect(result.length).toBe(1);
  //     expect(result[0].data).toEqual([
  //       { timestamp: 1633072800000, value: 10 },
  //       { timestamp: 1633076400000, value: 20 },
  //     ]);
  //   });

  //   it('should ignore non-existent fields in TimeSeries', () => {
  //     const input: TimeSeries = {
  //       refId: 'A',
  //       name: 'series1',
  //       labels: {},
  //       data: [
  //         { timestamp: 1633072800000, value: 10 },
  //         { timestamp: 1633076400000, value: 20 },
  //       ],
  //     };

  //     const transformation = new ExtractFieldsTransformation({
  //       fields: ['timestamp', 'category'], // 'category' 字段不存在
  //     });

  //     const result = transformation.apply([input]) as TimeSeries[];

  //     expect(result.length).toBe(1);
  //     expect(result[0].data).toEqual([{ timestamp: 1633072800000 }, { timestamp: 1633076400000 }]);
  //   });
  // });

  // describe('Mixed Data', () => {
  //   it('should handle mixed TableData and TimeSeries inputs', () => {
  //     const input: QueryResult[] = [
  //       {
  //         refId: 'A',
  //         columns: ['id', 'name', 'value'],
  //         rows: [
  //           { id: 1, name: 'Alice', value: 10 },
  //           { id: 2, name: 'Bob', value: 20 },
  //         ],
  //       },
  //       {
  //         refId: 'B',
  //         name: 'series1',
  //         labels: {},
  //         data: [
  //           { timestamp: 1633072800000, value: 10, category: 'A' },
  //           { timestamp: 1633076400000, value: 20, category: 'B' },
  //         ],
  //       },
  //     ];

  //     const transformation = new ExtractFieldsTransformation({
  //       fields: ['id', 'value'], // 只对 TableData 生效
  //     });

  //     const result = transformation.apply(input);

  //     expect(result[0].rows).toEqual([
  //       { id: 1, value: 10 },
  //       { id: 2, value: 20 },
  //     ]);
  //     expect(result[1].data).toEqual([{ value: 10 }, { value: 20 }]);
  //   });
  // });
});
