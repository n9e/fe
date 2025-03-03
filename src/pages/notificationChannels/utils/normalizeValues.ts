import _ from 'lodash';

import { ChannelItem } from '../types';

export function normalizeFormValues(values: ChannelItem): any {
  const request_config = values.request_config ?? {};
  const http_request_config = request_config.http_request_config ?? {};

  return {
    ...values,
    request_config: {
      ...request_config,
      http_request_config: {
        ...http_request_config,
        // 将 headers: {key: string, value: string}[] 转换成 {[key: string]: string}
        headers: _.fromPairs(_.map(http_request_config?.headers, (item) => [item.key, item.value])),
        request: {
          ...(http_request_config?.request ?? {}),
          // 将 parameters: {key: string, value: string}[] 转换成 {[key: string]: string}
          parameters: _.fromPairs(_.map(http_request_config?.request?.parameters, (item) => [item.key, item.value])),
        },
      },
    },
  };
}

export function normalizeInitialValues(values: any): ChannelItem {
  const request_config = values.request_config ?? {};
  const http_request_config = request_config.http_request_config ?? {};

  return {
    ...values,
    request_config: {
      ...request_config,
      http_request_config: {
        ...http_request_config,
        // 将 headers: {[key: string]: string} 转换成 {key: string, value: string}[]
        headers: _.map(http_request_config.headers, (value, key) => {
          return {
            key,
            value,
          };
        }),
        request: {
          ...(http_request_config.request ?? {}),
          // 将 parameters: {[key: string]: string} 转换成 {key: string, value: string}[]
          parameters: _.map(http_request_config.request?.parameters, (value, key) => {
            return {
              key,
              value,
            };
          }),
        },
      },
    },
  };
}
