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
      doris: 'doris',
    },
  }),
  { virtual: true },
);

import adjustData from '../ajustData';
import { formatString } from '../formatString';

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

  test('doris multi values should use a readable sqlstring list by default', () => {
    const data = adjustData(
      [
        {
          name: 'host',
          definition: '',
          type: 'query',
          datasource: { cate: 'doris' },
          value: ['host01', "host'02"],
          options: [
            { label: 'host01', value: 'host01' },
            { label: "host'02", value: "host'02" },
          ],
        },
      ] as any,
      { datasourceList: [] },
    );

    expect(data.host).toBe("'host01', 'host''02'");
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

  test('keeps the default interpolation while exposing raw values and option labels to advanced formats', () => {
    const data = adjustData(
      [
        {
          name: 'host',
          definition: '',
          type: 'query',
          datasource: { cate: 'prometheus' },
          value: ['api-1', 'api-2'],
          options: [
            { label: 'API One', value: 'api-1' },
            { label: 'API Two', value: 'api-2' },
          ],
        },
      ] as any,
      { datasourceList: [] },
    );

    expect(formatString('${host}', data)).toBe('(api-1|api-2)');
    expect(formatString('${host:csv}', data)).toBe('api-1,api-2');
    expect(formatString('${host:text}', data)).toBe('API One + API Two');
  });

  test('follows Grafana custom all value behavior', () => {
    const data = adjustData(
      [
        {
          name: 'host',
          definition: '',
          type: 'query',
          datasource: { cate: 'prometheus' },
          value: ['all'],
          allValue: '1=1',
          options: [{ label: 'API One', value: 'api-1' }],
        },
      ] as any,
      { datasourceList: [] },
    );

    expect(formatString('${host:csv}', data)).toBe('1=1');
    expect(formatString('${host:percentencode}', data)).toBe('1%3D1');
    expect(formatString('${host:text}', data)).toBe('All');
  });

  test('expands Doris SQL LIKE formats only when explicitly enabled', () => {
    const data = adjustData(
      [
        {
          name: 'host',
          definition: '',
          type: 'query',
          datasource: { cate: 'doris' },
          value: ['a', "b'c"],
          options: [
            { label: 'a', value: 'a' },
            { label: "b'c", value: "b'c" },
          ],
        },
      ] as any,
      { datasourceList: [] },
    );
    const source = '${host:sql_like_or:table.description}';

    expect(formatString(source, data)).toBe(source);
    expect(formatString(source, data, { enableDorisSqlLike: true })).toBe("table.description LIKE '%a%' OR table.description LIKE '%b''c%'");
    expect(formatString('${host:sql_like_and:invalid-field}', data, { enableDorisSqlLike: true })).toBe('${host:sql_like_and:invalid-field}');
  });

  test('preserves Doris SQL LIKE all value behavior', () => {
    const data = adjustData(
      [
        {
          name: 'host',
          definition: '',
          type: 'query',
          datasource: { cate: 'doris' },
          value: ['all'],
          options: [
            { label: 'a', value: 'a' },
            { label: 'b', value: 'b' },
          ],
        },
        {
          name: 'all_host',
          definition: '',
          type: 'query',
          datasource: { cate: 'doris' },
          value: ['all'],
          allValue: '1=1',
        },
      ] as any,
      { datasourceList: [] },
    );

    expect(formatString('${host:sql_like_and:description}', data, { enableDorisSqlLike: true })).toBe("description LIKE '%a%' AND description LIKE '%b%'");
    expect(formatString('${all_host:sql_like_or:description}', data, { enableDorisSqlLike: true })).toBe('1=1');
  });
});
