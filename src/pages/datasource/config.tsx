import { DatasourceCateEnum } from '@/utils/constant';

export const helpLinkMap = {
  [DatasourceCateEnum.prometheus]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/integrations/datasource/prometheus/',
  [DatasourceCateEnum.tdengine]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/integrations/datasource/tdengine/',
  jaeger: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/integrations/datasource/jaeger/',
  [DatasourceCateEnum.zabbix]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/integrations/datasource/zabbix/',
  [DatasourceCateEnum.loki]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/integrations/datasource/loki/',
  [DatasourceCateEnum.tencentCLS]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/integrations/datasource/tx-cls/',
  [DatasourceCateEnum.elasticsearch]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/integrations/datasource/es/',
  [DatasourceCateEnum.aliyunSLS]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/integrations/datasource/aliy-sls/',
  [DatasourceCateEnum.mysql]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/integrations/datasource/mysql/',
};
