import JoinByFieldTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('JoinByFieldTransformation', () => {
  describe('TimeSeries', () => {
    it('should join TimeSeries by timestamp (inner join)', () => {
      const input: TimeSeries[] = [
        {
          refId: 'A',
          name: 'series1',
          labels: {},
          data: [
            { timestamp: 1633072800000, value: 10 },
            { timestamp: 1633076400000, value: 20 },
          ],
        },
        {
          refId: 'B',
          name: 'series2',
          labels: {},
          data: [
            { timestamp: 1633076400000, value: 30 },
            { timestamp: 1633080000000, value: 40 },
          ],
        },
      ];

      const transformation = new JoinByFieldTransformation({ field: 'timestamp', type: 'inner' });
      const result = transformation.apply(input) as TimeSeries[];

      expect(result.length).toBe(1);
      expect(result[0].data).toEqual([
        { timestamp: 1633076400000, value: 50 }, // 10 + 40
      ]);
    });
  });

  describe('TableData', () => {
    it('should join TableData by field (inner join)', () => {
      const input: TableData[] = [
        {
          refId: 'A',
          columns: ['id', 'value'],
          rows: [
            { id: 1, value: 10 },
            { id: 2, value: 20 },
          ],
        },
        {
          refId: 'B',
          columns: ['id', 'value'],
          rows: [
            { id: 2, value: 30 },
            { id: 3, value: 40 },
          ],
        },
      ];

      const transformation = new JoinByFieldTransformation({ field: 'id', type: 'inner' });
      const result = transformation.apply(input) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].rows).toEqual([
        { id: 2, id_0: 2, id_1: 2, value_0: 20, value_1: 30 }, // 合并后的行
      ]);
    });

    it('should throw an error if field is missing in TableData', () => {
      const input: TableData[] = [
        {
          refId: 'A',
          columns: ['id', 'value'],
          rows: [{ id: 1, value: 10 }],
        },
        {
          refId: 'B',
          columns: ['time', 'value'],
          rows: [{ time: 1633072800000, value: 30 }],
        },
      ];

      const transformation = new JoinByFieldTransformation({ field: 'id', type: 'inner' });

      expect(() => transformation.apply(input)).toThrowError('Field "id" is missing in one or more tables');
    });
  });

  describe('Mixed Data', () => {
    it('should return original data if input contains mixed types', () => {
      const input: QueryResult[] = [
        {
          refId: 'A',
          name: 'series1',
          labels: {},
          data: [
            { timestamp: 1633072800000, value: 10 },
            { timestamp: 1633076400000, value: 20 },
          ],
        },
        {
          refId: 'B',
          columns: ['id', 'value'],
          rows: [
            { id: 1, value: 10 },
            { id: 2, value: 20 },
          ],
        },
      ];

      const transformation = new JoinByFieldTransformation({ field: 'id', type: 'inner' });
      const result = transformation.apply(input);

      expect(result).toEqual(input); // 返回原始数据
    });
  });
});
