import RenameByRegexTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('RenameByRegexTransformation', () => {
  describe('TableData', () => {
    it('should rename columns in TableData using regex', () => {
      const input: TableData = {
        refId: 'A',
        fields: [
          {
            name: 'user_id',
            type: 'number',
            values: [1, 2],
            state: {},
          },
          {
            name: 'user_name',
            type: 'string',
            values: ['Alice', 'Bob'],
            state: {},
          },
          {
            name: 'user_email',
            type: 'string',
            values: ['alice@example.com', 'bob@example.com'],
            state: {},
          },
        ],
      };

      const transformation = new RenameByRegexTransformation({
        pattern: '^user_',
        replacement: '',
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields).toHaveLength(3);
      expect(result[0].fields[0].name).toBe('id');
      expect(result[0].fields[1].name).toBe('name');
      expect(result[0].fields[2].name).toBe('email');
      expect(result[0].fields[0].state.displayName).toBe('id');
      expect(result[0].fields[1].state.displayName).toBe('name');
      expect(result[0].fields[2].state.displayName).toBe('email');
    });

    it('should handle empty TableData', () => {
      const input: TableData = {
        refId: 'A',
        fields: [],
      };

      const transformation = new RenameByRegexTransformation({
        pattern: '^user_',
        replacement: '',
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields).toEqual([]);
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
          fields: [
            {
              name: 'user_id',
              type: 'number',
              values: [1, 2],
              state: {},
            },
            {
              name: 'user_name',
              type: 'string',
              values: ['Alice', 'Bob'],
              state: {},
            },
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

      expect((result[0] as TableData).fields[0].name).toBe('id');
      expect((result[0] as TableData).fields[1].name).toBe('name');
      expect((result[1] as TimeSeries).data).toEqual([
        { timestamp: 1633072800000, value: 10, name: 'cpu' },
        { timestamp: 1633076400000, value: 20, name: 'memory' },
      ]);
    });
  });
});
