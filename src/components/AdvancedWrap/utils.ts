import React from 'react';
import _ from 'lodash';
// @ts-ignore
import { advancedCates } from 'plus:/constants';

export interface Cate {
  value: string;
  label: string;
  label_en?: string;
  type: string[];
  alertRule: boolean; // 是否支持告警规则
  dashboard: boolean; // 是否支持仪表盘
  dashboardVariable: boolean; // 是否支持仪表盘变量
  graphPro: boolean; // Pro版本
  alertPro: boolean; // Pro版本
  logo?: string;
}

export const baseCates: Cate[] = [
  {
    value: 'prometheus',
    label: 'Prometheus',
    label_en: 'Prometheus',
    type: ['metric', 'anomaly'],
    alertRule: true,
    dashboard: true,
    dashboardVariable: true,
    graphPro: false,
    alertPro: false,
    logo: '/image/logos/prometheus.png',
  },
  {
    value: 'elasticsearch',
    label: 'Elasticsearch',
    label_en: 'Elasticsearch',
    type: ['logging'],
    alertRule: true,
    dashboard: true,
    dashboardVariable: true,
    graphPro: false,
    alertPro: false,
    logo: '/image/logos/elasticsearch.png',
  },
  {
    value: 'tdengine',
    label: 'TDengine',
    label_en: 'TDengine',
    type: ['metric'],
    alertRule: true,
    dashboard: true,
    dashboardVariable: false,
    graphPro: false,
    alertPro: false,
    logo: '/image/logos/tdengine.png',
  },
  {
    value: 'loki',
    label: 'Loki',
    label_en: 'Loki',
    type: ['logging'],
    alertRule: true,
    dashboard: false,
    dashboardVariable: false,
    graphPro: false,
    alertPro: false,
    logo: '/image/logos/loki.png',
  },
  {
    value: 'jaeger',
    label: 'Jaeger',
    label_en: 'Jaeger',
    type: ['tracing'],
    alertRule: false,
    dashboard: false,
    dashboardVariable: false,
    graphPro: false,
    alertPro: false,
    logo: '/image/logos/jaeger.png',
  },
  {
    value: 'ck',
    label: 'ClickHouse',
    label_en: 'ClickHouse',
    type: ['metric', 'logging'],
    alertRule: true,
    dashboard: true,
    dashboardVariable: true,
    graphPro: true,
    alertPro: false,
    logo: '/image/logos/ck.png',
  },
  {
    value: 'opensearch',
    label: 'OpenSearch',
    label_en: 'OpenSearch',
    type: ['logging'],
    alertRule: true,
    dashboard: true,
    dashboardVariable: false,
    graphPro: true,
    alertPro: false,
    logo: '/image/logos/opensearch.png',
  },
  {
    value: 'doris',
    label: 'Doris',
    label_en: 'Doris',
    type: ['logging'],
    alertRule: true,
    dashboard: true,
    dashboardVariable: true,
    graphPro: true,
    alertPro: false,
    logo: '/image/logos/doris.png',
  },
  {
    value: 'mysql',
    label: 'MySQL',
    label_en: 'MySQL',
    type: ['metric'],
    alertRule: true,
    dashboard: true,
    dashboardVariable: true,
    graphPro: true,
    alertPro: false,
    logo: '/image/logos/mysql.png',
  },
  {
    value: 'pgsql',
    label: 'PostgreSQL',
    label_en: 'PostgreSQL',
    type: ['metric'],
    alertRule: true,
    dashboard: true,
    dashboardVariable: true,
    graphPro: true,
    alertPro: false,
    logo: '/image/logos/pgsql.png',
  },
  {
    value: 'victorialogs',
    label: 'VictoriaLogs',
    label_en: 'VictoriaLogs',
    type: ['logging'],
    alertRule: true,
    dashboard: false,
    dashboardVariable: false,
    graphPro: true,
    alertPro: false,
    logo: '/image/logos/victorialogs.png',
  },
];

export const allCates = [...baseCates, ...advancedCates];

export const getCateDisplayLabel = (cate: Pick<Cate, 'label' | 'label_en'> | undefined, lang?: string) => {
  if (!cate) return '';
  if (lang && lang !== 'zh_CN') {
    return cate.label_en || cate.label;
  }
  return cate.label;
};

export const getAuthorizedDatasourceCates = (feats, isPlus, filter?: (cate: any) => boolean) => {
  let cates = baseCates;
  if (feats && isPlus) {
    cates = _.filter(feats.plugins, (plugin) => {
      return _.find(allCates, { value: plugin.value });
    });
  }
  if (filter) {
    cates = _.filter(cates, filter);
  }
  return cates;
};

export const getGraphProByCate = (cate: string) => {
  const currentCate = _.find(allCates, { value: cate });
  return currentCate?.graphPro;
};
