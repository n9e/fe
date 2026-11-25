import moment from 'moment';
import _ from 'lodash';

export type PeriodicCycle = 'week' | 'month';

// 与后端 models.LastDayOfMonth 一致：每月最后一天
export const LAST_DAY_OF_MONTH = -1;

export interface PeriodicMuteRow {
  cycle?: PeriodicCycle;
  enable_days_of_week?: string;
  enable_days_of_month?: number[];
  enable_stime?: string;
  enable_etime?: string;
}

/**
 * 每月日期排序：几号按升序，「最后一天」排在末尾
 */
export const sortDaysOfMonth = (days?: number[]): number[] => {
  return _.sortBy(_.uniq(days || []), (day) => (day === LAST_DAY_OF_MONTH ? 99 : day));
};

/**
 * 表单里的一行（星期为数组、时间为 moment）转成接口格式；按月的行不带星期，避免旧版本节点按星期误匹配
 */
export const toPeriodicMuteRow = (item: any): PeriodicMuteRow => {
  const cycle: PeriodicCycle = item?.cycle === 'month' ? 'month' : 'week';
  return {
    cycle,
    enable_days_of_week: cycle === 'week' ? _.join(item?.enable_days_of_week, ' ') : '',
    enable_days_of_month: cycle === 'month' ? sortDaysOfMonth(item?.enable_days_of_month) : [],
    enable_stime: item?.enable_stime ? moment(item.enable_stime).format('HH:mm') : undefined,
    enable_etime: item?.enable_etime ? moment(item.enable_etime).format('HH:mm') : undefined,
  };
};

/**
 * 是否选了部分月份没有的日期（29/30/31），用于提示这些月份当天不生效
 */
export const hasMissingDaysOfMonth = (days?: number[]): boolean => {
  return _.some(days, (day) => day >= 29);
};

/**
 * 表单里的一行是否跨天（开始晚于结束）
 */
export const isCrossMidnight = (item: any): boolean => {
  if (!item?.enable_stime || !item?.enable_etime) return false;
  return moment(item.enable_stime).format('HH:mm') > moment(item.enable_etime).format('HH:mm');
};

const matchDay = (row: PeriodicMuteRow, day: moment.Moment): boolean => {
  if (row.cycle === 'month') {
    return _.some(row.enable_days_of_month, (d) => d === day.date() || (d === LAST_DAY_OF_MONTH && day.date() === day.daysInMonth()));
  }
  return _.includes(_.split(row.enable_days_of_week || '', ' '), String(day.day()));
};

/**
 * 某一天里该行生效的时段，语义与后端 PeriodicMute.Match 一致：
 * 开始等于结束或 00:00~23:59 为全天；开始晚于结束时只算当天的 00:00~结束 与 开始~24:00
 */
const daySegments = (row: PeriodicMuteRow, day: moment.Moment): [moment.Moment, moment.Moment][] => {
  const { enable_stime: stime, enable_etime: etime } = row;
  if (!stime || !etime) return [];
  const at = (hm: string) => moment(`${day.format('YYYY-MM-DD')} ${hm}`, 'YYYY-MM-DD HH:mm');
  const dayStart = day.clone().startOf('day');
  const dayEnd = dayStart.clone().add(1, 'day');
  if (stime === etime || (stime === '00:00' && etime === '23:59')) return [[dayStart, dayEnd]];
  if (stime < etime) return [[at(stime), at(etime)]];
  return [
    [dayStart, at(etime)],
    [at(stime), dayEnd],
  ];
};

/**
 * 从 now 起接下来的 count 个生效时段（含当前正在生效的），用于表单里预览配置是否符合预期
 */
export const getNextPeriodicWindows = (rows: PeriodicMuteRow[], now: moment.Moment, count = 3): [moment.Moment, moment.Moment][] => {
  const result: [moment.Moment, moment.Moment][] = [];
  // 只选 31 号时相邻两次最多隔 61 天（1 月 31 日 → 3 月 31 日），多看一段即可
  for (let i = 0; i < 100 && result.length < count; i++) {
    const day = now.clone().startOf('day').add(i, 'day');
    const segments = _.flatMap(rows, (row) => (matchDay(row, day) ? daySegments(row, day) : []));
    _.forEach(
      _.sortBy(segments, ([start]) => start.valueOf()),
      (segment) => {
        if (result.length < count && segment[1].isAfter(now)) result.push(segment);
      },
    );
  }
  return result;
};

/**
 * 时段展示文本，如 `2026-12-01 00:00 ~ 06:00`；结束于次日零点时显示 24:00
 */
export const formatWindow = ([start, end]: [moment.Moment, moment.Moment]): string => {
  const endText = end.isSame(start.clone().startOf('day').add(1, 'day')) ? '24:00' : end.format('HH:mm');
  return `${start.format('YYYY-MM-DD HH:mm')} ~ ${endText}`;
};
