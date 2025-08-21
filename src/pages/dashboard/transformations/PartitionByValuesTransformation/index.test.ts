import PartitionByValuesTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('PartitionByValuesTransformation', () => {
  describe('TableData', () => {
    it('should partition TableData by field values', () => {
      const input: TableData = {
        refId: 'A',
        fields: [
          { name: 'id', type: 'number', values: [1, 2, 3], state: {} },
          { name: 'category', type: 'string', values: ['A', 'B', 'A'], state: {} },
          { name: 'value', type: 'number', values: [10, 20, 30], state: {} },
        ],
      };

      const transformation = new PartitionByValuesTransformation({
        field: 'category',
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(2);
      expect(result[0].fields).toEqual([
        { name: 'id', type: 'number', values: [1, 3], state: {} },
        { name: 'category', type: 'string', values: ['A', 'A'], state: {} },
        { name: 'value', type: 'number', values: [10, 30], state: {} },
      ]);
      expect(result[1].fields).toEqual([
        { name: 'id', type: 'number', values: [2], state: {} },
        { name: 'category', type: 'string', values: ['B'], state: {} },
        { name: 'value', type: 'number', values: [20], state: {} },
      ]);
    });

    it('should handle empty TableData', () => {
      const input: TableData = {
        refId: 'A',
        fields: [
          { name: 'id', type: 'number', values: [], state: {} },
          { name: 'category', type: 'string', values: [], state: {} },
          { name: 'value', type: 'number', values: [], state: {} },
        ],
      };

      const transformation = new PartitionByValuesTransformation({
        field: 'category',
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(0); // 空数据不产生分区
    });
  });

  describe('TimeSeries', () => {
    it('should partition TimeSeries by field values', () => {
      const input: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [
          { timestamp: 1633072800000, value: 10, category: 'A' },
          { timestamp: 1633076400000, value: 20, category: 'B' },
          { timestamp: 1633080000000, value: 30, category: 'A' },
        ],
      };

      const transformation = new PartitionByValuesTransformation({
        field: 'category',
      });

      const result = transformation.apply([input]) as TimeSeries[];

      expect(result.length).toBe(2);
      expect(result[0].data).toEqual([
        { timestamp: 1633072800000, value: 10, category: 'A' },
        { timestamp: 1633080000000, value: 30, category: 'A' },
      ]);
      expect(result[1].data).toEqual([{ timestamp: 1633076400000, value: 20, category: 'B' }]);
    });

    it('should handle empty TimeSeries', () => {
      const input: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [],
      };

      const transformation = new PartitionByValuesTransformation({
        field: 'category',
      });

      const result = transformation.apply([input]) as TimeSeries[];

      expect(result.length).toBe(0); // 空数据不产生分区
    });
  });

  describe('Mixed Data', () => {
    it('should handle mixed TableData and TimeSeries inputs', () => {
      const input: QueryResult[] = [
        {
          refId: 'A',
          fields: [
            { name: 'id', type: 'number', values: [1, 2, 3], state: {} },
            { name: 'category', type: 'string', values: ['A', 'B', 'A'], state: {} },
            { name: 'value', type: 'number', values: [10, 20, 30], state: {} },
          ],
        },
        {
          refId: 'B',
          name: 'series1',
          labels: {},
          data: [
            { timestamp: 1633072800000, value: 10, category: 'A' },
            { timestamp: 1633076400000, value: 20, category: 'B' },
            { timestamp: 1633080000000, value: 30, category: 'A' },
          ],
        },
      ];

      const transformation = new PartitionByValuesTransformation({
        field: 'category',
      });

      const result = transformation.apply(input);

      expect(result.length).toBe(4); // 2 个 TableData 分区 + 2 个 TimeSeries 分区
      expect((result[0] as TableData).fields).toEqual([
        { name: 'id', type: 'number', values: [1, 3], state: {} },
        { name: 'category', type: 'string', values: ['A', 'A'], state: {} },
        { name: 'value', type: 'number', values: [10, 30], state: {} },
      ]);
      expect((result[1] as TableData).fields).toEqual([
        { name: 'id', type: 'number', values: [2], state: {} },
        { name: 'category', type: 'string', values: ['B'], state: {} },
        { name: 'value', type: 'number', values: [20], state: {} },
      ]);
      expect((result[2] as TimeSeries).data).toEqual([
        { timestamp: 1633072800000, value: 10, category: 'A' },
        { timestamp: 1633080000000, value: 30, category: 'A' },
      ]);
      expect((result[3] as TimeSeries).data).toEqual([{ timestamp: 1633076400000, value: 20, category: 'B' }]);
    });
  });
});
