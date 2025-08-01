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
        renameByName: { id: 'userId', value: 'score' }, // 重命名字段
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].columns).toEqual(['userId', 'score']);
      expect(result[0].rows).toEqual([
        { userId: 1, score: 10 },
        { userId: 2, score: 20 },
      ]);
    });

    it('should exclude fields using excludeByName in TableData', () => {
      const input: TableData = {
        refId: 'A',
        columns: ['id', 'name', 'value', 'extra'],
        rows: [
          { id: 1, name: 'Alice', value: 10, extra: 'data1' },
          { id: 2, name: 'Bob', value: 20, extra: 'data2' },
        ],
      };

      const transformation = new OrganizeFieldsTransformation({
        fields: ['id', 'name', 'value', 'extra'],
        excludeByName: { extra: true }, // 排除 extra 字段
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].columns).toEqual(['id', 'name', 'value']);
      expect(result[0].rows).toEqual([
        { id: 1, name: 'Alice', value: 10 },
        { id: 2, name: 'Bob', value: 20 },
      ]);
    });

    it('should order fields using indexByName in TableData', () => {
      const input: TableData = {
        refId: 'A',
        columns: ['id', 'name', 'value'],
        rows: [
          { id: 1, name: 'Alice', value: 10 },
          { id: 2, name: 'Bob', value: 20 },
        ],
      };

      const transformation = new OrganizeFieldsTransformation({
        fields: ['id', 'name', 'value'],
        indexByName: { value: 0, name: 1, id: 2 }, // 重新排序字段
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].columns).toEqual(['value', 'name', 'id']); // 按照 indexByName 排序
      expect(result[0].rows).toEqual([
        { value: 10, name: 'Alice', id: 1 },
        { value: 20, name: 'Bob', id: 2 },
      ]);
    });

    it('should combine excludeByName, indexByName and renameByName in TableData', () => {
      const input: TableData = {
        refId: 'A',
        columns: ['id', 'name', 'value', 'extra', 'status'],
        rows: [
          { id: 1, name: 'Alice', value: 10, extra: 'data1', status: 'active' },
          { id: 2, name: 'Bob', value: 20, extra: 'data2', status: 'inactive' },
        ],
      };

      const transformation = new OrganizeFieldsTransformation({
        fields: ['id', 'name', 'value', 'extra', 'status'],
        excludeByName: { extra: true }, // 排除 extra 字段
        indexByName: { status: 0, value: 1, name: 2, id: 3 }, // 重新排序
        renameByName: { id: 'userId', status: 'userStatus' }, // 重命名字段
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].columns).toEqual(['userStatus', 'value', 'name', 'userId']);
      expect(result[0].rows).toEqual([
        { userStatus: 'active', value: 10, name: 'Alice', userId: 1 },
        { userStatus: 'inactive', value: 20, name: 'Bob', userId: 2 },
      ]);
    });
  });

  describe('TimeSeries', () => {
    it('should organize fields in TimeSeries', () => {
      const input: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [
          { timestamp: 1633072800000, value: 10, extra: 'foo' },
          { timestamp: 1633076400000, value: 20, extra: 'bar' },
        ],
      };

      const transformation = new OrganizeFieldsTransformation({
        fields: ['timestamp', 'value'], // 只保留 timestamp 和 value 字段
      });

      const result = transformation.apply([input]) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0].data).toEqual([
        { timestamp: 1633072800000, value: 10 },
        { timestamp: 1633076400000, value: 20 },
      ]);
    });

    it('should rename fields in TimeSeries', () => {
      const input: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [
          { timestamp: 1633072800000, value: 10, extra: 'foo' },
          { timestamp: 1633076400000, value: 20, extra: 'bar' },
        ],
      };

      const transformation = new OrganizeFieldsTransformation({
        fields: ['timestamp', 'value'],
        renameByName: { timestamp: 'time', value: 'val' }, // 重命名字段
      });

      const result = transformation.apply([input]) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0].data).toEqual([
        { time: 1633072800000, val: 10 },
        { time: 1633076400000, val: 20 },
      ]);
    });

    it('should exclude fields using excludeByName in TimeSeries', () => {
      const input: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [
          { timestamp: 1633072800000, value: 10, extra: 'foo', debug: 'info' },
          { timestamp: 1633076400000, value: 20, extra: 'bar', debug: 'warn' },
        ],
      };

      const transformation = new OrganizeFieldsTransformation({
        fields: ['timestamp', 'value', 'extra', 'debug'],
        excludeByName: { debug: true }, // 排除 debug 字段
      });

      const result = transformation.apply([input]) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0].data).toEqual([
        { timestamp: 1633072800000, value: 10, extra: 'foo' },
        { timestamp: 1633076400000, value: 20, extra: 'bar' },
      ]);
    });

    it('should order fields using indexByName in TimeSeries', () => {
      const input: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [
          { timestamp: 1633072800000, value: 10, extra: 'foo' },
          { timestamp: 1633076400000, value: 20, extra: 'bar' },
        ],
      };

      const transformation = new OrganizeFieldsTransformation({
        fields: ['timestamp', 'value', 'extra'],
        indexByName: { extra: 0, value: 1, timestamp: 2 }, // 重新排序字段
      });

      const result = transformation.apply([input]) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0].data).toEqual([
        { extra: 'foo', value: 10, timestamp: 1633072800000 },
        { extra: 'bar', value: 20, timestamp: 1633076400000 },
      ]);
    });

    it('should combine excludeByName, indexByName and renameByName in TimeSeries', () => {
      const input: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [
          { timestamp: 1633072800000, value: 10, extra: 'foo', debug: 'info', status: 'ok' },
          { timestamp: 1633076400000, value: 20, extra: 'bar', debug: 'warn', status: 'error' },
        ],
      };

      const transformation = new OrganizeFieldsTransformation({
        fields: ['timestamp', 'value', 'extra', 'debug', 'status'],
        excludeByName: { debug: true }, // 排除 debug 字段
        indexByName: { status: 0, value: 1, extra: 2, timestamp: 3 }, // 重新排序
        renameByName: { timestamp: 'time', status: 'state' }, // 重命名字段
      });

      const result = transformation.apply([input]) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0].data).toEqual([
        { state: 'ok', value: 10, extra: 'foo', time: 1633072800000 },
        { state: 'error', value: 20, extra: 'bar', time: 1633076400000 },
      ]);
    });
  });

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
  //       fields: ['timestamp', 'value', 'id'], // 混合字段
  //       indexByName: { value: 0, timestamp: 1, id: 2 },
  //     });

  //     const result = transformation.apply(input);

  //     // TimeSeries 结果
  //     expect((result[0] as TimeSeries).data).toEqual([
  //       { value: 10, timestamp: 1633072800000 },
  //       { value: 20, timestamp: 1633076400000 },
  //     ]);

  //     // TableData 结果
  //     expect((result[1] as TableData).columns).toEqual(['value', 'id']);
  //     expect((result[1] as TableData).rows).toEqual([
  //       { value: 10, id: 1 },
  //       { value: 20, id: 2 },
  //     ]);
  //   });
  // });
});
