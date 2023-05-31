import _ from 'lodash';

export interface Cate {
  value: string;
  label: string;
  type: string;
  alertRule: boolean;
  dashboard: boolean;
  graphPro: boolean;
  alertPro: boolean;
}

export const baseCates: Cate[] = [
  {
    value: 'prometheus',
    label: 'Prometheus',
    type: 'metric',
    alertRule: true,
    dashboard: true,
    graphPro: false,
    alertPro: false,
  },
  {
    value: 'elasticsearch',
    label: 'Elasticsearch',
    type: 'logging',
    alertRule: true,
    dashboard: true,
    graphPro: false,
    alertPro: true,
  },
];

export const AdvancedCates = [
  {
    value: 'aliyun-sls',
    label: '阿里云SLS',
    type: 'logging',
    alertRule: true,
    dashboard: true,
    graphPro: true,
    alertPro: true,
  },
  {
    value: 'ck',
    label: 'ClickHouse',
    type: 'metric',
    alertRule: true,
    dashboard: false,
    graphPro: true,
    alertPro: true,
  },
  {
    value: 'zabbix',
    label: 'Zabbix',
    type: 'metric',
    alertRule: false,
    dashboard: true,
    graphPro: true,
    alertPro: true,
  },
  {
    value: 'influxdb',
    label: 'InfluxDB',
    type: 'metric',
    alertRule: true,
    dashboard: true,
    graphPro: true,
    alertPro: true,
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
        const finded = _.find(AdvancedCates, { value: cate });
        if (finded) {
          datasourceCates.push(finded);
        }
      }
    }
  });
  return datasourceCates;
};
