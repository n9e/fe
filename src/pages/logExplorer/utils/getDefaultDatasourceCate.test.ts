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

  it('returns undefined for open-source mode when only Doris exists', () => {
    const getDefaultDatasourceCate = loadGetDefaultDatasourceCate(false);

    expect(getDefaultDatasourceCate([{ plugin_type: 'doris' }], 'doris')).toBeUndefined();
  });

  it('falls back to an existing open-source supported datasource', () => {
    const getDefaultDatasourceCate = loadGetDefaultDatasourceCate(false);

    expect(getDefaultDatasourceCate([{ plugin_type: 'doris' }, { plugin_type: 'elasticsearch' }], 'doris')).toBe('elasticsearch');
  });

  it('allows Doris in Plus mode', () => {
    const getDefaultDatasourceCate = loadGetDefaultDatasourceCate(true);

    expect(getDefaultDatasourceCate([{ plugin_type: 'doris' }], 'doris')).toBe('doris');
  });

  it('ignores datasource types that are not enabled logging cates', () => {
    const getDefaultDatasourceCate = loadGetDefaultDatasourceCate(false);

    expect(getDefaultDatasourceCate([{ plugin_type: 'prometheus' }, { plugin_type: 'unknown' }], 'doris')).toBeUndefined();
  });
});
