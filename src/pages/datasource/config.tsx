import { DatasourceCateEnum } from '@/utils/constant';

export const helpLinkMap = {
  [DatasourceCateEnum.prometheus]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/data-source/open-source/prometheus/',
  [DatasourceCateEnum.tdengine]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/data-source/open-source/tdengine/',
  jaeger: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/data-source/business/jaeger/',
  [DatasourceCateEnum.zabbix]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/data-source/business/zabbix/',
  [DatasourceCateEnum.loki]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/data-source/open-source/loki/',
  [DatasourceCateEnum.tencentCLS]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/data-source/business/tx-cls/',
  [DatasourceCateEnum.elasticsearch]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/data-source/open-source/es/',
  [DatasourceCateEnum.aliyunSLS]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/data-source/business/aliy-sls/',
  [DatasourceCateEnum.mysql]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/data-source/business/mysql/',
};
