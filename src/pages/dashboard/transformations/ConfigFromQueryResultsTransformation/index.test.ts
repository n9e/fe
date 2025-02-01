import ConfigFromQueryResultsTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('ConfigFromQueryResultsTransformation', () => {
  describe('TableData', () => {
    it('should extract config from TableData and apply to another TableData', () => {
      const configInput: TableData = {
        refId: 'A',
        columns: ['threshold'],
        rows: [{ threshold: 100 }],
      };

      const targetInput: TableData = {
        refId: 'B',
        columns: ['id', 'value'],
        rows: [
          { id: 1, value: 50 },
          { id: 2, value: 150 },
        ],
      };

      const transformation = new ConfigFromQueryResultsTransformation({
        configField: 'threshold',
        targetField: 'threshold',
      });

      const result = transformation.apply([configInput, targetInput]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].columns).toEqual(['id', 'value', 'threshold']);
      expect(result[0].rows).toEqual([
        { id: 1, value: 50, threshold: 100 },
        { id: 2, value: 150, threshold: 100 },
      ]);
    });
  });

  describe('TimeSeries', () => {
    it('should extract config from TableData and apply to TimeSeries', () => {
      const configInput: TableData = {
        refId: 'A',
        columns: ['threshold'],
        rows: [{ threshold: 200 }],
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
        columns: ['threshold'],
        rows: [{ threshold: 300 }],
      };

      const targetInput1: TableData = {
        refId: 'B',
        columns: ['id', 'value'],
        rows: [
          { id: 1, value: 200 },
          { id: 2, value: 400 },
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

      expect((result[0] as TableData).rows).toEqual([
        { id: 1, value: 200, threshold: 300 },
        { id: 2, value: 400, threshold: 300 },
      ]);
      expect((result[1] as TimeSeries).data).toEqual([
        { timestamp: 1633072800000, value: 250, threshold: 300 },
        { timestamp: 1633076400000, value: 350, threshold: 300 },
      ]);
    });
  });
});
