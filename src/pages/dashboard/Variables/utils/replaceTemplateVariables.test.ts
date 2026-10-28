import { replaceDatasourceVariables } from './replaceTemplateVariables';

jest.mock('@/components/TimeRangePicker', () => ({
  parseRange: jest.fn(),
}));
jest.mock('@/pages/dashboard/globalState', () => ({
  useGlobalState: jest.fn(),
}));
jest.mock('@/pages/dashboard/utils', () => ({
  getDefaultStepByTime: jest.fn(),
}));
jest.mock('@/utils/constant', () => ({
  DatasourceCateEnum: {
    prometheus: 'prometheus',
  },
}));

describe('replaceDatasourceVariables', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('parses a numeric datasource id even when the dashboard has no variables', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(replaceDatasourceVariables('123', { datasourceList: [] })).toBe(123);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('returns undefined for an empty datasource value without warning', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(replaceDatasourceVariables('', { datasourceList: [] })).toBeUndefined();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('returns undefined instead of NaN when a variable cannot be resolved', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(replaceDatasourceVariables('${datasource}', { datasourceList: [] })).toBeUndefined();
  });

  it('uses the repeat instance datasource id instead of the global selection', () => {
    const variables = [{ name: 'source', type: 'datasource' as const, definition: '', datasource: { cate: 'prometheus' }, value: ['1', '2'] }];
    expect(replaceDatasourceVariables('$source', { datasourceList: [], variables, scopedVars: { source: { value: '2' } } })).toBe(2);
    expect(variables[0].value).toEqual(['1', '2']);
  });

  it('keeps datasource identifier conversion when a repeat instance supplies the identifier', () => {
    const variables = [{ name: 'source', type: 'datasourceIdentifier' as const, definition: '', datasource: { cate: 'prometheus' }, value: ['main', 'backup'] }];
    expect(
      replaceDatasourceVariables('$source', {
        datasourceList: [
          { id: 1, name: 'Main', identifier: 'main', plugin_type: 'prometheus', is_default: true },
          { id: 2, name: 'Backup', identifier: 'backup', plugin_type: 'prometheus', is_default: false },
        ],
        variables,
        scopedVars: { source: { value: 'backup' } },
      }),
    ).toBe(2);
  });
});
