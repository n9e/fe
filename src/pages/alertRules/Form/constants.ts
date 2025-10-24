import moment from 'moment';
import _ from 'lodash';

import { DatasourceCateEnum } from '@/utils/constant';
import { allCates } from '@/components/AdvancedWrap/utils';

export const defaultRuleConfig = {
  queries: [{}],
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
      recover_config: {
        judge_type: 0,
      },
    },
  ],
  exp_trigger_disable: false,
  nodata_trigger: {
    enable: false,
    severity: 2,
    resolve_after_enable: false,
    resolve_after: undefined,
  },
};

export const getDefaultRuleConfig = (cate: DatasourceCateEnum) => {
  const isLogging = _.includes(_.find(allCates, { value: cate })?.type, 'logging');
  return {
    ...defaultRuleConfig,
    triggers: _.map(defaultRuleConfig.triggers, (triggerItem) => {
      return {
        ...triggerItem,
        recover_config: {
          judge_type: isLogging ? 1 : 0, // 日志类数据源默认值改为 1，其他类型数据源默认值为 0
        },
      };
    }),
  };
};

export const datasourceDefaultValue = {
  datasource_queries: [
    {
      match_type: 0,
      op: 'in',
      values: [],
    },
  ],
  datasource_value: undefined,
};

export const defaultValues = {
  disabled: 0,
  effective_time: [
    {
      enable_days_of_week: ['0', '1', '2', '3', '4', '5', '6'],
      enable_stime: moment('00:00', 'HH:mm'),
      enable_etime: moment('00:00', 'HH:mm'), // 起止时间一致时，表示全天有效
    },
  ],
  notify_version: 1, // v8-beta.6 新版通知规则，旧版为 0
  notify_recovered: true,
  recover_duration: 0,
  notify_repeat_step: 60,
  notify_max_number: 0,
  rule_config: {
    ...defaultRuleConfig,
    queries: [
      {
        prom_ql: '',
        severity: 2,
      },
    ],
  },
  prom_eval_interval: 30,
  prom_for_duration: 60,
  prod: 'metric',
  cate: 'prometheus',
  enable_status: true,
};

export const ruleTypeOptions = [
  {
    label: 'Metric',
    value: 'metric',
    pro: false,
  },
  {
    label: 'Host',
    value: 'host',
    pro: false,
  },
  {
    label: 'Log',
    value: 'logging',
    pro: false,
  },
];
