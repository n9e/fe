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
});
