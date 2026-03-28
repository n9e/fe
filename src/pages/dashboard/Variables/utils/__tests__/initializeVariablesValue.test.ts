/// <reference types="jest" />

jest.mock('lodash', () => {
  const lodash = jest.requireActual('lodash');
  return {
    __esModule: true,
    default: lodash,
    ...lodash,
  };
});

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

jest.mock('../replaceTemplateVariables', () => ({
  __esModule: true,
  getBuiltInVariables: () => [],
}));

import initializeVariablesValue from '../initializeVariablesValue';
import getValueByOptions from '../getValueByOptions';
import adjustData from '../ajustData';
import { formatString } from '../formatString';

const createLocalStorageMock = () => {
  let storage: Record<string, string> = {};

  return {
    getItem: (key: string) => {
      return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null;
    },
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    clear: () => {
      storage = {};
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
  };
};

Object.defineProperty(globalThis, 'localStorage', {
  value: createLocalStorageMock(),
  configurable: true,
});

describe('textbox variable empty value', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should initialize textbox empty value as empty string', () => {
    const result = initializeVariablesValue(
      [
        {
          name: 'input',
          definition: '',
          type: 'textbox',
          defaultValue: '',
          datasource: {
            cate: 'prometheus',
          },
        },
      ],
      {},
      {
        dashboardId: 1,
      },
    );

    expect(result[0].value).toBe('');
  });

  test('should use textbox defaultValue during initialization when present', () => {
    const result = initializeVariablesValue(
      [
        {
          name: 'input',
          definition: '',
          type: 'textbox',
          defaultValue: 'preset',
          datasource: {
            cate: 'prometheus',
          },
        },
      ],
      {},
      {
        dashboardId: 1,
      },
    );

    expect(result[0].value).toBe('preset');
  });

  test('should keep empty string textbox defaultValue in fallback selection', () => {
    const value = getValueByOptions({
      variableValueFixed: undefined as any,
      variable: {
        name: 'input',
        definition: '',
        type: 'textbox',
        defaultValue: '',
        datasource: {
          cate: 'prometheus',
        },
      },
    });

    expect(value).toBe('');
  });

  test('should interpolate textbox empty value as empty string', () => {
    const data = adjustData(
      [
        {
          name: 'input',
          definition: '',
          type: 'textbox',
          datasource: {
            cate: 'prometheus',
          },
          value: undefined,
        },
      ],
      {
        datasourceList: [],
      },
    );

    expect(formatString('$input', data)).toBe('');
  });
});

describe('initializeVariablesValue normalization', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('converts multi string value to array', () => {
    const result = initializeVariablesValue(
      [
        {
          name: 'region',
          definition: '',
          type: 'query',
          multi: true,
          datasource: { cate: 'prometheus' },
        } as any,
      ],
      { region: 'bj' },
      { dashboardId: 1 },
    );
    expect(result[0].value).toEqual(['bj']);
  });

  test('converts single array value to first item', () => {
    const result = initializeVariablesValue(
      [
        {
          name: 'region',
          definition: '',
          type: 'query',
          multi: false,
          datasource: { cate: 'prometheus' },
        } as any,
      ],
      { region: ['bj', 'sh'] },
      { dashboardId: 1 },
    );
    expect(result[0].value).toBe('bj');
  });

  test('parses datasource numeric value from string', () => {
    const result = initializeVariablesValue(
      [
        {
          name: 'ds',
          definition: 'prometheus',
          type: 'datasource',
          datasource: { cate: 'prometheus' },
        } as any,
      ],
      { ds: '12' },
      { dashboardId: 1 },
    );
    expect(result[0].value).toBe(12);
  });

  test('treats empty string as undefined for non-textbox variables', () => {
    const result = initializeVariablesValue(
      [
        {
          name: 'env',
          definition: 'prod,dev',
          type: 'custom',
          datasource: { cate: 'prometheus' },
        } as any,
      ],
      { env: '' },
      { dashboardId: 1 },
    );
    expect(result[0].value).toBeUndefined();
  });

  test('does not read localStorage when __variable_value_fixed is present', () => {
    localStorage.setItem('dashboard_v6_1_region', 'sh');
    const result = initializeVariablesValue(
      [
        {
          name: 'region',
          definition: '',
          type: 'query',
          datasource: { cate: 'prometheus' },
        } as any,
      ],
      { __variable_value_fixed: 'true' },
      { dashboardId: 1 },
    );
    expect(result[0].value).toBeUndefined();
  });
});
