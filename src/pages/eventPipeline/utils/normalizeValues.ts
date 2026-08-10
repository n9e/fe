import _ from 'lodash';

import { Item } from '../types';

/**
 * 表单里 header / custom_params / url_shot_opts.headers 是 [{key, value}] 数组，
 * 提交给后端（header 为 map[string]string 等）需要对象形式。
 * 若值已经是对象（例如克隆数据没有经过 normalizeInitialValues），原样返回，保证幂等。
 */
const pairsToObject = (value: unknown): unknown => {
  if (!Array.isArray(value)) return value;
  return _.fromPairs(_.map(value, (item) => [item?.key, item?.value]));
};

/**
 * 后端返回的 header / custom_params / url_shot_opts.headers 是对象形式，表单 Form.List 需要数组。
 * 若值已经是数组（例如后端存了旧格式或表单回填过），原样返回，保证幂等。
 */
const objectToPairs = (value: unknown): unknown => {
  if (Array.isArray(value)) return value;
  if (value == null || typeof value !== 'object') return value;
  return _.map(value as { [key: string]: string }, (v, k) => ({ key: k, value: v }));
};

/**
 * 后端 GET / 列表接口会按当前 processors 派生出 nodes、connections 再返回（FillWorkflowFields），
 * 前端没有编辑这两个字段的入口。而 PUT 是全字段覆盖，且执行引擎优先使用 nodes：
 * 一旦把拉取时的旧快照原样回传落库，改完处理器后线上仍会按旧配置执行，且此后不再重新派生。
 * 所以回传前必须剔除，交由后端重新派生。
 *
 * 无条件剔除成立的前提（2026-07 核对 ccfos/nightingale@597381ec9）：nodes 全仓只有两处写入——
 * Verify() 初始化为 []、FillWorkflowFields() 从 processors 派生，没有任何路径持久化人工编排的 DAG。
 * 注意这个前提无法由前端自行校验：「陈旧的派生快照」（本函数要清掉的）与「人工编排的图」（必须保留的）
 * 在结构上无法区分——两者都表现为 nodes 与当前 processors 不一致。若将来支持 DAG 编排，
 * 必须由后端在响应里标记该字段是否为兼容派生值，或在 PUT 时自行重新派生，前端不能再这样一刀切。
 */
export function omitDerivedFields<T extends object>(values: T): T {
  // 这两个字段不在 Item 的类型声明里（只存在于接口响应中），剔除后结构上仍是合法的 T
  return _.omit(values, ['nodes', 'connections']) as T;
}

/**
 * 提交给后端前：把每个处理器 config 里的数组形态（header / custom_params / url_shot_opts.headers）
 * 转成后端要求的对象形态（header 为 map[string]string 等）。
 * 供事件流页面（Add/Edit）与告警规则表单内联工作流（FormNG 的 WorkflowItem）共用。
 * 注意：调用方传入的多是表单实时值（Form.useWatch），不能原地修改，先 cloneDeep 保护引用。
 */
export function normalizeProcessorsForSubmit(processors: any[]): any[] {
  return _.map(_.cloneDeep(processors), (processor: any) => {
    const config = processor?.config || {};
    if (_.includes(['callback', 'event_update', 'ai_summary'], processor?.typ) && config.header != null) {
      config.header = pairsToObject(config.header);
    }
    if (_.includes(['ai_summary'], processor?.typ) && config.custom_params != null) {
      config.custom_params = pairsToObject(config.custom_params);
    }
    if (_.includes(['alert_shot'], processor?.typ) && config.url_shot_opts?.headers != null) {
      config.url_shot_opts.headers = pairsToObject(config.url_shot_opts.headers);
    }
    return {
      ...processor,
      config,
    };
  });
}

/**
 * 回填表单前：把后端返回的对象形态（header 等）转成表单 Form.List 需要的数组形态。
 * 幂等：输入已经是数组时原样保留。同样先 cloneDeep，避免污染拉取到的原始数据。
 */
export function normalizeProcessorsForForm(processors: any[]): any[] {
  return _.map(_.cloneDeep(processors), (processor: any) => {
    const config = processor?.config || {};
    if (_.includes(['callback', 'event_update', 'ai_summary'], processor?.typ) && config.header != null) {
      config.header = objectToPairs(config.header);
    }
    if (_.includes(['ai_summary'], processor?.typ) && config.custom_params != null) {
      config.custom_params = objectToPairs(config.custom_params);
    }
    if (_.includes(['alert_shot'], processor?.typ) && config.url_shot_opts?.headers != null) {
      config.url_shot_opts.headers = objectToPairs(config.url_shot_opts.headers);
    }
    return {
      ...processor,
      config,
    };
  });
}

export function normalizeFormValues(values: Item): any {
  // 整份深拷贝：这里未来可能叠加其他数据处理，入口处先隔离外部引用，
  // 处理器级转换内部的 cloneDeep 是第二层保险（性能可忽略）
  values = _.cloneDeep(values);
  return {
    ...values,
    processors: normalizeProcessorsForSubmit(values.processors as any[]),
  };
}

export function normalizeInitialValues(values: any): Item {
  values = _.cloneDeep(values);
  return {
    ...values,
    processors: normalizeProcessorsForForm(values.processors),
  };
}
