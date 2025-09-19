import _ from 'lodash';

import { IVariable } from '../types';
import includes from './includes';

export default function getValueByOptions({
  variableValueFixed,
  variable,
  itemOptions,
}: {
  variableValueFixed: boolean;
  variable: IVariable;
  itemOptions?: {
    label: string;
    value: string;
  }[];
}) {
  let value = variable.value;

  // 设置变量为空时的默认值
  // 同初始化 (initializeVariablesValue) 的区别是，这里从可选项或是变量设置的 defaultValue 等中选取
  // 如果 __variable_value_fixed 存在，则表示变量值是固定的，不需要再设置默认值
  if (variableValueFixed === undefined) {
    // 变量值为空，或者不在可选项中 时，设置默认值
    if (value === undefined || (value && !includes(itemOptions, value))) {
      // 如果变量设置存在默认值，则使用默认值
      if (variable.defaultValue) {
        value = variable.defaultValue;
      } else {
        // 否则单选取第一个值，多选取第一个值或者 all
        const head = _.head(itemOptions)?.value;
        const defaultVal = variable.multi ? (variable.allOption ? ['all'] : head ? [head] : undefined) : head;
        value = defaultVal;
      }
    }
  }
  return value;
}
