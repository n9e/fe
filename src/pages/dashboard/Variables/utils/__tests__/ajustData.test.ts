/// <reference types="jest" />

jest.mock('lodash', () => {
  const lodash = jest.requireActual('lodash');
  return {
    __esModule: true,
    default: lodash,
    ...lodash,
  };
});

jest.mock('../replaceTemplateVariables', () => ({
  __esModule: true,
  getBuiltInVariables: () => [],
}));

jest.mock(
  '@/utils/constant',
  () => ({
    __esModule: true,
    DatasourceCateEnum: {
      prometheus: 'prometheus',
      elasticsearch: 'elasticsearch',
      mysql: 'mysql',
    },
  }),
  { virtual: true },
);

import adjustData from '../ajustData';

describe('ajustData mysql interpolation', () => {
  test('mysql multi values should use sqlstring style', () => {
    const data = adjustData(
      [
        {
          name: 'host',
          definition: '',
          type: 'query',
          datasource: {
            cate: 'mysql',
          },
          value: ['a', "b'c", 'path\\end'],
          options: [
            { label: 'a', value: 'a' },
            { label: "b'c", value: "b'c" },
            { label: 'path\\end', value: 'path\\end' },
          ],
        },
      ] as any,
      {
        datasourceList: [],
      },
    );

    expect(data.host).toBe("'a','b''c','path\\\\end'");
  });

  test('mysql all option should expand all options when allValue is empty', () => {
    const data = adjustData(
      [
        {
          name: 'host',
          definition: '',
          type: 'query',
          datasource: {
            cate: 'mysql',
          },
          value: ['all'],
          options: [
            { label: 'a', value: 'a' },
            { label: 'b', value: 'b' },
          ],
        },
      ] as any,
      {
        datasourceList: [],
      },
    );

    expect(data.host).toBe("'a','b'");
  });

  test('mysql all option should prefer allValue', () => {
    const data = adjustData(
      [
        {
          name: 'host',
          definition: '',
          type: 'query',
          datasource: {
            cate: 'mysql',
          },
          value: ['all'],
          allValue: '1=1',
          options: [
            { label: 'a', value: 'a' },
            { label: 'b', value: 'b' },
          ],
        },
      ] as any,
      {
        datasourceList: [],
      },
    );

    expect(data.host).toBe('1=1');
  });

  test('prometheus multi values should keep existing behavior', () => {
    const data = adjustData(
      [
        {
          name: 'ident',
          definition: '',
          type: 'query',
          datasource: {
            cate: 'prometheus',
          },
          value: ['a', 'b'],
          options: [
            { label: 'a', value: 'a' },
            { label: 'b', value: 'b' },
          ],
        },
      ] as any,
      {
        datasourceList: [],
      },
    );

    expect(data.ident).toBe('(a|b)');
  });
});
