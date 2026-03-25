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
