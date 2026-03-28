/// <reference types="jest" />

jest.mock('lodash', () => {
  const lodash = jest.requireActual('lodash');
  return {
    __esModule: true,
    default: lodash,
    ...lodash,
  };
});

jest.mock('query-string', () => {
  const qs = jest.requireActual('query-string');
  return {
    __esModule: true,
    default: qs,
    ...qs,
  };
});

jest.mock('@/services/dashboardV2', () => ({
  __esModule: true,
}));

jest.mock('@/components/TimeRangePicker', () => ({
  __esModule: true,
  parseRange: () => ({ start: new Date(), end: new Date() }),
}));

jest.mock('../../utils', () => ({
  __esModule: true,
  getDefaultStepByTime: () => 1,
}));

import { replaceExpressionVars } from '../constant';

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

Object.defineProperty(globalThis, 'window', {
  value: {
    location: { search: '', protocol: 'http:', host: 'localhost', pathname: '/' },
    history: { replaceState: jest.fn() },
  },
  configurable: true,
});

describe('replaceExpressionVars (VariableConfig)', () => {
  beforeEach(() => {
    localStorage.clear();
    (window.history.replaceState as any).mockClear?.();
    window.location.search = '';
  });

  test('replaces placeholders $ / ${} / [[ ]] using selected value from localStorage', () => {
    const id = '1';
    localStorage.setItem(`dashboard_v6_${id}_env`, 'prod');
    const variables: any[] = [
      {
        name: 'env',
        type: 'custom',
        definition: '',
        datasource: { cate: 'prometheus' },
      } as any,
    ];
    const text = 'a=$env b=${env} c=[[env]]';
    const res = replaceExpressionVars({ text, variables, limit: variables.length, dashboardId: id });
    expect(res).toBe('a=prod b=prod c=prod');
  });

  test('joins multi values for prometheus with parentheses and separator', () => {
    const id = '1';
    localStorage.setItem(`dashboard_v6_${id}_region`, JSON.stringify(['a', 'b']));
    const variables: any[] = [
      {
        name: 'region',
        type: 'query',
        definition: '',
        datasource: { cate: 'prometheus' },
        multi: true,
      } as any,
    ];
    const res = replaceExpressionVars({ text: '$region', variables, limit: variables.length, dashboardId: id });
    expect(res).toBe('(a|b)');
  });

  test('expands ["all"] using options when allValue is absent', () => {
    const id = '1';
    localStorage.setItem(`dashboard_v6_${id}_region`, 'all');
    const variables: any[] = [
      {
        name: 'region',
        type: 'query',
        definition: '',
        datasource: { cate: 'prometheus' },
        multi: true,
        allOption: true,
        options: [
          { label: 'a', value: 'a' },
          { label: 'b', value: 'b' },
        ],
      } as any,
    ];
    const res = replaceExpressionVars({ text: '$region', variables, limit: variables.length, dashboardId: id });
    expect(res).toBe('(a|b)');
  });

  test('maps datasourceIdentifier to datasource id when expression is a pure placeholder', () => {
    const id = '1';
    localStorage.setItem(`dashboard_v6_${id}_ds`, 'prod-prom');
    const variables: any[] = [
      {
        name: 'ds',
        type: 'datasourceIdentifier',
        definition: 'prometheus',
        datasource: { cate: 'prometheus' },
      } as any,
    ];
    const res = replaceExpressionVars({
      text: '${ds}',
      variables,
      limit: variables.length,
      dashboardId: id,
      datasourceList: [{ id: 10, identifier: 'prod-prom' }],
    });
    expect(res).toBe(10 as any);
  });

  test('falls back to variable.value when selection is missing', () => {
    const id = '1';
    const variables: any[] = [
      {
        name: 'env',
        type: 'custom',
        definition: '',
        datasource: { cate: 'prometheus' },
        value: 'dev',
      } as any,
    ];
    const res = replaceExpressionVars({ text: '$env', variables, limit: variables.length, dashboardId: id });
    expect(res).toBe('dev');
  });
});
