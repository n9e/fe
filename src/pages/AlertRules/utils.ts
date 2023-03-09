import _ from 'lodash';
import { mapOptionToRelativeTimeRange, mapRelativeTimeRangeToOption } from '@/components/TimeRangePicker';

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');

export const parseTimeToValueAndUnit = (value?: number) => {
  if (!value) {
    return {
      value: value,
      unit: 'min',
    };
  }
  let time = value / 60;
  if (time < 60) {
    return {
      value: time,
      unit: 'min',
    };
  }
  time = time / 60;
  if (time < 24) {
    return {
      value: time,
      unit: 'hour',
    };
  }
  time = time / 24;
  return {
    value: time,
    unit: 'day',
  };
};

export const normalizeTime = (value?: number, unit?: 'second' | 'min' | 'hour') => {
  if (!value) {
    return value;
  }
  if (unit === 'second') {
    return value;
  }
  if (unit === 'min') {
    return value * 60;
  }
  if (unit === 'hour') {
    return value * 60 * 60;
  }
  if (unit === 'day') {
    return value * 60 * 60 * 24;
  }
  return value;
};

/**
 * es 的 query 和 rules 设置为了兼容开源接口，需要转换成 json string 放到 prom_ql 字段里
 * 这里需要把 prom_ql 转换成结构化的 query
 * 这里面还需要转换一些时间字段，这些时间字段默认是秒单位，需要转换成分钟或是小时，xxx_unit: 'min' | 'hour'
 *  1. interval 拆开成 interval 和 interval_unit
 *  2. rule.compare_time 拆开成 compare_time 和 compare_time_unit
 */
export const parseValues = (values: any = {}) => {
  const cloned = _.cloneDeep(values);
  const cate = cloned.cate || 'prometheus';
  if (cate === 'elasticsearch') {
    const queryString = cloned.prom_ql;
    let query: any = {};
    try {
      query = JSON.parse(queryString);
    } catch (e) {
      console.error(e);
    }
    if (query?.interval !== undefined) {
      // 第一版的结构，未来会废弃
      query.interval = parseTimeToValueAndUnit(query.interval).value;
      query.interval_unit = parseTimeToValueAndUnit(query.interval).unit;
      query.rules = _.map(query.rules, (rule: any) => {
        return {
          ...rule,
          rule: _.map(rule.rule, (item: any) => {
            return {
              ...item,
              compare_time: parseTimeToValueAndUnit(item.compare_time).value,
              compare_time_unit: parseTimeToValueAndUnit(item.compare_time).unit,
            };
          }),
        };
      });
      cloned.query = query;
    } else if (query?.queries && query?.triggers) {
      /**
       * 新版本结构跟 SLS 一致 Query {
       *   queries: any[],
       *   triggers: any[],
       * }
       */
      cloned.queries = _.map(query.queries, (item) => {
        return {
          ...item,
          interval: parseTimeToValueAndUnit(item.interval).value,
          interval_unit: parseTimeToValueAndUnit(item.interval).unit,
        };
      });
      cloned.triggers = query.triggers;
    }
  } else if (cate === 'aliyun-sls') {
    const queryString = cloned.prom_ql;
    let query: any = {};
    try {
      query = JSON.parse(queryString);
    } catch (e) {
      console.error(e);
    }
    cloned.queries = _.map(query.queries, (query) => {
      if (query?.keys?.valueKey) {
        query.keys.valueKey = _.split(query.keys.valueKey, ' ');
      } else {
        query.keys.valueKey = [];
      }
      if (query?.keys?.labelKey) {
        query.keys.labelKey = _.split(query.keys.labelKey, ' ');
      } else {
        query.keys.labelKey = [];
      }
      return {
        ..._.omit(query, ['from', 'to']),
        range: mapRelativeTimeRangeToOption({
          start: query.from,
          end: query.to,
        }),
      };
    });
    cloned.triggers = query.triggers;
  }
  cloned.cate = cate;
  return cloned;
};

/**
 * 同上，提交前需要把结构化的 query 转换成 prom_ql
 * 以及上面被转换的时间字段，也需要转换回秒
 */
export const stringifyValues = (values) => {
  const cloned = _.cloneDeep(values);
  const cate = cloned.cate || 'prometheus';
  if (cate === 'elasticsearch') {
    const query = cloned.query;
    if (query?.interval !== undefined) {
      // 第一版的结构，未来会废弃
      query.interval = normalizeTime(query.interval, query.interval_unit);
      delete query.interval_unit;
      query.rules = _.map(query.rules, (rule: any) => {
        return {
          ...rule,
          rule: _.map(rule.rule, (item: any) => {
            const compare_time = normalizeTime(item.compare_time, item.compare_time_unit);
            delete item.compare_time_unit;
            return {
              ...item,
              compare_time,
            };
          }),
        };
      });
      cloned.prom_ql = JSON.stringify(query);
      delete cloned.query;
    } else if (cloned?.queries && cloned?.triggers) {
      const prom_ql: any = {};
      prom_ql.queries = _.map(cloned.queries, (item) => {
        return {
          ..._.omit(item, 'interval_unit'),
          interval: normalizeTime(item.interval, item.interval_unit),
        };
      });
      prom_ql.triggers = _.map(cloned.triggers, (trigger) => {
        if (trigger.mode === 0) {
          return {
            ...trigger,
            exp: stringifyExpressions(trigger.expressions),
          };
        }
        return trigger;
      });
      cloned.prom_ql = JSON.stringify(prom_ql);
      delete cloned.queries;
      delete cloned.triggers;
    }
  } else if (cate === 'aliyun-sls') {
    const { queries, triggers } = cloned;
    const prom_ql: any = {};
    prom_ql.queries = _.map(queries, (query, index) => {
      const parsedRange = mapOptionToRelativeTimeRange(query.range);
      if (query?.keys?.valueKey) {
        query.keys.valueKey = _.join(query.keys.valueKey, ' ');
      }
      if (query?.keys?.labelKey) {
        query.keys.labelKey = _.join(query.keys.labelKey, ' ');
      }
      return {
        ..._.omit(query, 'range'),
        ref: alphabet[index],
        from: parsedRange?.start,
        to: parsedRange?.end,
      };
    });
    prom_ql.triggers = _.map(triggers, (trigger) => {
      if (trigger.mode === 0) {
        return {
          ...trigger,
          exp: stringifyExpressions(trigger.expressions),
        };
      }
      return trigger;
    });
    cloned.prom_ql = JSON.stringify(prom_ql);
    delete cloned.queries;
    delete cloned.triggers;
  }

  return cloned;
};

export const stringifyExpressions = (
  expressions: {
    ref: string;
    label: string;
    comparisonOperator: string;
    value: string;
    logicalOperator?: string;
  }[],
) => {
  const logicalOperator = _.get(expressions, '[0].logicalOperator');
  let exp = '';
  _.forEach(expressions, (expression, index) => {
    if (index !== 0) {
      exp += ` ${logicalOperator} `;
    }
    exp += `$${expression.ref}${expression.label ? `.${expression.label}` : ''} ${expression.comparisonOperator} ${expression.value}`;
  });
  return exp;
};
