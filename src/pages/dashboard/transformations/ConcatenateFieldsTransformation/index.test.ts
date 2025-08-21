import ConcatenateFieldsTransformation from './index';
import { QueryResult, TimeSeries, TableData } from '../types';

describe('ConcatenateFieldsTransformation', () => {
  describe('TableData', () => {
    it('should concatenate fields in TableData', () => {
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
            name: 'firstName',
            type: 'string',
            values: ['John', 'Jane'],
            state: {},
          },
          {
            name: 'lastName',
            type: 'string',
            values: ['Doe', 'Smith'],
            state: {},
          },
        ],
      };

      const transformation = new ConcatenateFieldsTransformation({
        fieldNames: ['firstName', 'lastName'],
        newFieldName: 'fullName',
        separator: ' ', // 使用空格作为分隔符
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields).toHaveLength(4);
      expect(result[0].fields[3]).toEqual({
        name: 'fullName',
        type: 'string',
        values: ['John Doe', 'Jane Smith'],
        state: {},
      });
    });

    it('should concatenate fields without a separator', () => {
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
            name: 'firstName',
            type: 'string',
            values: ['John', 'Jane'],
            state: {},
          },
          {
            name: 'lastName',
            type: 'string',
            values: ['Doe', 'Smith'],
            state: {},
          },
        ],
      };

      const transformation = new ConcatenateFieldsTransformation({
        fieldNames: ['firstName', 'lastName'],
        newFieldName: 'fullName',
      });

      const result = transformation.apply([input]) as TableData[];

      expect(result.length).toBe(1);
      expect(result[0].fields[3]).toEqual({
        name: 'fullName',
        type: 'string',
        values: ['JohnDoe', 'JaneSmith'],
        state: {},
      });
    });
  });

  // describe('TimeSeries', () => {
  //   it('should concatenate fields in TimeSeries', () => {
  //     const input: TimeSeries = {
  //       refId: 'A',
  //       name: 'series1',
  //       labels: {},
  //       data: [
  //         { timestamp: 1633072800000, value: 10, category: 'A' },
  //         { timestamp: 1633076400000, value: 20, category: 'B' },
  //       ],
  //     };

  //     const transformation = new ConcatenateFieldsTransformation({
  //       fieldNames: ['category', 'value'],
  //       newFieldName: 'categoryValue',
  //       separator: '-', // 使用短横线作为分隔符
  //     });

  //     const result = transformation.apply([input]) as TimeSeries[];

  //     expect(result.length).toBe(1);
  //     expect(result[0].data).toEqual([
  //       { timestamp: 1633072800000, value: 10, category: 'A', categoryValue: 'A-10' },
  //       { timestamp: 1633076400000, value: 20, category: 'B', categoryValue: 'B-20' },
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
  //           { timestamp: 1633072800000, value: 10, category: 'A' },
  //           { timestamp: 1633076400000, value: 20, category: 'B' },
  //         ],
  //       },
  //       {
  //         refId: 'B',
  //         columns: ['id', 'firstName', 'lastName'],
  //         rows: [
  //           { id: 1, firstName: 'John', lastName: 'Doe' },
  //           { id: 2, firstName: 'Jane', lastName: 'Smith' },
  //         ],
  //       },
  //     ];

  //     const transformation = new ConcatenateFieldsTransformation({
  //       fieldNames: ['firstName', 'lastName'],
  //       newFieldName: 'fullName',
  //       separator: ' ',
  //     });

  //     const result = transformation.apply(input);

  //     expect(result[0].data).toEqual([
  //       { timestamp: 1633072800000, value: 10, category: 'A' }, // TimeSeries 保持不变
  //       { timestamp: 1633076400000, value: 20, category: 'B' },
  //     ]);
  //     expect(result[1].rows).toEqual([
  //       { id: 1, firstName: 'John', lastName: 'Doe', fullName: 'John Doe' },
  //       { id: 2, firstName: 'Jane', lastName: 'Smith', fullName: 'Jane Smith' },
  //     ]);
  //   });
  // });
});
