import queryString from 'query-string';
import _ from 'lodash';
import { getDefaultDatasourceValue, setDefaultDatasourceValue } from '@/utils';

export const getLocalDatasourceValue = (search: string, groupedDatasourceList) => {
  const locationQuery = queryString.parse(search);
  const urlValue = _.get(locationQuery, '__datasourceValue');
  if (urlValue) {
    setDefaultDatasourceValue('prometheus', _.toString(urlValue));
    return _.toNumber(urlValue);
  }
  const localDatasourceValue = getDefaultDatasourceValue('prometheus', groupedDatasourceList);
  return localDatasourceValue;
};

/**
 * 获取数据源值，v6 开始使用数据源 ID，v5 使用数据源名称
 * 这里需要把数据源名称转换为数据源 ID
 */
export const getDatasourceValue = (dashboardConfigs, datasources) => {
  if (dashboardConfigs.datasourceValue && dashboardConfigs.version === '2.0.0') {
    console.warn('v6 版本的监控仪表盘将不再支持 v5 版本的数据源');
    dashboardConfigs.datasourceValue = _.find(datasources, { name: dashboardConfigs.datasourceValue })?.id;
  }
  return dashboardConfigs.datasourceValue;
};

export const getLocalStep = (id) => {
  const localStep = localStorage.getItem(`dashboard_${id}_step`);
  return localStep ? _.toNumber(localStep) : null;
};

export const setLocalStep = (id, step) => {
  if (step) {
    localStorage.setItem(`dashboard_${id}_step`, step);
  } else {
    localStorage.removeItem(`dashboard_${id}_step`);
  }
};
