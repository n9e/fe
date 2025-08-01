import RenameByRegexTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('RenameByRegexTransformation', () => {
  describe('TableData', () => {
    it('should rename columns in TableData using regex', () => {
      const input: TableData = {
        refId: 'A',
        columns: ['user_id', 'user_name', 'user_email'],
        rows: [
          { user_id: 1, user_name: 'Alice', user_email: 'alice@example.com' },
          { user_id: 2, user_name: 'Bob', user_email: 'bob@example.com' },
        ],
      };

      const transformation = new RenameByRegexTransformation({
        pattern: '^user_',
        replacement: '',
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].columns).toEqual(['id', 'name', 'email']);
      expect(result[0].rows).toEqual([
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
      ]);
    });

    it('should handle empty TableData', () => {
      const input: TableData = {
        refId: 'A',
        columns: [],
        rows: [],
      };

      const transformation = new RenameByRegexTransformation({
        pattern: '^user_',
        replacement: '',
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].columns).toEqual([]);
      expect(result[0].rows).toEqual([]);
    });
  });

  describe('TimeSeries', () => {
    it('should rename fields in TimeSeries using regex', () => {
      const input: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [
          // @ts-ignore
          { timestamp: 1633072800000, metric_value: 10, metric_name: 'cpu' },
          // @ts-ignore
          { timestamp: 1633076400000, metric_value: 20, metric_name: 'memory' },
        ],
      };

      const transformation = new RenameByRegexTransformation({
        pattern: '^metric_',
        replacement: '',
      });

      const result = transformation.apply([input]) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0].data).toEqual([
        { timestamp: 1633072800000, value: 10, name: 'cpu' },
        { timestamp: 1633076400000, value: 20, name: 'memory' },
      ]);
    });

    it('should handle empty TimeSeries', () => {
      const input: TimeSeries = {
        refId: 'A',
        name: 'series1',
        labels: {},
        data: [],
      };

      const transformation = new RenameByRegexTransformation({
        pattern: '^metric_',
        replacement: '',
      });

      const result = transformation.apply([input]) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0].data).toEqual([]);
    });
  });

  describe('Mixed Data', () => {
    it('should handle mixed TableData and TimeSeries inputs', () => {
      const input: QueryResult[] = [
        {
          refId: 'A',
          columns: ['user_id', 'user_name'],
          rows: [
            { user_id: 1, user_name: 'Alice' },
            { user_id: 2, user_name: 'Bob' },
          ],
        },
        {
          refId: 'B',
          name: 'series1',
          labels: {},
          data: [
            // @ts-ignore
            { timestamp: 1633072800000, metric_value: 10, metric_name: 'cpu' },
            // @ts-ignore
            { timestamp: 1633076400000, metric_value: 20, metric_name: 'memory' },
          ],
        },
      ];

      const transformation = new RenameByRegexTransformation({
        pattern: '^user_|^metric_',
        replacement: '',
      });

      const result = transformation.apply(input);

      expect((result[0] as TableData).columns).toEqual(['id', 'name']);
      expect((result[0] as TableData).rows).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]);
      expect((result[1] as TimeSeries).data).toEqual([
        { timestamp: 1633072800000, value: 10, name: 'cpu' },
        { timestamp: 1633076400000, value: 20, name: 'memory' },
      ]);
    });
  });
});
