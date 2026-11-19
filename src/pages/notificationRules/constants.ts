import moment from 'moment';

export const NS = 'notification-rules';
export const CN = 'n9e-notification-rules';
export const PERM = `/${NS}`;
// 短暂缓存选项请求结果，减少配置行分批挂载造成的重复请求。
export const OPTIONS_CACHE_STALE_TIME = 5_000;
export const CUSTOM_PARAMS_CACHE_TIME = 60 * 1000;
export const FILTER_SESSION_STORAGE_KEY = 'notification-rules-filter';
export const DEFAULT_VALUES = {
  enable: true,
  notify_configs: [
    {
      severities: [1, 2, 3],
    },
  ],
};
export const DEFAULT_VALUES_TIME_RANGE = {
  week: [0, 1, 2, 3, 4, 5, 6],
  start: moment('00:00', 'HH:mm'),
  end: moment('00:00', 'HH:mm'),
};
export const TABLE_PAGINATION_CACHE_KEY = `${NS}-table-pagination`;
export const ESCALATION_VALUES = {
  ...DEFAULT_VALUES.notify_configs[0],
  duration: 30,
  duration_unit: 'm',
  interval: 10,
};
