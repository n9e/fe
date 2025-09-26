import _ from 'lodash';

import { IVariable } from '../types';

export default function getVariableDependencies(variable: IVariable, variables: IVariable[]) {
  const dependencies: { name: string; value: number | string | string[] }[] = [];

  // 获取需要检查依赖的字符串内容
  const checkStrings: string[] = [];

  if (_.isString(variable.definition)) {
    checkStrings.push(variable.definition);
  }
  if (_.isString(variable.datasource?.value)) {
    checkStrings.push(String(variable.datasource.value));
  }
  if (_.isString(variable.query?.query)) {
    checkStrings.push(variable.query.query);
  }

  // 如果没有需要检查的字符串，直接返回空数组
  if (checkStrings.length === 0) {
    return dependencies;
  }

  // 遍历当前变量前面的所有变量，检查是否被依赖
  for (let i = 0; i < variables.length; i++) {
    const prevVariable = variables[i];
    const regex = new RegExp(`\\$${prevVariable.name}\\b|\\$\\{${prevVariable.name}\\}|\\[\\[${prevVariable.name}\\]\\]`, 'g');

    // 检查是否在任何一个字符串中找到了对前置变量的引用
    const isDependency = checkStrings.some((str) => regex.test(str));

    if (isDependency) {
      dependencies.push({
        name: prevVariable.name,
        value: prevVariable.value ?? '',
      });
    }
  }

  return dependencies;
}
