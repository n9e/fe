import GroupedAggregateTableTransformation, { GroupedAggregateTableOptions } from './index';
import { TableData, QueryResult } from '../types';

describe('GroupedAggregateTableTransformation', () => {
  const sampleTableData: TableData = {
    refId: 'A',
    fields: [
      {
        name: 'time',
        type: 'time',
        values: [1609459200000, 1609459260000, 1609459320000, 1609459380000, 1609459440000, 1609459500000],
        state: {},
      },
      {
        name: 'server',
        type: 'string',
        values: ['server1', 'server2', 'server1', 'server2', 'server1', 'server2'],
        state: {},
      },
      {
        name: 'region',
        type: 'string',
        values: ['us-east', 'us-west', 'us-east', 'us-west', 'us-east', 'us-west'],
        state: {},
      },
      {
        name: 'cpu_usage',
        type: 'number',
        values: [80, 75, 85, 70, 90, 65],
        state: {},
      },
      {
        name: 'memory_usage',
        type: 'number',
        values: [60, 55, 65, 50, 70, 45],
        state: {},
      },
    ],
  };

  describe('基本分组功能', () => {
    it('应该按单个字段分组', () => {
      const options: GroupedAggregateTableOptions = {
        fields: {
          server: {
            operation: 'groupby',
            aggregations: [],
          },
          cpu_usage: {
            operation: 'aggregate',
            aggregations: ['avg', 'max'],
          },
        },
      };

      const transformation = new GroupedAggregateTableTransformation(options);
      const result = transformation.apply([sampleTableData])[0] as TableData;

      // 应该有2个分组（server1, server2）
      expect(result.fields[0].values).toHaveLength(2);
      expect(result.fields[0].values).toEqual(expect.arrayContaining(['server1', 'server2']));

      // 应该有聚合字段
      const avgField = result.fields.find((f) => f.name === 'cpu_usage (avg)');
      const maxField = result.fields.find((f) => f.name === 'cpu_usage (max)');

      expect(avgField).toBeDefined();
      expect(maxField).toBeDefined();
    });

    it('应该按多个字段分组', () => {
      const options: GroupedAggregateTableOptions = {
        fields: {
          server: {
            operation: 'groupby',
            aggregations: [],
          },
          region: {
            operation: 'groupby',
            aggregations: [],
          },
          cpu_usage: {
            operation: 'aggregate',
            aggregations: ['avg'],
          },
        },
      };

      const transformation = new GroupedAggregateTableTransformation(options);
      const result = transformation.apply([sampleTableData])[0] as TableData;

      // 应该有2个组合（server1+us-east, server2+us-west）
      expect(result.fields[0].values).toHaveLength(2);

      // 应该有分组字段和聚合字段
      const serverField = result.fields.find((f) => f.name === 'server');
      const regionField = result.fields.find((f) => f.name === 'region');
      const avgField = result.fields.find((f) => f.name === 'cpu_usage (avg)');

      expect(serverField).toBeDefined();
      expect(regionField).toBeDefined();
      expect(avgField).toBeDefined();
    });

    it('应该处理空配置', () => {
      const options: GroupedAggregateTableOptions = {
        fields: {},
      };

      const transformation = new GroupedAggregateTableTransformation(options);
      const result = transformation.apply([sampleTableData])[0] as TableData;

      // 应该返回原始数据
      expect(result).toBe(sampleTableData);
    });

    it('应该处理没有分组字段的情况', () => {
      const options: GroupedAggregateTableOptions = {
        fields: {
          cpu_usage: {
            operation: 'aggregate',
            aggregations: ['sum'],
          },
        },
      };

      const transformation = new GroupedAggregateTableTransformation(options);
      const result = transformation.apply([sampleTableData])[0] as TableData;

      // 应该返回原始数据，因为没有分组字段
      expect(result).toBe(sampleTableData);
    });

    it('应该处理不存在的字段', () => {
      const options: GroupedAggregateTableOptions = {
        fields: {
          non_existent_field: {
            operation: 'groupby',
            aggregations: [],
          },
        },
      };

      const transformation = new GroupedAggregateTableTransformation(options);
      const result = transformation.apply([sampleTableData])[0] as TableData;

      // 应该返回原始数据，因为没有找到有效的分组字段
      expect(result).toBe(sampleTableData);
    });
  });

  describe('聚合功能', () => {
    it('应该正确计算所有聚合函数', () => {
      const simpleData: TableData = {
        refId: 'A',
        fields: [
          {
            name: 'category',
            type: 'string',
            values: ['A', 'A', 'A'],
            state: {},
          },
          {
            name: 'value',
            type: 'number',
            values: [10, 20, 30],
            state: {},
          },
        ],
      };

      const options: GroupedAggregateTableOptions = {
        fields: {
          category: {
            operation: 'groupby',
            aggregations: [],
          },
          value: {
            operation: 'aggregate',
            aggregations: ['sum', 'avg', 'count', 'max', 'min', 'last'],
          },
        },
      };

      const transformation = new GroupedAggregateTableTransformation(options);
      const result = transformation.apply([simpleData])[0] as TableData;

      // 检查各个聚合结果
      const sumField = result.fields.find((f) => f.name === 'value (sum)');
      const avgField = result.fields.find((f) => f.name === 'value (avg)');
      const countField = result.fields.find((f) => f.name === 'value (count)');
      const maxField = result.fields.find((f) => f.name === 'value (max)');
      const minField = result.fields.find((f) => f.name === 'value (min)');
      const lastField = result.fields.find((f) => f.name === 'value (last)');

      expect(sumField?.values).toEqual([60]); // 10+20+30
      expect(avgField?.values).toEqual([20]); // (10+20+30)/3
      expect(countField?.values).toEqual([3]);
      expect(maxField?.values).toEqual([30]);
      expect(minField?.values).toEqual([10]);
      expect(lastField?.values).toEqual([30]);
    });
  });

  describe('非表格数据处理', () => {
    it('应该原样返回非TableData输入', () => {
      const timeSeriesData: QueryResult = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [
          { timestamp: 1633072800000, value: 10 },
          { timestamp: 1633076400000, value: 20 },
        ],
      };

      const options: GroupedAggregateTableOptions = {
        fields: {
          server: {
            operation: 'groupby',
            aggregations: [],
          },
        },
      };

      const transformation = new GroupedAggregateTableTransformation(options);
      const result = transformation.apply([timeSeriesData]);

      expect(result.length).toBe(1);
      expect(result[0]).toBe(timeSeriesData);
    });
  });
});
