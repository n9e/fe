import _ from 'lodash';

import { ChannelItem } from '../types';

/**
 * 判断一份配置是否「全空」：所有叶子都是 undefined / null / 空串（0 和 false 是有效值，不算空）
 */
function isBlankConfig(value: any): boolean {
  if (value === undefined || value === null || value === '') return true;
  if (_.isArray(value) || _.isPlainObject(value)) return _.every(value, isBlankConfig);
  return false;
}

/**
 * 表单一次性挂载了所有渠道的字段（各自用 display:none 隐藏，折叠面板也是 forceRender），
 * 于是 getFieldsValue() 会带出一堆字段全空的 xxx_request_config。这些空壳提交上去后端只判
 * 结构体非 nil 就会走进对应分支，例如钉钉群机器人会被空的 dingtalk_request_config 拐进应用
 * 模式、报 app key cannot be empty。这里按「是否全空」剔除，而不是按当前渠道类型保留：
 * 折叠面板里用户填过的值必须原样提交，这正是 forceRender 要解决的问题。
 * http_request_config 是所有 http 类渠道的公共载体，历来就会提交，保持原样不动。
 */
function omitBlankRequestConfigs(request_config: Record<string, any>): Record<string, any> {
  return _.omitBy(request_config, (value, key) => key !== 'http_request_config' && _.endsWith(key, '_request_config') && isBlankConfig(value));
}

export function normalizeFormValues(values: ChannelItem): any {
  values = _.cloneDeep(values);
  const request_config = values.request_config ?? {};
  const http_request_config = request_config.http_request_config ?? {};

  return {
    ...values,
    request_config: {
      ...omitBlankRequestConfigs(request_config),
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
  values = _.cloneDeep(values);
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
