import OrganizeFieldsTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('OrganizeFieldsTransformation', () => {
  describe('TableData', () => {
    it('should organize fields in TableData', () => {
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
            name: 'name',
            type: 'string',
            values: ['Alice', 'Bob'],
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

      const transformation = new OrganizeFieldsTransformation({
        fields: ['id', 'value'], // 只保留 id 和 value 字段
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields.length).toBe(2);
      expect(result[0].fields[0].name).toBe('id');
      expect(result[0].fields[1].name).toBe('value');
      expect(result[0].fields[0].values).toEqual([1, 2]);
      expect(result[0].fields[1].values).toEqual([10, 20]);
    });

    it('should rename fields in TableData', () => {
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

      const transformation = new OrganizeFieldsTransformation({
        fields: ['id', 'value'],
        renameByName: { id: 'userId', value: 'score' }, // 重命名字段
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields.length).toBe(2);
      expect(result[0].fields[0].name).toBe('userId');
      expect(result[0].fields[1].name).toBe('score');
      expect(result[0].fields[0].state.displayName).toBe('userId');
      expect(result[0].fields[1].state.displayName).toBe('score');
    });

    it('should exclude fields using excludeByName in TableData', () => {
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
            name: 'name',
            type: 'string',
            values: ['Alice', 'Bob'],
            state: {},
          },
          {
            name: 'value',
            type: 'number',
            values: [10, 20],
            state: {},
          },
          {
            name: 'extra',
            type: 'string',
            values: ['data1', 'data2'],
            state: {},
          },
        ],
      };

      const transformation = new OrganizeFieldsTransformation({
        fields: ['id', 'name', 'value', 'extra'],
        excludeByName: { extra: true }, // 排除 extra 字段
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields.length).toBe(3);
      expect(result[0].fields.map((f) => f.name)).toEqual(['id', 'name', 'value']);
    });

    it('should order fields using indexByName in TableData', () => {
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
            name: 'name',
            type: 'string',
            values: ['Alice', 'Bob'],
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

      const transformation = new OrganizeFieldsTransformation({
        fields: ['id', 'name', 'value'],
        indexByName: { value: 0, name: 1, id: 2 }, // 重新排序字段
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields.map((f) => f.name)).toEqual(['value', 'name', 'id']); // 按照 indexByName 排序
    });

    it('should combine excludeByName, indexByName and renameByName in TableData', () => {
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
            name: 'name',
            type: 'string',
            values: ['Alice', 'Bob'],
            state: {},
          },
          {
            name: 'value',
            type: 'number',
            values: [10, 20],
            state: {},
          },
          {
            name: 'extra',
            type: 'string',
            values: ['data1', 'data2'],
            state: {},
          },
          {
            name: 'status',
            type: 'string',
            values: ['active', 'inactive'],
            state: {},
          },
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
      expect(result[0].fields.map((f) => f.name)).toEqual(['userStatus', 'value', 'name', 'userId']);
      expect(result[0].fields[0].state.displayName).toBe('userStatus');
      expect(result[0].fields[3].state.displayName).toBe('userId');
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

  describe('Empty and edge cases', () => {
    it('should handle empty fields list for TableData', () => {
      const input: TableData = {
        refId: 'A',
        fields: [
          {
            name: 'cpu',
            type: 'number',
            values: [10, 20, 30],
            state: {},
          },
        ],
      };

      const transformation = new OrganizeFieldsTransformation({
        fields: [], // 空字段列表
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0]).toEqual(input); // 应该返回原始数据
    });

    it('should handle missing fields in TableData', () => {
      const input: TableData = {
        refId: 'A',
        fields: [
          {
            name: 'cpu',
            type: 'number',
            values: [10, 20, 30],
            state: {},
          },
        ],
      };

      const transformation = new OrganizeFieldsTransformation({
        fields: ['cpu', 'memory'], // memory 字段不存在
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields.length).toBe(1);
      expect(result[0].fields[0].name).toBe('cpu');
    });

    it('should handle empty fields list for TimeSeries', () => {
      const input: TimeSeries = {
        refId: 'A',
        name: 'test-series',
        labels: { instance: 'localhost' },
        data: [{ timestamp: 1234567890, value: 10, cpu: 50 }],
      };

      const transformation = new OrganizeFieldsTransformation({
        fields: [], // 空字段列表
      });

      const result = transformation.apply([input]) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0]).toEqual(input); // 应该返回原始数据
    });
  });

  describe('Mixed Data', () => {
    it('should handle mixed TimeSeries and TableData inputs', () => {
      const timeSeriesInput: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [
          { timestamp: 1633072800000, value: 10, extra: 'foo' },
          { timestamp: 1633076400000, value: 20, extra: 'bar' },
        ],
      };

      const tableDataInput: TableData = {
        refId: 'B',
        fields: [
          {
            name: 'id',
            type: 'number',
            values: [1, 2],
            state: {},
          },
          {
            name: 'name',
            type: 'string',
            values: ['Alice', 'Bob'],
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

      const transformation = new OrganizeFieldsTransformation({
        fields: ['timestamp', 'value', 'id'], // 混合字段
        indexByName: { value: 0, timestamp: 1, id: 2 },
      });

      const result = transformation.apply([timeSeriesInput, tableDataInput]);

      // TimeSeries 结果
      expect((result[0] as TimeSeries).data).toEqual([
        { value: 10, timestamp: 1633072800000 },
        { value: 20, timestamp: 1633076400000 },
      ]);

      // TableData 结果
      const tableResult = result[1] as TableData;
      expect(tableResult.fields.map((f) => f.name)).toEqual(['value', 'id']);
      expect(tableResult.fields[0].values).toEqual([10, 20]);
      expect(tableResult.fields[1].values).toEqual([1, 2]);
    });
  });
});
