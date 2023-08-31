import _ from 'lodash';
import moment from 'moment';
import { DatasourceCateEnum } from '@/utils/constant';
import { defaultRuleConfig, defaultValues } from './constants';
import { DATASOURCE_ALL } from '../constants';
// @ts-ignore
import * as alertUtils from 'plus:/parcels/AlertRule/utils';

export function getFirstDatasourceId(datasourceIds = [], datasourceList: { id: number }[] = []) {
  return _.isEqual(datasourceIds, [DATASOURCE_ALL]) && datasourceList.length > 0 ? datasourceList[0]?.id : datasourceIds[0];
}

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
    if (values?.keys?.labelKey && _.isArray(values.keys.labelKey)) {
      values.keys.labelKey = _.join(values.keys.labelKey, ' ');
    }
    if (values?.keys?.valueKey && _.isArray(values.keys.valueKey)) {
      values.keys.valueKey = _.join(values.keys.valueKey, ' ');
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
  } else if (values.cate === DatasourceCateEnum.tdengine) {
    _.set(values, 'keys.labelKey', values?.keys?.labelKey ? _.split(values.keys.labelKey, ' ') : []);
    _.set(values, 'keys.valueKey', values?.keys?.valueKey ? _.split(values.keys.valueKey, ' ') : []);
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

export function getDefaultValuesByProd(prod, defaultBrainParams) {
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
    return {
      prod,
      cate: 'elasticsearch',
      datasource_ids: undefined,
      rule_config: defaultRuleConfig.logging,
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
  if (_.isFunction(alertUtils.getDefaultValuesByCate)) {
    return alertUtils.getDefaultValuesByCate(prod, cate);
  }
}
