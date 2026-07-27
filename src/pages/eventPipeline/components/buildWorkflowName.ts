import _ from 'lodash';

import { MAX_NAME_LENGTH } from '../constants';

export interface FilterTagItem {
  key?: string;
  func?: string;
  value?: string | string[];
}

export interface WorkflowNameInput {
  /** 适用标签过滤条件 */
  labelFilters?: FilterTagItem[];
  /** 适用属性过滤条件 */
  attrFilters?: FilterTagItem[];
  /** 处理器类型对应的展示名，按链路顺序 */
  processorLabels?: string[];
}

export interface WorkflowNameTexts {
  /** 主体与处理器链之间的连接符 */
  joiner: string;
  /** 处理器之间的连接符 */
  arrow: string;
  /** 没有任何过滤条件时的主体名 */
  all: string;
}

/** 参与命名的处理器最多取几个，避免名称过长 */
const MAX_PROCESSORS = 3;

/**
 * 按 Unicode 码点截断到后端 varchar(128) 的上限。
 * 用 Array.from 而不是 slice：slice 按 UTF-16 码元切，会把 emoji 等代理对拦腰截断成乱码。
 */
export function truncateName(name: string, max = MAX_NAME_LENGTH): string {
  const chars = Array.from(name ?? '');
  return chars.length > max ? chars.slice(0, max).join('') : name ?? '';
}

function firstTagLabel(items?: FilterTagItem[]): string {
  const item = _.find(items, (i) => !!i?.key && !_.isEmpty(_.compact(_.castArray(i?.value))));
  if (!item) return '';
  const value = _.compact(_.castArray(item.value))[0];
  return value ? `${item.key}=${value}` : `${item.key}`;
}

/**
 * 根据过滤条件与处理器链生成工作流名称，形如「service=mon-标签重写→回调」。
 * 过滤与处理器都为空时返回空串，交由调用方保持名称为空。
 * 处理器个数有上限，但标签的 key/value 长度不可控，故返回前统一截断到后端能存下的长度。
 * 纯函数，相同入参多次调用结果一致。
 */
export function buildWorkflowName(input: WorkflowNameInput, texts: WorkflowNameTexts): string {
  const chain = _.take(_.compact(input.processorLabels ?? []), MAX_PROCESSORS).join(texts.arrow);
  const subject = firstTagLabel(input.labelFilters) || firstTagLabel(input.attrFilters);

  if (!subject && !chain) return '';

  const parts = _.compact([subject || texts.all, chain]);
  return truncateName(parts.join(texts.joiner));
}
