import _ from 'lodash';
import moment from 'moment';
import { DatasourceCateEnum } from '@/utils/constant';
import { defaultRuleConfig, defaultValues } from './constants';
import { DATASOURCE_ALL } from '../constants';
// @ts-ignore
import * as alertUtils from 'plus:/parcels/AlertRule/utils';

export function getFirstDatasourceId(datasourceIds = [], datasourceList: { id: number }[] = []) {
  return _.isEqual(datasourceIds, [DATASOURCE_ALL]) && datasourceList.length > 0 ? datasourceList?.[0]?.id : datasourceIds?.[0];
}

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

export function processFormValues(values) {
  let cate = values.cate;
  if (values.prod === 'host') {
    cate = 'host';
  } else if (values.prod === 'anomaly') {
    cate = 'prometheus';
  }
  if (_.isFunction(alertUtils.processFormValues)) {
    values = alertUtils.processFormValues(values);
  } else {
    if (values?.rule_config?.queries) {
      values.rule_config.queries = _.map(values.rule_config.queries, (item) => {
        if (_.isArray(item?.keys?.labelKey)) {
          item.keys.labelKey = _.join(item.keys.labelKey, ' ');
        }
        if (_.isArray(item?.keys?.valueKey)) {
          item.keys.valueKey = _.join(item.keys.valueKey, ' ');
        }
        if (_.isArray(item?.keys?.metricKey)) {
          item.keys.metricKey = _.join(item.keys.metricKey, ' ');
        }
        return {
          ..._.omit(item, 'interval_unit'),
          interval: normalizeTime(item.interval, item.interval_unit),
        };
      });
    }
    if (values?.rule_config?.triggers) {
      values.rule_config.triggers = _.map(values.rule_config.triggers, (trigger) => {
        if (trigger.mode === 0) {
          return {
            ...trigger,
            exp: stringifyExpressions(trigger.expressions),
          };
        }
        return trigger;
      });
    }
  }
  const data = {
    ..._.omit(values, 'effective_time'),
    cate,
    enable_days_of_weeks: values.effective_time.map((item) => item.enable_days_of_week),
    enable_stimes: values.effective_time.map((item) => item.enable_stime.format('HH:mm')),
    enable_etimes: values.effective_time.map((item) => item.enable_etime.format('HH:mm')),
    disabled: !values.enable_status ? 1 : 0,
    notify_recovered: values.notify_recovered ? 1 : 0,
    enable_in_bg: values.enable_in_bg ? 1 : 0,
    callbacks: _.map(values.callbacks, (item) => item.url),
    datasource_ids: _.isArray(values.datasource_ids) ? values.datasource_ids : values.datasource_ids ? [values.datasource_ids] : [],
    annotations: _.chain(values.annotations).keyBy('key').mapValues('value').value(),
  };
  return data;
}

export function processInitialValues(values) {
  if (_.isFunction(alertUtils.processInitialValues)) {
    values = alertUtils.processInitialValues(values);
  } else {
    if (values?.rule_config?.queries) {
      values.rule_config.queries = _.map(values.rule_config.queries, (item) => {
        _.set(item, 'keys.labelKey', item?.keys?.labelKey ? _.split(item.keys.labelKey, ' ') : []);
        _.set(item, 'keys.valueKey', item?.keys?.valueKey ? _.split(item.keys.valueKey, ' ') : []);
        _.set(item, 'keys.valueKey', item?.keys?.metricKey ? _.split(item.keys.metricKey, ' ') : []);
        return {
          ...item,
          interval: parseTimeToValueAndUnit(item.interval).value,
          interval_unit: parseTimeToValueAndUnit(item.interval).unit,
        };
      });
    }
  }
  return {
    ...values,
    enable_in_bg: values?.enable_in_bg === 1,
    enable_status: values?.disabled === undefined ? true : !values?.disabled,
    notify_recovered: values?.notify_recovered === 1 || values?.notify_recovered === undefined ? true : false, // 1:启用 0:禁用
    callbacks: !_.isEmpty(values?.callbacks)
      ? values.callbacks.map((item) => ({
          url: item,
        }))
      : undefined,
    effective_time: values?.enable_etimes // TODO: 兼容旧数据
      ? values?.enable_etimes.map((item, index) => ({
          enable_stime: moment(values.enable_stimes[index], 'HH:mm'),
          enable_etime: moment(values.enable_etimes[index], 'HH:mm'),
          enable_days_of_week: values.enable_days_of_weeks[index],
        }))
      : defaultValues.effective_time,
    annotations: _.map(values?.annotations, (value, key) => ({
      key,
      value,
    })),
  };
}

export function getDefaultValuesByProd(prod, defaultBrainParams, isPlus = false) {
  if (prod === 'host') {
    return {
      prod,
      cate: 'host',
      datasource_ids: undefined,
      rule_config: defaultRuleConfig.host,
    };
  }
  if (prod === 'anomaly') {
    return {
      prod,
      cate: 'prometheus',
      datasource_ids: [DATASOURCE_ALL],
      rule_config: {
        ...defaultRuleConfig.anomaly,
        algo_params: defaultBrainParams?.holtwinters || {},
      },
    };
  }
  if (prod === 'metric') {
    return {
      prod,
      cate: 'prometheus',
      datasource_ids: [DATASOURCE_ALL],
      rule_config: defaultRuleConfig.metric,
    };
  }
  if (prod === 'logging') {
    if (isPlus) {
      return {
        prod,
        cate: 'elasticsearch',
        datasource_ids: undefined,
        rule_config: defaultRuleConfig.logging,
      };
    }
    return {
      prod,
      cate: 'loki',
      datasource_ids: [DATASOURCE_ALL],
      rule_config: defaultRuleConfig.loki,
    };
  }
  if (prod === 'loki') {
    return {
      prod,
      cate: 'loki',
      datasource_ids: [DATASOURCE_ALL],
      rule_config: defaultRuleConfig.loki,
    };
  }
}

export function getDefaultValuesByCate(prod, cate) {
  if (cate === DatasourceCateEnum.prometheus) {
    return {
      prod,
      cate,
      datasource_ids: [DATASOURCE_ALL],
      rule_config: defaultRuleConfig.metric,
    };
  }
  if (cate === DatasourceCateEnum.tdengine) {
    return {
      prod,
      cate,
      datasource_ids: undefined,
      rule_config: {
        queries: [
          {
            ref: 'A',
            interval: 1,
            interval_unit: 'min',
          },
        ],
        triggers: [
          {
            mode: 0,
            expressions: [
              {
                ref: 'A',
                comparisonOperator: '>',
                value: 0,
                logicalOperator: '&&',
              },
            ],
            severity: 2,
          },
        ],
      },
    };
  }
  if (cate === DatasourceCateEnum.loki) {
    return {
      prod,
      cate,
      datasource_ids: [DATASOURCE_ALL],
      rule_config: defaultRuleConfig.loki,
    };
  }
  if (_.isFunction(alertUtils.getDefaultValuesByCate)) {
    return alertUtils.getDefaultValuesByCate(prod, cate);
  }
}
