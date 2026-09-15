import _ from 'lodash';
import moment from 'moment';

/**
 * 告警规则 extra_config.service_cal_configs 的表单/接口互转。
 *
 * 规则级的 time_range（每日生效时段）已废弃，小时粒度改在服务日历的具体日期上配置。
 * 存量规则里非全天的 time_range 仍然生效，前端只在这种情况下展示老控件；
 * 全天（00:00-00:00 / 00:00-23:59 / 缺省）视为"没有配置"，保存时不再落库。
 */

export interface ServiceCalConfigItem {
  service_cal_ids: number[];
  time_range?: {
    start: any; // 'HH:mm'（接口）或 Moment（表单）
    end: any;
  };
}

const FULL_DAY_ENDS = ['00:00', '23:59'];

const formatHHmm = (value: any): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value.format === 'function') return value.format('HH:mm');
  return undefined;
};

export const isFullDayTimeRange = (timeRange?: ServiceCalConfigItem['time_range']): boolean => {
  const start = formatHHmm(timeRange?.start);
  const end = formatHHmm(timeRange?.end);
  if (!start || !end) return true;
  return start === '00:00' && FULL_DAY_ENDS.includes(end);
};

export const hasLegacyTimeRange = (configs?: ServiceCalConfigItem[]): boolean => {
  return _.some(configs, (item) => !isFullDayTimeRange(item?.time_range));
};

/**
 * 接口 → 表单。
 * - 有非全天时段的存量规则：保留分组和时段（转 Moment），走老控件
 * - 否则：所有分组的日历合并成一组、不带时段，走新控件
 * - legacyIds 是更早的 extra_config.service_cal_ids，后端只在 service_cal_configs 为空时才读它，这里同样处理
 */
export const normalizeServiceCalConfigs = (configs?: ServiceCalConfigItem[], legacyIds?: number[]): any[] => {
  const list = _.filter(configs, (item) => !_.isEmpty(item?.service_cal_ids));
  if (hasLegacyTimeRange(list)) {
    return _.map(list, (item) => ({
      service_cal_ids: item.service_cal_ids,
      time_range: {
        start: moment(formatHHmm(item.time_range?.start) || '00:00', 'HH:mm'),
        end: moment(formatHHmm(item.time_range?.end) || '00:00', 'HH:mm'),
      },
    }));
  }
  const ids = _.uniq(_.isEmpty(list) ? legacyIds || [] : _.flatMap(list, (item) => item.service_cal_ids));
  return ids.length > 0 ? [{ service_cal_ids: ids }] : [];
};

/**
 * 表单 → 接口。空分组丢弃；全天时段不落库，存量规则改回全天保存一次即清理干净。
 */
export const formatServiceCalConfigs = (configs?: ServiceCalConfigItem[]): ServiceCalConfigItem[] => {
  return _.chain(configs)
    .filter((item) => !_.isEmpty(item?.service_cal_ids))
    .map((item) => {
      if (isFullDayTimeRange(item.time_range)) {
        return { service_cal_ids: item.service_cal_ids };
      }
      return {
        service_cal_ids: item.service_cal_ids,
        time_range: {
          start: formatHHmm(item.time_range!.start)!,
          end: formatHHmm(item.time_range!.end)!,
        },
      };
    })
    .value();
};
