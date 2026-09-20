import type { VariableQueryParam } from './initializeVariablesValue';

/** 解析 URL 中以逗号分隔的禁用变量名。 */
export default function getDisabledVariableNames(value: VariableQueryParam): Set<string> {
  const values = Array.isArray(value) ? value : [value];
  const names = values.flatMap((item) => (typeof item === 'string' ? item.split(',') : []));

  return new Set(names.map((name) => name.trim()).filter(Boolean));
}
