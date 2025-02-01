import OrganizeFieldsTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('OrganizeFieldsTransformation', () => {
  describe('TableData', () => {
    it('should organize fields in TableData', () => {
      const input: TableData = {
        refId: 'A',
        columns: ['id', 'name', 'value'],
        rows: [
          { id: 1, name: 'Alice', value: 10 },
          { id: 2, name: 'Bob', value: 20 },
        ],
      };

      const transformation = new OrganizeFieldsTransformation({
        fields: ['id', 'value'], // 只保留 id 和 value 字段
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].columns).toEqual(['id', 'value']);
      expect(result[0].rows).toEqual([
        { id: 1, value: 10 },
        { id: 2, value: 20 },
      ]);
    });

    it('should rename fields in TableData', () => {
      const input: TableData = {
        refId: 'A',
        columns: ['id', 'name', 'value'],
        rows: [
          { id: 1, name: 'Alice', value: 10 },
          { id: 2, name: 'Bob', value: 20 },
        ],
      };

      const transformation = new OrganizeFieldsTransformation({
        fields: ['id', 'value'],
        renameMap: { id: 'userId', value: 'score' }, // 重命名字段
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].columns).toEqual(['userId', 'score']);
      expect(result[0].rows).toEqual([
        { userId: 1, score: 10 },
        { userId: 2, score: 20 },
      ]);
    });
  });

  // describe('TimeSeries', () => {
  //   it('should organize fields in TimeSeries', () => {
  //     const input: TimeSeries = {
  //       refId: 'A',
  //       name: 'series1',
  //       labels: {},
  //       data: [
  //         { timestamp: 1633072800000, value: 10, extra: 'foo' },
  //         { timestamp: 1633076400000, value: 20, extra: 'bar' },
  //       ],
  //     };

  //     const transformation = new OrganizeFieldsTransformation({
  //       fields: ['timestamp', 'value'], // 只保留 timestamp 和 value 字段
  //     });

  //     const result = transformation.apply([input]) as TimeSeries[];

  //     expect(result.length).toBe(1);
  //     expect(result[0].data).toEqual([
  //       { timestamp: 1633072800000, value: 10 },
  //       { timestamp: 1633076400000, value: 20 },
  //     ]);
  //   });

  //   it('should rename fields in TimeSeries', () => {
  //     const input: TimeSeries = {
  //       refId: 'A',
  //       name: 'series1',
  //       labels: {},
  //       data: [
  //         { timestamp: 1633072800000, value: 10, extra: 'foo' },
  //         { timestamp: 1633076400000, value: 20, extra: 'bar' },
  //       ],
  //     };

  //     const transformation = new OrganizeFieldsTransformation({
  //       fields: ['timestamp', 'value'],
  //       renameMap: { timestamp: 'time', value: 'val' }, // 重命名字段
  //     });

  //     const result = transformation.apply([input]) as TimeSeries[];

  //     expect(result.length).toBe(1);
  //     expect(result[0].data).toEqual([
  //       { time: 1633072800000, val: 10 },
  //       { time: 1633076400000, val: 20 },
  //     ]);
  //   });
  // });

  // describe('Mixed Data', () => {
  //   it('should handle mixed TimeSeries and TableData inputs', () => {
  //     const input: QueryResult[] = [
  //       {
  //         refId: 'A',
  //         name: 'series1',
  //         labels: {},
  //         data: [
  //           { timestamp: 1633072800000, value: 10, extra: 'foo' },
  //           { timestamp: 1633076400000, value: 20, extra: 'bar' },
  //         ],
  //       },
  //       {
  //         refId: 'B',
  //         columns: ['id', 'name', 'value'],
  //         rows: [
  //           { id: 1, name: 'Alice', value: 10 },
  //           { id: 2, name: 'Bob', value: 20 },
  //         ],
  //       },
  //     ];

  //     const transformation = new OrganizeFieldsTransformation({
  //       fields: ['timestamp', 'value'], // 只对 TimeSeries 生效
  //     });

  //     const result = transformation.apply(input);

  //     expect(result[0].data).toEqual([
  //       { timestamp: 1633072800000, value: 10 },
  //       { timestamp: 1633076400000, value: 20 },
  //     ]);
  //     expect(result[1]).toEqual(input[1]); // TableData 保持不变
  //   });
  // });
});
