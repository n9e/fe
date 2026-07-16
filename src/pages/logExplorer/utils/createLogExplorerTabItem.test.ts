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
};

const allCates = [
  { value: 'doris', type: ['logging'], graphPro: true },
  { value: 'elasticsearch', type: ['logging'], graphPro: false },
];

function loadCreateLogExplorerTabItem(isPlus: boolean) {
  jest.resetModules();
  jest.doMock('@/utils/constant', () => ({
    DatasourceCateEnum: datasourceCateEnum,
    IS_PLUS: isPlus,
  }));
  jest.doMock('@/components/AdvancedWrap/utils', () => ({
    allCates,
  }));

  return require('./createLogExplorerTabItem').createLogExplorerTabItem as typeof import('./createLogExplorerTabItem').createLogExplorerTabItem;
}

describe('createLogExplorerTabItem', () => {
  afterEach(() => {
    jest.dontMock('@/utils/constant');
    jest.dontMock('@/components/AdvancedWrap/utils');
  });

  it('copies the active tab when its datasource is supported', () => {
    const createLogExplorerTabItem = loadCreateLogExplorerTabItem(false);

    expect(
      createLogExplorerTabItem({
        activeItem: {
          key: 'old',
          name: 'Current',
          formValues: {
            datasourceCate: 'elasticsearch',
            datasourceValue: 1,
            query: { query: 'status:200' },
          },
        },
        key: 'new',
        name: 'Query 2',
        defaultDatasourceCate: 'elasticsearch',
        defaultDatasourceValue: 2,
      }),
    ).toEqual({
      key: 'new',
      name: 'Query 2',
      isInited: false,
      formValues: {
        datasourceCate: 'elasticsearch',
        datasourceValue: 1,
        query: { query: 'status:200' },
      },
    });
  });

  it('uses the default supported datasource when the active tab is not supported', () => {
    const createLogExplorerTabItem = loadCreateLogExplorerTabItem(false);

    expect(
      createLogExplorerTabItem({
        activeItem: {
          key: 'old',
          formValues: {
            datasourceCate: 'doris',
            datasourceValue: 1,
          },
        },
        key: 'new',
        name: 'Query 2',
        defaultDatasourceCate: 'elasticsearch',
        defaultDatasourceValue: 2,
        logsDefaultRange: { start: 'now-1h', end: 'now' },
      }),
    ).toEqual({
      key: 'new',
      name: 'Query 2',
      isInited: false,
      formValues: {
        datasourceCate: 'elasticsearch',
        datasourceValue: 2,
        query: {
          range: { start: 'now-1h', end: 'now' },
        },
      },
    });
  });

  it('uses the default supported datasource when the active datasource no longer exists', () => {
    const createLogExplorerTabItem = loadCreateLogExplorerTabItem(false);

    expect(
      createLogExplorerTabItem({
        activeItem: {
          key: 'old',
          formValues: {
            datasourceCate: 'elasticsearch',
            datasourceValue: 1,
          },
        },
        key: 'new',
        name: 'Query 2',
        defaultDatasourceCate: 'elasticsearch',
        defaultDatasourceValue: 2,
        datasourceList: [{ id: 2, plugin_type: 'elasticsearch' }],
      }),
    ).toEqual({
      key: 'new',
      name: 'Query 2',
      isInited: false,
      formValues: {
        datasourceCate: 'elasticsearch',
        datasourceValue: 2,
        query: {
          range: undefined,
        },
      },
    });
  });
});
