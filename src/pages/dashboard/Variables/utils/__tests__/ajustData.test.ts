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
import { formatDorisSqlString, formatString } from '../formatString';

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

describe('ajustData doris interpolation', () => {
  const createDorisHostVariable = (value: string[] | string, allValue?: string) => ({
    name: 'host',
    definition: '',
    type: 'query',
    datasource: {
      cate: 'doris',
    },
    value,
    allValue,
    options: [
      { label: 'server', value: 'server' },
      { label: 'web', value: 'web' },
      { label: "app's", value: "app's" },
    ],
  });

  test('doris multi values should use quoted SQL string list', () => {
    const data = adjustData([createDorisHostVariable(['server', "app's"]) as any], {
      datasourceList: [],
    });

    expect(data.host).toBe("'server', 'app''s'");
  });

  test('doris all option should expand options and preserve custom all value', () => {
    const expanded = adjustData([createDorisHostVariable(['all']) as any], {
      datasourceList: [],
      enableDorisSqlFormats: true,
    });
    const custom = adjustData([createDorisHostVariable(['all'], '1=1') as any], {
      datasourceList: [],
      enableDorisSqlFormats: true,
    });

    expect(expanded.host).toBe("'server', 'web', 'app''s'");
    expect(formatString('${host:sql_like_or}', expanded)).toBe("host LIKE '%server%' OR host LIKE '%web%' OR host LIKE '%app''s%'");
    expect(custom.host).toBe('1=1');
    expect(formatString('${host:sql_like_or}', custom)).toBe('1=1');
  });

  test('doris SQL formats should generate LIKE conditions', () => {
    const data = adjustData([createDorisHostVariable(['server', 'web']) as any], {
      datasourceList: [],
      enableDorisSqlFormats: true,
    });

    expect(formatString('${host:sql_like_or}', data)).toBe("host LIKE '%server%' OR host LIKE '%web%'");
    expect(formatString('${host:sql_like_and}', data)).toBe("host LIKE '%server%' AND host LIKE '%web%'");
  });

  test('doris SQL formats should support an explicit target field', () => {
    const data = adjustData([createDorisHostVariable(['server', 'web']) as any], {
      datasourceList: [],
      enableDorisSqlFormats: true,
    });

    expect(formatDorisSqlString('${host:sql_like_or:description}', data)).toBe("description LIKE '%server%' OR description LIKE '%web%'");
    expect(formatDorisSqlString('${host:sql_like_and:t.description}', data)).toBe("t.description LIKE '%server%' AND t.description LIKE '%web%'");
  });

  test('doris SQL formats should support non-query dashboard variables', () => {
    const data = adjustData(
      [
        {
          name: 'description',
          definition: 'zbq,cpu',
          type: 'custom',
          datasource: { cate: 'prometheus' },
          value: ['zbq', 'cpu'],
          options: [
            { label: 'zbq', value: 'zbq' },
            { label: 'cpu', value: 'cpu' },
          ],
        },
      ] as any,
      {
        datasourceList: [],
        enableDorisSqlFormats: true,
      },
    );

    expect(formatString('${description:sql_like_and}', data)).toBe("description LIKE '%zbq%' AND description LIKE '%cpu%'");
  });

  test('doris SQL formats should return an empty string for an empty selection', () => {
    const data = adjustData([createDorisHostVariable([]) as any], {
      datasourceList: [],
      enableDorisSqlFormats: true,
    });

    expect(formatString('${host:sql_like_or}', data)).toBe('');
    expect(formatString('${host:sql_like_and}', data)).toBe('');
  });

  test('doris SQL formats should not be available outside Doris SQL interpolation', () => {
    const data = adjustData([createDorisHostVariable(['server']) as any], {
      datasourceList: [],
    });

    expect(formatString('${host:sql_like_or}', data)).toBe('${host:sql_like_or}');
  });
});
