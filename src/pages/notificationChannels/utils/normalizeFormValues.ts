import _ from 'lodash';

import { ChannelItem } from '../types';

export default function normalizeFormValues(values: ChannelItem) {
  return {
    ...values,
    http_request_config: {
      ...values.http_request_config,
      // 将 headers: {key: string, value: string}[] 转换成 {[key: string]: string}
      // @ts-ignore
      headers: _.fromPairs(_.map(values.http_request_config.headers, (item) => [item.key, item.value])),
      request: {
        ...(values.http_request_config.request || {}),
        // 将 parameters: {key: string, value: string}[] 转换成 {[key: string]: string}
        // @ts-ignore
        parameters: _.fromPairs(_.map(values.http_request_config.request?.parameters, (item) => [item.key, item.value])),
      },
    },
  };
}
