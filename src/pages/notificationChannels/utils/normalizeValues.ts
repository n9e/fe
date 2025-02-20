import _ from 'lodash';

import { ChannelItem } from '../types';

export function normalizeFormValues(values: ChannelItem): any {
  return {
    ...values,
    http_request_config: {
      ...values.http_request_config,
      // 将 headers: {key: string, value: string}[] 转换成 {[key: string]: string}
      headers: _.fromPairs(_.map(values.http_request_config.headers, (item) => [item.key, item.value])),
      request: {
        ...(values.http_request_config.request || {}),
        // 将 parameters: {key: string, value: string}[] 转换成 {[key: string]: string}
        parameters: _.fromPairs(_.map(values.http_request_config.request?.parameters, (item) => [item.key, item.value])),
      },
    },
  };
}

export function normalizeInitialValues(values: any): ChannelItem {
  return {
    ...values,
    http_request_config: {
      ...values.http_request_config,
      // 将 headers: {[key: string]: string} 转换成 {key: string, value: string}[]
      headers: _.map(values.http_request_config.headers, (value, key) => {
        return {
          key,
          value,
        };
      }),
      request: {
        ...(values.http_request_config.request || {}),
        // 将 parameters: {[key: string]: string} 转换成 {key: string, value: string}[]
        parameters: _.map(values.http_request_config.request?.parameters, (value, key) => {
          return {
            key,
            value,
          };
        }),
      },
    },
  };
}
