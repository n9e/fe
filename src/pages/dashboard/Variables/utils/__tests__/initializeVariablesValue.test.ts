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
import type { IVariable } from '../../types';

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
      variableValueFixed: false,
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

  test('should preserve textbox value from URL during initialization execution', () => {
    const value = getValueByOptions({
      variableValueFixed: false,
      variable: {
        name: 'input',
        definition: '',
        type: 'textbox',
        defaultValue: '',
        datasource: {
          cate: 'prometheus',
        },
        value: 'content',
      },
    });

    expect(value).toBe('content');
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

  test('should interpolate fixed query variable empty value as empty string', () => {
    const initialized = initializeVariablesValue(
      [
        {
          name: 'ident',
          definition: 'label_values(cpu_usage_idle, ident)',
          type: 'query',
          defaultValue: '1',
          datasource: {
            cate: 'prometheus',
            value: '${db}',
          },
        },
      ],
      {
        __variable_value_fixed: 'true',
      },
      {
        dashboardId: 1,
      },
    );

    const data = adjustData(initialized, {
      datasourceList: [],
    });

    expect(formatString('ident: $ident', data)).toBe('ident: ');
    expect(formatString('cpu_usage_idle{ident="$ident"}', data)).toBe('cpu_usage_idle{ident=""}');
  });

  test('should interpolate fixed datasource variable empty value as empty string', () => {
    const initialized = initializeVariablesValue(
      [
        {
          name: 'db',
          definition: 'prometheus',
          type: 'datasource',
          defaultValue: '',
          datasource: {
            cate: 'prometheus',
          },
        },
      ],
      {
        __variable_value_fixed: 'true',
      },
      {
        dashboardId: 1,
      },
    );

    const data = adjustData(initialized, {
      datasourceList: [],
    });

    expect(formatString('${db}', data)).toBe('');
  });
});

describe('variable value initialization priority', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const queryVariable = (partial: Partial<IVariable> = {}): IVariable => ({
    name: 'project',
    definition: '',
    type: 'query',
    datasource: { cate: 'prometheus' },
    ...partial,
  });

  test('uses the URL value before the cached value', () => {
    localStorage.setItem('dashboard_v6_42_project', 'from-cache');

    const result = initializeVariablesValue([queryVariable()], { project: 'from-url' }, { dashboardId: 42 });

    expect(result[0].value).toBe('from-url');
  });

  test('restores a cached multi-value when the URL has no value', () => {
    localStorage.setItem('dashboard_v6_42_project', '["project-1","project-2"]');

    const result = initializeVariablesValue([queryVariable({ multi: true })], {}, { dashboardId: 42 });

    expect(result[0].value).toEqual(['project-1', 'project-2']);
  });

  test('normalizes a cached datasource id to a number', () => {
    localStorage.setItem('dashboard_v6_42_db', '2');
    const datasourceVariable = {
      name: 'db',
      definition: 'gcm',
      type: 'datasource',
      datasource: { cate: 'prometheus' },
    } as IVariable;

    const result = initializeVariablesValue([datasourceVariable], {}, { dashboardId: 42 });

    expect(result[0].value).toBe(2);
  });

  test('does not read the cache when fixed URL values are enabled', () => {
    localStorage.setItem('dashboard_v6_42_project', 'from-cache');
    localStorage.setItem('dashboard_v6_42_service', 'cached-service');

    const result = initializeVariablesValue([queryVariable(), queryVariable({ name: 'service' })], { __variable_value_fixed: 'true', project: 'from-url' }, { dashboardId: 42 });

    expect(result.map((variable) => variable.value)).toEqual(['from-url', undefined]);
  });
});
