import { DatasourceCateEnum } from '@/utils/constant';

export const helpLinkMap = {
  [DatasourceCateEnum.prometheus]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/datasource/prometheus/',
  [DatasourceCateEnum.tdengine]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/datasource/tdengine/',
  jaeger: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/datasource/jaeger/',
  [DatasourceCateEnum.zabbix]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/datasource/zabbix/',
  [DatasourceCateEnum.loki]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/datasource/loki/',
  [DatasourceCateEnum.tencentCLS]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/datasource/tx-cls/',
  [DatasourceCateEnum.elasticsearch]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/datasource/es/',
  [DatasourceCateEnum.aliyunSLS]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/datasource/aliy-sls/',
  [DatasourceCateEnum.mysql]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/datasource/mysql/',
};
