import ConfigFromQueryResultsTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('ConfigFromQueryResultsTransformation', () => {
  describe('TableData', () => {
    it('should extract config from TableData and apply to another TableData', () => {
      const configInput: TableData = {
        refId: 'A',
        fields: [
          {
            name: 'threshold',
            type: 'number',
            values: [100],
            state: {},
          },
        ],
      };

      const targetInput: TableData = {
        refId: 'B',
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
            values: [50, 150],
            state: {},
          },
        ],
      };

      const transformation = new ConfigFromQueryResultsTransformation({
        configField: 'threshold',
        targetField: 'threshold',
      });

      const result = transformation.apply([configInput, targetInput]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields).toHaveLength(3);
      expect(result[0].fields[2]).toEqual({
        name: 'threshold',
        type: 'number',
        values: [100, 100],
        state: {},
      });
    });
  });

  describe('TimeSeries', () => {
    it('should extract config from TableData and apply to TimeSeries', () => {
      const configInput: TableData = {
        refId: 'A',
        fields: [
          {
            name: 'threshold',
            type: 'number',
            values: [200],
            state: {},
          },
        ],
      };

      const targetInput: TimeSeries = {
        refId: 'B',
        name: 'series1',
        labels: {},
        data: [
          { timestamp: 1633072800000, value: 150 },
          { timestamp: 1633076400000, value: 250 },
        ],
      };

      const transformation = new ConfigFromQueryResultsTransformation({
        configField: 'threshold',
        targetField: 'threshold',
      });

      const result = transformation.apply([configInput, targetInput]) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0].data).toEqual([
        { timestamp: 1633072800000, value: 150, threshold: 200 },
        { timestamp: 1633076400000, value: 250, threshold: 200 },
      ]);
    });
  });

  describe('Mixed Data', () => {
    it('should handle mixed TableData and TimeSeries inputs', () => {
      const configInput: TableData = {
        refId: 'A',
        fields: [
          {
            name: 'threshold',
            type: 'number',
            values: [300],
            state: {},
          },
        ],
      };

      const targetInput1: TableData = {
        refId: 'B',
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
            values: [200, 400],
            state: {},
          },
        ],
      };

      const targetInput2: TimeSeries = {
        refId: 'C',
        name: 'series1',
        labels: {},
        data: [
          { timestamp: 1633072800000, value: 250 },
          { timestamp: 1633076400000, value: 350 },
        ],
      };

      const transformation = new ConfigFromQueryResultsTransformation({
        configField: 'threshold',
        targetField: 'threshold',
      });

      const result = transformation.apply([configInput, targetInput1, targetInput2]);

      // 检查 TableData 结果
      const tableResult = result[0] as TableData;
      expect(tableResult.fields).toHaveLength(3);
      expect(tableResult.fields[2]).toEqual({
        name: 'threshold',
        type: 'number',
        values: [300, 300],
        state: {},
      });

      // 检查 TimeSeries 结果
      expect((result[1] as TimeSeries).data).toEqual([
        { timestamp: 1633072800000, value: 250, threshold: 300 },
        { timestamp: 1633076400000, value: 350, threshold: 300 },
      ]);
    });
  });
});
