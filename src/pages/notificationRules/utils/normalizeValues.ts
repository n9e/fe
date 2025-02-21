import _ from 'lodash';

import { RuleItem } from '../types';

export function normalizeFormValues(values: RuleItem): any {
  return {
    ...values,
    notify_configs: _.map(values.notify_configs, (item) => {
      return {
        ...item,
        // 将 params: {key: string, value: string}[] 转换成 {[key: string]: string}
        params: _.fromPairs(_.map(item.params, (item) => [item.key, item.value])),
      };
    }),
  };
}

export function normalizeInitialValues(values: any): RuleItem {
  return {
    ...values,
    notify_configs: _.map(values.notify_configs, (item) => {
      return {
        ...item,
        // 将 params: {[key: string]: string} 转换成 {key: string, value: string}[]
        params: _.map(item.params, (value, key) => {
          return {
            key,
            value,
          };
        }),
      };
    }),
  };
}
