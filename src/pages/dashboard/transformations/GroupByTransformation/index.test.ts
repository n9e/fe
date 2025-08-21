import GroupByTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('GroupByTransformation', () => {
  describe('TableData', () => {
    it('should group TableData by field and sum values', () => {
      const input: TableData = {
        refId: 'A',
        fields: [
          { name: 'category', type: 'string', values: ['A', 'B', 'A'], state: {} },
          { name: 'value', type: 'number', values: [10, 20, 30], state: {} },
        ],
      };

      const transformation = new GroupByTransformation({
        field: 'category',
        aggregation: 'sum',
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields).toEqual([
        { name: 'category', type: 'string', values: ['A', 'B'], state: {} },
        { name: 'value', type: 'number', values: [40, 20], state: {} },
      ]);
    });

    it('should group TableData by field without aggregation', () => {
      const input: TableData = {
        refId: 'A',
        fields: [
          { name: 'category', type: 'string', values: ['A', 'B', 'A'], state: {} },
          { name: 'value', type: 'number', values: [10, 20, 30], state: {} },
        ],
      };

      const transformation = new GroupByTransformation({
        field: 'category',
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields).toEqual([{ name: 'category', type: 'string', values: ['A', 'B'], state: {} }]);
    });
  });

  // describe('TimeSeries', () => {
  //   it('should group TimeSeries by field and calculate average', () => {
  //     const input: TimeSeries = {
  //       refId: 'A',
  //       name: 'series1',
  //       labels: {},
  //       data: [
  //         { timestamp: 1633072800000, value: 10, category: 'A' },
  //         { timestamp: 1633076400000, value: 20, category: 'B' },
  //         { timestamp: 1633080000000, value: 30, category: 'A' },
  //       ],
  //     };

  //     const transformation = new GroupByTransformation({
  //       field: 'category',
  //       aggregation: 'avg',
  //     });

  //     const result = transformation.apply([input]) as TimeSeries[];

  //     expect(result.length).toBe(1);
  //     expect(result[0].data).toEqual([
  //       { category: 'A', value: 20 },
  //       { category: 'B', value: 20 },
  //     ]);
  //   });

  //   it('should group TimeSeries by field without aggregation', () => {
  //     const input: TimeSeries = {
  //       refId: 'A',
  //       name: 'series1',
  //       labels: {},
  //       data: [
  //         { timestamp: 1633072800000, value: 10, category: 'A' },
  //         { timestamp: 1633076400000, value: 20, category: 'B' },
  //         { timestamp: 1633080000000, value: 30, category: 'A' },
  //       ],
  //     };

  //     const transformation = new GroupByTransformation({
  //       field: 'category',
  //     });

  //     const result = transformation.apply([input]) as TimeSeries[];

  //     expect(result.length).toBe(1);
  //     expect(result[0].data).toEqual([{ category: 'A' }, { category: 'B' }]);
  //   });
  // });

  // describe('Mixed Data', () => {
  //   it('should handle mixed TableData and TimeSeries inputs', () => {
  //     const input: QueryResult[] = [
  //       {
  //         refId: 'A',
  //         columns: ['category', 'value'],
  //         rows: [
  //           { category: 'A', value: 10 },
  //           { category: 'B', value: 20 },
  //           { category: 'A', value: 30 },
  //         ],
  //       },
  //       {
  //         refId: 'B',
  //         name: 'series1',
  //         labels: {},
  //         data: [
  //           { timestamp: 1633072800000, value: 10, category: 'A' },
  //           { timestamp: 1633076400000, value: 20, category: 'B' },
  //           { timestamp: 1633080000000, value: 30, category: 'A' },
  //         ],
  //       },
  //     ];

  //     const transformation = new GroupByTransformation({
  //       field: 'category',
  //       aggregation: 'sum',
  //     });

  //     const result = transformation.apply(input);

  //     expect(result[0].rows).toEqual([
  //       { category: 'A', value: 40 },
  //       { category: 'B', value: 20 },
  //     ]);
  //     expect(result[1].data).toEqual([
  //       { category: 'A', value: 40 },
  //       { category: 'B', value: 20 },
  //     ]);
  //   });
  // });
});
