import _ from 'lodash';

export const baseCates = [
  {
    value: 'prometheus',
    label: 'Prometheus',
    type: 'metric',
    alertRule: true,
  },
  {
    value: 'elasticsearch',
    label: 'Elasticsearch',
    type: 'logging',
    alertRule: true,
  },
];

export const AdvancedCates = [
  {
    value: 'aliyun-sls',
    label: '阿里云SLS',
    type: 'logging',
    alertRule: true,
  },
  {
    value: 'ck',
    label: 'ClickHouse',
    type: 'metric',
    alertRule: true,
  },
  {
    value: 'zabbix',
    label: 'Zabbix',
    type: 'metric',
    alertRule: false,
  },
  {
    value: 'influxdb',
    label: 'InfluxDB',
    type: 'metric',
    alertRule: true,
  },
];

const varCateMap = {
  VITE_IS_SLS_DS: 'aliyun-sls',
  VITE_IS_CK_DS: 'ck',
  VITE_IS_ZABBIX_DS: 'zabbix',
  VITE_IS_INFLUXDB_DS: 'influxdb',
};

export const getAuthorizedDatasourceCates = () => {
  const datasourceCates = [...baseCates];
  _.forEach(import.meta.env, (value, key) => {
    if (_.endsWith(key, '_DS') && value === 'true') {
      const cate = varCateMap[key];
      if (cate) {
        datasourceCates.push({
          value: cate,
          label: _.find(AdvancedCates, { value: cate })?.label!,
          type: _.find(AdvancedCates, { value: cate })?.type!,
          alertRule: _.find(AdvancedCates, { value: cate })?.alertRule!,
        });
      }
    }
  });
  return datasourceCates;
};
