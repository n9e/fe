import _ from 'lodash';

import type { QueryOption, QueryOptionInput } from '../types';
import filterOptionsByReg from './filterOptionsByReg';
import stringToRegex from './stringToRegex';

type ScalarOption = Extract<QueryOptionInput, string | number | boolean>;
type ObjectOption = Exclude<QueryOptionInput, ScalarOption>;

function isScalar(value: unknown): value is ScalarOption {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function isObjectOption(value: unknown): value is ObjectOption {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  return 'label' in value && typeof value.label === 'string' && 'value' in value && (typeof value.value === 'string' || typeof value.value === 'number');
}

function processObjectOption(option: ObjectOption, regex: RegExp | null): QueryOption | undefined {
  const original = { label: option.label, value: String(option.value) };
  if (!regex) return original;

  regex.lastIndex = 0;
  let match = regex.exec(original.value);
  if (!match) return undefined;
  let label: string | undefined;
  let value: string | undefined;
  do {
    label ??= match.groups?.text;
    value ??= match.groups?.value;
    if (!regex.global) break;
    // 空匹配也可能包含有效的命名组，推进位置以避免死循环。
    if (match[0] === '') regex.lastIndex += 1;
    match = regex.exec(original.value);
  } while (match);

  return { label: label ?? original.label, value: value ?? original.value };
}

/** 新旧入口共用对象协议，但分别保留各自的字符串正则语义和排序策略。 */
export function transformQueryOptions(result: unknown, reg: string | undefined, processScalars: (options: string[]) => QueryOption[]): QueryOption[] {
  if (!Array.isArray(result)) return [];
  const inputs = result.filter((item): item is QueryOptionInput => isScalar(item) || isObjectOption(item));
  if (inputs.every(isScalar)) return processScalars(inputs.map((item) => _.toString(item)));

  const regex = stringToRegex(reg);
  const options: QueryOption[] = [];
  const seen = new Set<string>();
  for (const input of inputs) {
    const candidates = isScalar(input) ? processScalars([_.toString(input)]) : [processObjectOption(input, regex)];
    for (const option of candidates) {
      if (option && !seen.has(option.value)) {
        seen.add(option.value);
        options.push(option);
      }
    }
  }
  return options;
}

/** 只处理查询结果；正则中的变量由调用方提前替换。 */
export default function processQueryOptions(result: unknown, reg?: string): QueryOption[] {
  return _.sortBy(
    transformQueryOptions(result, reg, (options) => filterOptionsByReg(options, reg)),
    'value',
  );
}
