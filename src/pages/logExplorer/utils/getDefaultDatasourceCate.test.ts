const datasourceCateEnum = {
  doris: 'doris',
  ck: 'ck',
  aliyunSLS: 'aliyunSLS',
  elasticsearch: 'elasticsearch',
  opensearch: 'opensearch',
  loki: 'loki',
  victorialogs: 'victorialogs',
  huaweiLTS: 'huaweiLTS',
  tencentCLS: 'tencentCLS',
  cloudwatchLogs: 'cloudwatchLogs',
  bceBLS: 'bceBLS',
  volcTLS: 'volcTLS',
  prometheus: 'prometheus',
};

const allCates = [
  { value: 'doris', type: ['logging'], graphPro: true },
  { value: 'ck', type: ['metric', 'logging'], graphPro: true },
  { value: 'opensearch', type: ['logging'], graphPro: true },
  { value: 'elasticsearch', type: ['logging'], graphPro: false },
  { value: 'loki', type: ['logging'], graphPro: false },
  { value: 'victorialogs', type: ['logging'], graphPro: false },
  { value: 'newLogging', type: ['logging'], graphPro: false },
  { value: 'prometheus', type: ['metric'], graphPro: false },
];

function loadGetDefaultDatasourceCate(isPlus: boolean) {
  jest.resetModules();
  jest.doMock('@/utils/constant', () => ({
    DatasourceCateEnum: datasourceCateEnum,
    IS_PLUS: isPlus,
  }));
  jest.doMock('@/components/AdvancedWrap/utils', () => ({
    allCates,
  }));

  return require('./getDefaultDatasourceCate').default as typeof import('./getDefaultDatasourceCate').default;
}

describe('getDefaultDatasourceCate', () => {
  afterEach(() => {
    jest.dontMock('@/utils/constant');
    jest.dontMock('@/components/AdvancedWrap/utils');
  });

  it('returns undefined for open-source mode when only a Pro datasource exists', () => {
    const getDefaultDatasourceCate = loadGetDefaultDatasourceCate(false);

    expect(getDefaultDatasourceCate([{ plugin_type: 'ck' }], 'doris')).toBeUndefined();
  });

  it('falls back to an existing open-source supported datasource when the default is Pro-only', () => {
    const getDefaultDatasourceCate = loadGetDefaultDatasourceCate(false);

    expect(getDefaultDatasourceCate([{ plugin_type: 'ck' }, { plugin_type: 'elasticsearch' }], 'ck')).toBe('elasticsearch');
  });

  it('allows Pro datasource types in Plus mode', () => {
    const getDefaultDatasourceCate = loadGetDefaultDatasourceCate(true);

    expect(getDefaultDatasourceCate([{ plugin_type: 'ck' }], 'ck')).toBe('ck');
  });

  it('allows a newly registered non-Pro logging datasource in open-source mode', () => {
    const getDefaultDatasourceCate = loadGetDefaultDatasourceCate(false);

    expect(getDefaultDatasourceCate([{ plugin_type: 'newLogging' }], 'newLogging')).toBe('newLogging');
  });

  it('ignores datasource types that are not logging cates', () => {
    const getDefaultDatasourceCate = loadGetDefaultDatasourceCate(false);

    expect(getDefaultDatasourceCate([{ plugin_type: 'prometheus' }, { plugin_type: 'unknown' }], 'doris')).toBeUndefined();
  });
});
