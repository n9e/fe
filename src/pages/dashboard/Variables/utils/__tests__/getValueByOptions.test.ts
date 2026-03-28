/// <reference types="jest" />

jest.mock('lodash', () => {
  const lodash = jest.requireActual('lodash');
  return {
    __esModule: true,
    default: lodash,
    ...lodash,
  };
});

import getValueByOptions from '../getValueByOptions';

describe('getValueByOptions', () => {
  test('returns undefined when variableValueFixed is set and value is missing', () => {
    const value = getValueByOptions({
      variableValueFixed: true as any,
      variable: {
        name: 'q',
        type: 'query',
        definition: 'label_values(instance)',
        datasource: { cate: 'prometheus', value: 1 },
        value: undefined,
      } as any,
      itemOptions: [
        { label: 'a', value: 'a' },
        { label: 'b', value: 'b' },
      ],
    });

    expect(value).toBeUndefined();
  });

  test('uses defaultValue when provided and variableValueFixed is not set', () => {
    const value = getValueByOptions({
      variableValueFixed: undefined as any,
      variable: {
        name: 'q',
        type: 'query',
        definition: 'label_values(instance)',
        datasource: { cate: 'prometheus', value: 1 },
        defaultValue: 'b',
        value: undefined,
      } as any,
      itemOptions: [
        { label: 'a', value: 'a' },
        { label: 'b', value: 'b' },
      ],
    });

    expect(value).toBe('b');
  });

  test('keeps existing value when it is in options', () => {
    const value = getValueByOptions({
      variableValueFixed: undefined as any,
      variable: {
        name: 'q',
        type: 'query',
        definition: 'label_values(instance)',
        datasource: { cate: 'prometheus', value: 1 },
        value: 'b',
      } as any,
      itemOptions: [
        { label: 'a', value: 'a' },
        { label: 'b', value: 'b' },
      ],
    });

    expect(value).toBe('b');
  });

  test('falls back to first option when value is not in options', () => {
    const value = getValueByOptions({
      variableValueFixed: undefined as any,
      variable: {
        name: 'q',
        type: 'query',
        definition: 'label_values(instance)',
        datasource: { cate: 'prometheus', value: 1 },
        value: 'x',
      } as any,
      itemOptions: [
        { label: 'a', value: 'a' },
        { label: 'b', value: 'b' },
      ],
    });

    expect(value).toBe('a');
  });

  test('uses ["all"] as default for multi variables when allOption is enabled', () => {
    const value = getValueByOptions({
      variableValueFixed: undefined as any,
      variable: {
        name: 'q',
        type: 'query',
        definition: 'label_values(instance)',
        datasource: { cate: 'prometheus', value: 1 },
        multi: true,
        allOption: true,
        value: undefined,
      } as any,
      itemOptions: [
        { label: 'a', value: 'a' },
        { label: 'b', value: 'b' },
      ],
    });

    expect(value).toEqual(['all']);
  });

  test('uses first option array as default for multi variables when allOption is disabled', () => {
    const value = getValueByOptions({
      variableValueFixed: undefined as any,
      variable: {
        name: 'q',
        type: 'query',
        definition: 'label_values(instance)',
        datasource: { cate: 'prometheus', value: 1 },
        multi: true,
        allOption: false,
        value: undefined,
      } as any,
      itemOptions: [
        { label: 'a', value: 'a' },
        { label: 'b', value: 'b' },
      ],
    });

    expect(value).toEqual(['a']);
  });

  test('returns empty string as default for textbox when no options exist', () => {
    const value = getValueByOptions({
      variableValueFixed: undefined as any,
      variable: {
        name: 'input',
        type: 'textbox',
        definition: '',
        datasource: { cate: 'prometheus' },
        value: undefined,
      } as any,
    });

    expect(value).toBe('');
  });
});
