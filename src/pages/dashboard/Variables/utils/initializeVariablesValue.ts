import _ from 'lodash';

import { IVariable } from '../types';

/**
 * 初始化变量的值
 * 从 URL 参数、localStorage 中读取变量值
 * 变量值为空时设置为 undefined，这里不设置为 null 是为了兼容 input 和 select 组件
 * @param variables 变量列表
 * @param queryParams 查询参数
 * @param params 其他参数
 */
export default function initializeVariablesValue(
  variables: IVariable[],
  queryParams: Record<string, any>,
  params: {
    dashboardId: number;
  },
) {
  const { dashboardId } = params;

  return _.map(variables, (variablesItem) => {
    if (variablesItem.type === 'constant') return variablesItem;
    const variableName = variablesItem.name;
    let variableValue = queryParams[variableName];
    // 如果没有固定 URL 参数值，则从 localStorage 读取缓存值
    if (queryParams.__variable_value_fixed === undefined) {
      if (variableValue === undefined) {
        const cachedValue = localStorage.getItem(`dashboard_v6_${dashboardId}_${variableName}`);
        variableValue = cachedValue;
        if (cachedValue) {
          try {
            if (cachedValue.startsWith('[')) {
              const parsed = JSON.parse(cachedValue);
              if (Array.isArray(parsed)) {
                variableValue = parsed;
              }
            }
          } catch (e) {
            console.warn('parse error', e);
          }
        }
      }
    }
    // 如果值为空（null, undefined, '', []）则置为 undefined
    if (variableValue === null || variableValue === undefined || variableValue === '' || (_.isArray(variableValue) && _.isEmpty(variableValue))) {
      variableValue = undefined;
    } else if (variablesItem.type === 'datasource' && !_.isNaN(_.toNumber(variableValue))) {
      variableValue = _.toNumber(variableValue);
    } else if (variablesItem.multi) {
      // 多选模式
      if (variableValue === 'all') {
        // 全选值（all）设置为 ['all']
        variableValue = ['all'];
      } else if (_.isString(variableValue)) {
        // 单选值（string）转换为数组
        variableValue = [variableValue];
      }
    } else {
      // 单选模式，值为数组时取第一个
      if (_.isArray(variableValue)) {
        variableValue = variableValue[0] ?? undefined;
      }
    }
    return {
      ...variablesItem,
      value: variableValue,
    };
  });
}
