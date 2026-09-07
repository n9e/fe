/// <reference types="jest" />

jest.mock('lodash', () => {
  const lodash = jest.requireActual('lodash');
  return { __esModule: true, default: lodash, ...lodash };
});
jest.mock('@/utils/constant', () => ({ DatasourceCateEnum: { prometheus: 'prometheus', elasticsearch: 'elasticsearch', mysql: 'mysql' } }));
jest.mock('../replaceTemplateVariables', () => ({ getBuiltInVariables: () => [] }));

import _ from 'lodash';
import processQueryOptions from '../processQueryOptions';
import filterOptionsByReg from '../filterOptionsByReg';
import processLegacyQueryOptions from '../../../VariableConfig/processQueryOptions';
import getValueByOptions from '../getValueByOptions';
import adjustData from '../ajustData';
import { formatString } from '../formatString';
import type { IVariable } from '../../types';

const cpu = { label: 'CPU utilization', value: 'compute/cpu' };

// 对照旧函数，确保无正则时的重复项和各类提取规则没有被新协议改变。
describe('scalar compatibility', () => {
  test.each([undefined, '/cpu/', '/compute\\/(.*)/', '/(?<text>compute)\\/(?<value>cpu)/', '/(cpu)/g', '/[/', '/^$/'])('preserves existing results for %s', (reg) => {
    const result = ['compute/cpu', 'cpu cpu', 'compute/cpu', 200, 0, true, false, ''];
    expect(processQueryOptions(result, reg)).toEqual(_.sortBy(filterOptionsByReg(result.map(_.toString), reg), 'value'));
  });
});

describe.each([
  ['current', processQueryOptions],
  ['legacy', processLegacyQueryOptions],
] as const)('%s object options', (_name, process) => {
  test.each([undefined, '/cpu/', '/compute\\/(.*)/', '/[/'])('preserves both fields for %s', (reg) => {
    expect(process([cpu], reg)).toEqual([cpu]);
  });
  test('matches value, not label', () => {
    expect(process([cpu], '/utilization/')).toEqual([]);
  });
  test('overrides only explicitly captured fields', () => {
    expect(process([cpu], '/compute\\/(?<value>.*)/')).toEqual([{ label: cpu.label, value: 'cpu' }]);
    expect(process([cpu], '/compute\\/(?<text>.*)/')).toEqual([{ label: 'cpu', value: cpu.value }]);
    expect(process([cpu], '/(?<text>compute)\\/(?<value>cpu)/')).toEqual([{ label: 'compute', value: 'cpu' }]);
  });
  test('keeps empty captures and ignores groups that did not participate', () => {
    expect(process([cpu], '/(?<text>)(?<value>x)?compute/')).toEqual([{ label: '', value: cpu.value }]);
  });
  test('takes the first participating group for each field across global matches', () => {
    expect(process([{ label: 'original', value: 'v1 tA v2 tB' }], '/v(?<value>\\d)|t(?<text>[A-Z])/g')).toEqual([{ label: 'A', value: '1' }]);
    expect(process([cpu], '/(?<text>)/g')).toEqual([{ label: '', value: cpu.value }]);
  });
  test('resets stateful regex for every input', () => {
    expect(process([cpu, { label: 'Other', value: 'compute/cpu2' }], '/compute/y')).toHaveLength(2);
  });
  test('keeps empty strings, zero and pure text labels', () => {
    expect(
      process([
        { label: '', value: '' },
        { label: 'Zero', value: 0 },
      ]),
    ).toEqual([
      { label: '', value: '' },
      { label: 'Zero', value: '0' },
    ]);
  });
  test('skips invalid entries individually', () => {
    expect(process([null, undefined, [], {}, { label: 'missing value' }, { value: 'missing label' }, { label: {}, value: 'x' }, cpu])).toEqual([cpu]);
    expect(process(null)).toEqual([]);
    expect(process({ options: [cpu] })).toEqual([]);
  });
  test('deduplicates objects after extraction, preserving the first label', () => {
    expect(process([cpu, { label: 'Second', value: 'other/cpu' }], '/\\/(?<value>cpu)/')).toEqual([{ label: cpu.label, value: 'cpu' }]);
  });
  test('supports mixed arrays with first-value-wins semantics', () => {
    expect(process([cpu, 'compute/cpu', 'z', { label: 'Last', value: 'z' }])).toEqual([cpu, { label: 'z', value: 'z' }]);
  });
});

test('keeps the legacy string extraction behavior distinct', () => {
  expect(processLegacyQueryOptions(['prefix-cpu'], '/cpu/')).toEqual([{ label: 'prefix-cpu', value: 'prefix-cpu' }]);
  expect(processQueryOptions(['prefix-cpu'], '/cpu/')).toEqual([{ label: 'cpu', value: 'cpu' }]);
  expect(processLegacyQueryOptions(['cpu cpu'], '/(cpu)/g')).toEqual([{ label: 'cpu', value: 'cpu' }]);
  expect(processLegacyQueryOptions(['cpu', 'cpu'])).toHaveLength(2);
});

test('sorts current query results by value, not display name', () => {
  expect(
    processQueryOptions([
      { label: 'A', value: 'z' },
      { label: 'Z', value: 'a' },
    ]).map((item) => item.value),
  ).toEqual(['a', 'z']);
});

test('selects and interpolates actual project IDs while retaining display names', () => {
  const options = processQueryOptions([
    { label: 'Production', value: 'project-1' },
    { label: 'Development', value: 'project-2' },
  ]);
  const variable: IVariable = { name: 'project', definition: '', type: 'query', datasource: { cate: 'gcm' }, options };
  const select = (value?: string) => getValueByOptions({ variableValueFixed: undefined!, variable: { ...variable, value }, itemOptions: options });
  expect(select()).toBe('project-1');
  expect(select('project-2')).toBe('project-2');
  expect(select('Development')).toBe('project-1');
  const data = adjustData([{ ...variable, value: select('project-2') }], { datasourceList: [] });
  expect(formatString('${project}', data)).toBe('project-2');
  expect(options[1].label).toBe('Development');
});

describe.each([
  ['current', processQueryOptions],
  ['legacy', processLegacyQueryOptions],
] as const)('%s additional boundary cases', (_name, process) => {
  test('does not mutate frozen input or share output objects across calls', () => {
    const input = Object.freeze([Object.freeze({ label: 'CPU', value: 'cpu' })]);
    const first = process(input);
    first[0].label = 'changed';
    expect(process(input)).toEqual([{ label: 'CPU', value: 'cpu' }]);
    expect(input[0].label).toBe('CPU');
  });

  test('does not deduplicate different values that have the same label', () => {
    expect(
      process([
        { label: 'CPU', value: 'a' },
        { label: 'CPU', value: 'b' },
      ]),
    ).toHaveLength(2);
  });

  test('deduplicates numeric values after string normalization, keeping the first label', () => {
    expect(
      process([
        { label: 'Numeric', value: 0 },
        { label: 'String', value: '0' },
      ]),
    ).toEqual([{ label: 'Numeric', value: '0' }]);
  });

  test('keeps scalar-first collisions and rejects boolean object values', () => {
    expect(process([false, { label: 'False', value: 'false' }, { label: 'Invalid', value: false }])).toEqual([{ label: 'false', value: 'false' }]);
  });

  test('empty value captures take precedence over later nonempty captures', () => {
    expect(process([{ label: 'Original', value: 'ab' }], '/(?<value>a?)/g')).toEqual([{ label: 'Original', value: 'a' }]);
    expect(process([{ label: 'Original', value: 'ba' }], '/(?<value>a?)/g')).toEqual([{ label: 'Original', value: '' }]);
  });

  test('unrecognized named groups and unmatched optional groups do not overwrite fields', () => {
    expect(process([cpu], '/(?<other>compute)\\/(?<text>x)?cpu/')).toEqual([cpu]);
  });

  test('matches an empty object value without treating it as a missing value', () => {
    expect(process([{ label: 'Empty', value: '' }], '/^$/')).toEqual([{ label: 'Empty', value: '' }]);
    expect(process([{ label: 'Empty', value: '' }], '/.+/')).toEqual([]);
  });

  test('supports case-insensitive and multiline matching', () => {
    expect(process([cpu], '/CPU/i')).toEqual([cpu]);
    expect(process([{ label: 'Lines', value: 'first\nsecond' }], '/^(?<text>second)$/m')).toEqual([{ label: 'second', value: 'first\nsecond' }]);
  });

  test('handles punctuation, unicode labels and literal HTML as plain data', () => {
    const input = [{ label: '<b>生产环境 / 東京</b>', value: 'project.a+b/c' }];
    expect(process(input, '/^project\\.a\\+b\\/c$/')).toEqual(input);
  });

  test('resets global regex state after misses and empty matches', () => {
    expect(
      process(
        [
          { label: 'A', value: 'x' },
          { label: 'B', value: 'y' },
        ],
        '/(?<text>)/g',
      ),
    ).toEqual([
      { label: '', value: 'x' },
      { label: '', value: 'y' },
    ]);
    expect(process([{ label: 'Miss', value: 'no' }, cpu], '/cpu/g')).toEqual([cpu]);
  });

  test('mixed scalar extraction and object filtering use their respective semantics', () => {
    expect(process(['compute/cpu', { label: 'CPU', value: 'compute/cpu' }], '/compute\\/(.*)/')).toEqual(
      expect.arrayContaining([
        { label: 'cpu', value: 'cpu' },
        { label: 'CPU', value: 'compute/cpu' },
      ]),
    );
  });
});

test('a fixed value is preserved even when no options remain', () => {
  const variable: IVariable = { name: 'project', definition: '', type: 'query', datasource: { cate: 'gcm' }, value: 'project-outside' };
  expect(getValueByOptions({ variableValueFixed: true, variable, itemOptions: [] })).toBe('project-outside');
});

test('string zero remains selectable as a numeric object option default', () => {
  const itemOptions = processQueryOptions([{ label: 'Zero', value: 0 }]);
  const variable: IVariable = { name: 'project', definition: '', type: 'query', datasource: { cate: 'gcm' }, multi: true };
  expect(getValueByOptions({ variableValueFixed: undefined!, variable, itemOptions })).toEqual(['0']);
});

test.each([['project-1', 'project-2'], ['all'], ['__all__']])('interpolates values for a datasource without a custom separator: %j', (...value) => {
  const variable: IVariable = {
    name: 'project',
    definition: '',
    type: 'query',
    datasource: { cate: 'gcm' },
    multi: true,
    value,
    options: [
      { label: 'Production', value: 'project-1' },
      { label: 'Development', value: 'project-2' },
    ],
  };
  expect(formatString('${project}', adjustData([variable], { datasourceList: [] }))).toBe('project-1,project-2');
});

test('custom All value is preserved instead of expanding option labels or values', () => {
  const variable: IVariable = {
    name: 'project',
    definition: '',
    type: 'query',
    datasource: { cate: 'gcm' },
    multi: true,
    value: ['all'],
    allValue: '.*',
    options: [{ label: 'Production', value: 'project-1' }],
  };
  expect(formatString('${project}', adjustData([variable], { datasourceList: [] }))).toBe('.*');
});
