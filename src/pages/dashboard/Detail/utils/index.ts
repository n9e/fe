import queryString from 'query-string';
import _ from 'lodash';
import moment from 'moment';
import { message } from 'antd';
import i18next from 'i18next';

import { getDefaultDatasourceValue, setDefaultDatasourceValue } from '@/utils';
import { IPanel } from '@/pages/dashboard/types';
import { rangeOptions } from '@/components/TimeRangePicker/config';
import { IRawTimeRange, getDefaultValue, isValid } from '@/components/TimeRangePicker';

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

export const dashboardThemeModeCacheKey = 'dashboard-themeMode-value';
export const getDefaultThemeMode = (query) => {
  return query.themeMode || window.localStorage.getItem(dashboardThemeModeCacheKey) || 'light';
};

export const ROW_HEIGHT = 40;
export const scrollToLastPanel = (panels: IPanel[]) => {
  const lastPanel = _.last(panels);
  if (lastPanel) {
    const { y, h } = lastPanel.layout;
    const scrollTop = (y + h) * ROW_HEIGHT;
    // TODO: 等待 panels 更新完成后再滚动，这里临时设置 1s 后滚动
    setTimeout(() => {
      document.querySelector('.dashboard-detail-content')?.scrollTo({
        top: scrollTop,
        behavior: 'smooth',
      });
    }, 1000);
  }
};

export async function goBack(history) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject('nowhere to go'), 100);
    history.goBack();
    const onBack = () => {
      window.removeEventListener('beforeunload', onBack);
      window.removeEventListener('popstate', onBack);
      clearTimeout(timer);
      resolve(true);
    };
    window.addEventListener('beforeunload', onBack);
    window.addEventListener('popstate', onBack);
  });
}

export const dashboardTimeCacheKey = 'dashboard-timeRangePicker-value';
/**
 * 获取默认的时间范围
 * 1. 优先使用 URL 中的 __from 和 __to，如果不合法则使用默认值
 * 2. 如果 URL 中没有 __from 和 __to，则使用缓存中的值
 * 3. 如果缓存中没有值，则使用默认值
 */
// TODO: 如果 URL 的 __from 和 __to 不合法就弹出提示，这里临时设置成只能弹出一次
message.config({
  maxCount: 1,
});
export const getDefaultTimeRange = (id, query, dashboardDefaultRangeIndex?) => {
  const defaultRange =
    dashboardDefaultRangeIndex !== undefined && dashboardDefaultRangeIndex !== ''
      ? rangeOptions[dashboardDefaultRangeIndex]
      : {
          start: 'now-1h',
          end: 'now',
        };
  if (query.__from && query.__to) {
    if (isValid(query.__from) && isValid(query.__to)) {
      return {
        start: query.__from,
        end: query.__to,
      };
    }
    if (moment(_.toNumber(query.__from)).isValid() && moment(_.toNumber(query.__to)).isValid()) {
      return {
        start: moment(_.toNumber(query.__from)),
        end: moment(_.toNumber(query.__to)),
      };
    }
    message.error(i18next.t('dashboard:detail.invalidTimeRange'));
    return getDefaultValue(`${dashboardTimeCacheKey}_${id}`, defaultRange);
  }
  return getDefaultValue(`${dashboardTimeCacheKey}_${id}`, defaultRange);
};

export const getDefaultIntervalSeconds = (query) => {
  if (query.__refresh) {
    const intervalSeconds = _.toNumber(query.__refresh);
    if (intervalSeconds > 0) {
      return intervalSeconds;
    }
  }
  return undefined;
};
