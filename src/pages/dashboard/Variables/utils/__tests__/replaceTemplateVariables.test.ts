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

jest.mock(
  '@/components/TimeRangePicker',
  () => ({
    __esModule: true,
    parseRange: jest.fn(),
  }),
  { virtual: true },
);

jest.mock(
  '@/pages/dashboard/utils',
  () => ({
    __esModule: true,
    getDefaultStepByTime: jest.fn(),
  }),
  { virtual: true },
);

const getGlobalStateMock = jest.fn((key: string) => {
  if (key === 'variablesWithOptions') {
    return [
      {
        name: 'db',
        type: 'datasource',
        definition: 'prometheus',
        defaultValue: '',
        datasource: {
          cate: 'prometheus',
        },
        value: undefined,
      },
      {
        name: 'ident',
        type: 'query',
        definition: 'label_values(cpu_usage_idle, ident)',
        defaultValue: '1',
        datasource: {
          cate: 'prometheus',
          value: '${db}',
        },
        value: undefined,
      },
    ];
  }

  if (key === 'range') {
    return undefined;
  }

  return undefined;
});

jest.mock(
  '@/pages/dashboard/globalState',
  () => ({
    __esModule: true,
    getGlobalState: (key: string) => getGlobalStateMock(key),
  }),
  { virtual: true },
);

import replaceTemplateVariables from '../replaceTemplateVariables';

describe('replaceTemplateVariables', () => {
  beforeEach(() => {
    getGlobalStateMock.mockClear();
  });

  test('should interpolate empty query variable as empty string in text content', () => {
    expect(replaceTemplateVariables('ident: $ident ')).toBe('ident:  ');
  });

  test('should interpolate empty query variable as empty string in prometheus expr', () => {
    expect(replaceTemplateVariables('cpu_usage_idle{ident="$ident"}')).toBe('cpu_usage_idle{ident=""}');
  });

  test('should interpolate empty datasource variable as empty string', () => {
    expect(replaceTemplateVariables('${db}')).toBe('');
  });

  test('should support { value } shaped scopedVars', () => {
    expect(
      replaceTemplateVariables('host=$host', {
        scopedVars: { host: { value: 'api-1' } },
      }),
    ).toBe('host=api-1');
  });

  test('should support flat scopedVars values including undefined without crashing', () => {
    expect(
      replaceTemplateVariables('/x?name=${__field.name}&value=${__field.value}', {
        scopedVars: {
          '__field.name': 'cpu',
          '__field.value': undefined,
        },
      } as unknown as { scopedVars: Record<string, { value?: string }> }),
    ).toBe('/x?name=cpu&value=');
  });
});
