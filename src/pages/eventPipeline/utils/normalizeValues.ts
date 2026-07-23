import _ from 'lodash';

import { Item } from '../types';
interface HeaderItem {
  key: string;
  value: string;
}

/**
 * 后端 GET / 列表接口会按当前 processors 派生出 nodes、connections 再返回（FillWorkflowFields），
 * 前端没有编辑这两个字段的入口。而 PUT 是全字段覆盖，且执行引擎优先使用 nodes：
 * 一旦把拉取时的旧快照原样回传落库，改完处理器后线上仍会按旧配置执行，且此后不再重新派生。
 * 所以回传前必须剔除，交由后端重新派生。
 */
export function omitDerivedFields<T extends object>(values: T): T {
  // 这两个字段不在 Item 的类型声明里（只存在于接口响应中），剔除后结构上仍是合法的 T
  return _.omit(values, ['nodes', 'connections']) as T;
}

export function normalizeFormValues(values: Item): any {
  values = _.cloneDeep(values);
  return {
    ...values,
    processors: _.map(values.processors, (processor: any) => {
      const config = processor?.config || {};
      if (_.includes(['callback', 'event_update', 'ai_summary'], processor?.typ) && config.header) {
        config.header = _.fromPairs(_.map(config.header as HeaderItem[], (item) => [item.key, item.value]));
      }
      if (_.includes(['ai_summary'], processor?.typ) && config.custom_params) {
        config.custom_params = _.fromPairs(_.map(config.custom_params as HeaderItem[], (item) => [item.key, item.value]));
      }
      if (_.includes(['alert_shot'], processor?.typ) && config.url_shot_opts?.headers) {
        config.url_shot_opts.headers = _.fromPairs(_.map(config.url_shot_opts.headers as HeaderItem[], (item) => [item.key, item.value]));
      }
      return {
        ...processor,
        config,
      };
    }),
  };
}

export function normalizeInitialValues(values: any): Item {
  values = _.cloneDeep(values);
  return {
    ...values,
    processors: _.map(values.processors, (processor: any) => {
      const config = processor?.config || {};
      if (_.includes(['callback', 'event_update', 'ai_summary'], processor?.typ) && config.header) {
        config.header = _.map(config.header as { [key: string]: string }, (value, key) => ({
          key,
          value,
        }));
      }
      if (_.includes(['ai_summary'], processor?.typ) && config.custom_params) {
        config.custom_params = _.map(config.custom_params as { [key: string]: string }, (value, key) => ({
          key,
          value,
        }));
      }
      if (_.includes(['alert_shot'], processor?.typ) && config.url_shot_opts?.headers) {
        config.url_shot_opts.headers = _.map(config.url_shot_opts.headers as { [key: string]: string }, (value, key) => ({
          key,
          value,
        }));
      }
      return {
        ...processor,
        config,
      };
    }),
  };
}
