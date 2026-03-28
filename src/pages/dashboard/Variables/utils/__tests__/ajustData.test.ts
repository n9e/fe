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
    },
  }),
  { virtual: true },
);

import adjustData from '../ajustData';
import { formatString } from '../formatString';

describe('adjustData', () => {
  test('uses definition as value for constant variable', () => {
    const data = adjustData(
      [
        {
          name: 'c',
          type: 'constant',
          definition: 'v',
          datasource: { cate: 'prometheus' },
        } as any,
      ],
      { datasourceList: [] },
    );
    expect(data.c).toBe('v');
  });

  test('joins multi values for prometheus with escaping and separator', () => {
    const data = adjustData(
      [
        {
          name: 'q',
          type: 'query',
          definition: '',
          datasource: { cate: 'prometheus' },
          options: [
            { label: 'a(b)', value: 'a(b)' },
            { label: 'c', value: 'c' },
          ],
          value: ['a(b)', 'c'],
          multi: true,
        } as any,
      ],
      { datasourceList: [] },
    );
    expect(data.q).toBe('(a\\\\(b\\\\)|c)');
  });

  test('expands ["all"] to allValue when provided', () => {
    const data = adjustData(
      [
        {
          name: 'q',
          type: 'query',
          definition: '',
          datasource: { cate: 'prometheus' },
          options: [{ label: 'a', value: 'a' }],
          value: ['all'],
          allValue: '.*',
          multi: true,
          allOption: true,
        } as any,
      ],
      { datasourceList: [] },
    );
    expect(data.q).toBe('.*');
  });

  test('expands ["all"] to joined option values when allValue is absent', () => {
    const data = adjustData(
      [
        {
          name: 'q',
          type: 'query',
          definition: '',
          datasource: { cate: 'prometheus' },
          options: [
            { label: 'a', value: 'a' },
            { label: 'b', value: 'b' },
          ],
          value: ['all'],
          multi: true,
          allOption: true,
        } as any,
      ],
      { datasourceList: [] },
    );
    expect(data.q).toBe('(a|b)');
  });

  test('adds quotes and escapes JSON string for elasticsearch when placeholder is unquoted', () => {
    const data = adjustData(
      [
        {
          name: 'q',
          type: 'query',
          definition: '',
          datasource: { cate: 'elasticsearch' },
          options: [{ label: 'a"b', value: 'a"b' }],
          value: ['a"b'],
          multi: true,
        } as any,
      ],
      { datasourceList: [], isPlaceholderQuoted: false, isEscapeJsonString: true },
    );
    expect(data.q).toBe('"a"b"');
  });

  test('joins multi values for elasticsearch with OR separator', () => {
    const data = adjustData(
      [
        {
          name: 'q',
          type: 'query',
          definition: '',
          datasource: { cate: 'elasticsearch' },
          options: [
            { label: 'a', value: 'a' },
            { label: 'b', value: 'b' },
          ],
          value: ['a', 'b'],
          multi: true,
        } as any,
      ],
      { datasourceList: [], isPlaceholderQuoted: false, isEscapeJsonString: true },
    );
    expect(data.q).toBe('(\\"a\\" OR \\"b\\")');
  });

  test('maps datasourceIdentifier value to datasource id when datasourceList contains identifier', () => {
    const data = adjustData(
      [
        {
          name: 'ds',
          type: 'datasourceIdentifier',
          definition: 'prometheus',
          datasource: { cate: 'prometheus' },
          value: 'prod-prom',
        } as any,
      ],
      { datasourceList: [{ id: 10, name: 'p', identifier: 'prod-prom' }] },
    );
    expect(data.ds).toBe(10);
  });

  test('does not interpolate undefined as "undefined" for all variable types', () => {
    const data = adjustData(
      [
        {
          name: 'q',
          type: 'query',
          definition: '',
          datasource: { cate: 'prometheus' },
          value: undefined,
        } as any,
        {
          name: 'custom',
          type: 'custom',
          definition: 'a,b',
          datasource: { cate: 'prometheus' },
          value: undefined,
        } as any,
        {
          name: 'tb',
          type: 'textbox',
          definition: '',
          datasource: { cate: 'prometheus' },
          value: undefined,
        } as any,
        {
          name: 'c',
          type: 'constant',
          definition: 'CONST',
          datasource: { cate: 'prometheus' },
          value: undefined,
        } as any,
        {
          name: 'ds',
          type: 'datasource',
          definition: 'prometheus',
          datasource: { cate: 'prometheus' },
          value: undefined,
        } as any,
        {
          name: 'ds_ident',
          type: 'datasourceIdentifier',
          definition: 'prometheus',
          datasource: { cate: 'prometheus' },
          value: undefined,
        } as any,
        {
          name: 'host',
          type: 'hostIdent',
          definition: '',
          datasource: { cate: 'prometheus' },
          value: undefined,
        } as any,
      ],
      { datasourceList: [] },
    );

    expect(formatString('q=$q', data)).toBe('q=');
    expect(formatString('custom=$custom', data)).toBe('custom=');
    expect(formatString('tb=$tb', data)).toBe('tb=');
    expect(formatString('c=$c', data)).toBe('c=CONST');
    expect(formatString('ds=$ds', data)).toBe('ds=');
    expect(formatString('ds_ident=$ds_ident', data)).toBe('ds_ident=');
    expect(formatString('host=$host', data)).toBe('host=');
  });
});
