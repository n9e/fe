import _ from 'lodash';

// 转义 JSON 字符串中的特殊字符
export function escapeJsonString(str: string): string {
  return _.replace(str, /\\/g, '\\\\').replace(/"/g, '\\"');
}

// 转义 PromQL 字符串中的特殊字符 {}[]().-
// 2024-07-25 暂时修改成只对 () 进行转义
export function escapePromQLString(str: string): string {
  return _.replace(str, /[()]/g, '\\\\$&');
}

export function escapeRegExp(string: string): string {
  // 转义字符串中的特殊字符
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
