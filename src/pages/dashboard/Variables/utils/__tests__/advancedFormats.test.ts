import adjustData from '../ajustData';
import { formatString } from '../formatString';
import replaceTemplateVariables from '../replaceTemplateVariables';
import type { IVariable } from '../../types';

jest.mock('@/utils/constant', () => ({
  DatasourceCateEnum: {
    prometheus: 'prometheus',
    elasticsearch: 'elasticsearch',
    mysql: 'mysql',
    doris: 'doris',
  },
}));
jest.mock('@/components/TimeRangePicker', () => ({
  parseRange: jest.fn(),
}));
jest.mock('@/pages/dashboard/globalState', () => ({
  useGlobalState: jest.fn(),
}));
jest.mock('@/pages/dashboard/utils', () => ({
  getDefaultStepByTime: jest.fn(),
}));

const servers: IVariable = {
  name: 'servers',
  type: 'query',
  definition: '',
  datasource: { cate: 'doris', value: 1 },
  multi: true,
  value: ['web-01', "db'o1", 'api.02'],
  options: [
    { label: 'Web', value: 'web-01' },
    { label: 'Database', value: "db'o1" },
    { label: 'API', value: 'api.02' },
  ],
};

function interpolation(variable = servers) {
  return adjustData([variable], { datasourceList: [] });
}

describe('advanced variable interpolation formats', () => {
  const data = interpolation();

  test.each([
    ['${servers:csv}', "web-01,db'o1,api.02"],
    ['${servers:distributed}', "web-01,servers=db'o1,servers=api.02"],
    ['${servers:doublequote}', `"web-01","db'o1","api.02"`],
    ['${servers:glob}', "{web-01,db'o1,api.02}"],
    ['${servers:join: / }', "web-01 / db'o1 / api.02"],
    ['${servers:json}', `["web-01","db'o1","api.02"]`],
    ['${servers:lucene}', `("web\\-01" OR "db'o1" OR "api.02")`],
    ['${servers:percentencode}', 'web-01%2Cdb%27o1%2Capi.02'],
    ['${servers:pipe}', "web-01|db'o1|api.02"],
    ['${servers:queryparam}', 'var-servers=web-01&var-servers=db%27o1&var-servers=api.02'],
    ['${servers:customqueryparam:svc:x-}', 'svc=x-web-01&svc=x-db%27o1&svc=x-api.02'],
    ['${servers:raw}', "web-01,db'o1,api.02"],
    ['${servers:regex}', "(web-01|db'o1|api\\.02)"],
    ['${servers:singlequote}', `'web-01','db\\'o1','api.02'`],
    ['${servers:sqlstring}', `'web-01','db''o1','api.02'`],
    ['${servers:text}', 'Web + Database + API'],
  ])('formats %s', (expression, expected) => {
    expect(formatString(expression, data)).toBe(expected);
  });

  test('keeps the default datasource interpolation while formatters use raw selected values', () => {
    expect(formatString('${servers}', data)).toBe(`'web-01', 'db''o1', 'api.02'`);
    expect(formatString('${servers:csv}', data)).toBe("web-01,db'o1,api.02");
  });

  test('uses option labels for text and option values for query formats', () => {
    const hostLabels: IVariable = {
      ...servers,
      name: 'host_labels',
      value: ['10.0.0.1:9100', '10.0.0.2:9100'],
      options: [
        { label: 'node-exporter', value: '10.0.0.1:9100' },
        { label: 'doris', value: '10.0.0.2:9100' },
      ],
    };
    const hostData = interpolation(hostLabels);

    expect(formatString('${host_labels:text}', hostData)).toBe('node-exporter + doris');
    expect(formatString('${host_labels:csv}', hostData)).toBe('10.0.0.1:9100,10.0.0.2:9100');
  });

  test('expands Doris LIKE OR and AND using escaped SQL string values', () => {
    expect(formatString('${servers:sql_like_or:description}', data, { enableDorisSqlLike: true })).toBe(
      `description LIKE '%web-01%' OR description LIKE '%db''o1%' OR description LIKE '%api.02%'`,
    );
    expect(formatString('${servers:sql_like_and:logs.description}', data, { enableDorisSqlLike: true })).toBe(
      `logs.description LIKE '%web-01%' AND logs.description LIKE '%db''o1%' AND logs.description LIKE '%api.02%'`,
    );
  });

  test('passes the Doris LIKE opt-in through the template-variable entry point', () => {
    const expression = '${servers:sql_like_or:description}';

    expect(replaceTemplateVariables(expression, { variables: [servers], enableDorisSqlLike: true })).toBe(
      "description LIKE '%web-01%' OR description LIKE '%db''o1%' OR description LIKE '%api.02%'",
    );
    expect(replaceTemplateVariables(expression, { variables: [servers] })).toBe(expression);
  });

  test('keeps Doris-only formats unchanged unless explicitly enabled', () => {
    const expression = '${servers:sql_like_or:description}';

    expect(formatString(expression, data)).toBe(expression);
    expect(formatString(expression, data, { enableDorisSqlLike: false })).toBe(expression);
  });

  test.each(['description; DROP TABLE logs', 'logs.description --', 'logs description', ''])('rejects unsafe field names: %s', (fieldName) => {
    const expression = '${servers:sql_like_or:' + fieldName + '}';
    expect(formatString(expression, data, { enableDorisSqlLike: true })).toBe(expression);
  });

  test('accepts quoted SQL identifiers and preserves a custom All condition', () => {
    expect(formatString('${servers:sql_like_or:`logs`.`description`}', data, { enableDorisSqlLike: true })).toContain('`logs`.`description` LIKE');

    const allVariable: IVariable = {
      ...servers,
      value: ['all'],
      allValue: '1=1',
    };
    expect(formatString('${servers:sql_like_or:description}', interpolation(allVariable), { enableDorisSqlLike: true })).toBe('1=1');
    expect(formatString('${servers:text}', interpolation(allVariable))).toBe('All');
  });

  test('filters All choices through the variable regex before building a Doris predicate', () => {
    const allVariable: IVariable = {
      ...servers,
      value: ['all'],
      reg: '/^web-01$/',
    };
    const allData = interpolation(allVariable);

    expect(formatString('${servers:sql_like_or:description}', allData, { enableDorisSqlLike: true })).toBe("description LIKE '%web-01%'");
    expect(formatString('${servers:text}', allData)).toBe('All');
  });
});
