import moment from 'moment';
import _ from 'lodash';

export const processFormValues = (values) => {
  values = _.cloneDeep(values);
  return {
    ...values,
    btime: moment(values.btime).unix(),
    etime: moment(values.etime).unix(),
    periodic_mutes: _.map(values.periodic_mutes, (item) => {
      return {
        enable_days_of_week: _.join(item.enable_days_of_week, ' '),
        enable_stime: moment(item.enable_stime).format('HH:mm'),
        enable_etime: moment(item.enable_etime).format('HH:mm'),
      };
    }),
    cluster: '0',
  };
};

export interface MuteTagItem {
  key?: string;
  func?: string;
  value?: string;
}

/**
 * 把单个标签条件格式化成可读文本，如 `ident=host01`、`service =~ api.*`
 * 键或值未填完整时返回空字符串，避免半成品文案出现在标题和摘要里
 */
export const formatMuteTag = (tag?: MuteTagItem): string => {
  if (!tag?.key) return '';
  const func = tag.func || '==';
  const value = _.isArray(tag.value) ? _.join(tag.value, ',') : tag.value ?? '';
  if (value === '') return '';
  return func === '==' ? `${tag.key}=${value}` : `${tag.key} ${func} ${value}`;
};

/**
 * 事件等级摘要，如 `S1/S2`；全选或为空时返回空字符串
 */
export const formatSeverities = (severities?: number[]): string => {
  if (!_.isArray(severities) || _.isEmpty(severities) || _.size(severities) >= 3) return '';
  return _.map(_.sortBy(severities), (item) => `S${item}`).join('/');
};

/**
 * 筛选条件是否完全没有限制（没有标签条件，且数据源不限或选了 $all）
 * 这种规则会屏蔽业务组下的所有告警，需要给出风险提示
 */
export const isMuteScopeUnlimited = (values?: { tags?: MuteTagItem[]; datasource_ids?: number[] }): boolean => {
  const hasTags = _.some(values?.tags, (tag) => !!tag?.key);
  const hasDatasource = !_.isEmpty(values?.datasource_ids) && !_.includes(values?.datasource_ids, 0);
  return !hasTags && !hasDatasource;
};

/**
 * 根据筛选条件生成规则标题里的「屏蔽范围」描述
 * 优先级：标签条件 > 具体数据源 > 数据源类型，末尾追加非全选的事件等级
 */
export const buildMuteScopeText = (params: {
  tags?: MuteTagItem[];
  severities?: number[];
  datasourceNames?: string[];
  cateLabel?: string;
  separator: string;
  fallbackText: string;
}): string => {
  const { tags, severities, datasourceNames, cateLabel, separator, fallbackText } = params;
  const parts: string[] = [];
  const tagTexts = _.compact(_.map(tags, formatMuteTag));
  if (!_.isEmpty(tagTexts)) {
    parts.push(_.take(tagTexts, 2).join(separator));
  } else if (!_.isEmpty(datasourceNames)) {
    parts.push(_.take(datasourceNames, 2).join(separator));
  } else if (cateLabel) {
    parts.push(cateLabel);
  }
  const severitiesText = formatSeverities(severities);
  if (severitiesText) {
    parts.push(severitiesText);
  }
  if (_.isEmpty(parts)) return fallbackText;
  return parts.join(' ');
};

/**
 * 两个时间点之间的时长文本，如 `1d 2h 30m`
 */
export const formatDuration = (btime?: moment.Moment, etime?: moment.Moment): string => {
  if (!btime || !etime) return '';
  const diff = moment(etime).valueOf() - moment(btime).valueOf();
  if (diff <= 0) return '';
  const duration = moment.duration(diff);
  const y = Math.floor(duration.asYears());
  if (y > 0) return `${y}y`;
  const d = Math.floor(duration.asDays());
  const h = duration.hours();
  const m = duration.minutes();
  const s = duration.seconds();
  return _.compact([d ? `${d}d` : '', h ? `${h}h` : '', m ? `${m}m` : '', s ? `${s}s` : '']).join(' ');
};
