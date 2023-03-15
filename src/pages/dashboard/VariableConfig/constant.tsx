/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { createContext } from 'react';
import moment from 'moment';
import _ from 'lodash';
import queryString from 'query-string';
import { resourceGroupItem } from '@/store/businessInterface';
import { favoriteFrom } from '@/store/common';
import { getLabelNames, getMetricSeries, getLabelValues, getMetric, getQueryResult, getESVariableResult } from '@/services/dashboardV2';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { IVariable } from './definition';
import { normalizeESQueryRequestBody } from './utils';

export const CLASS_PATH_VALUE = 'classpath';
export const CLASS_PATH_PREFIX_VALUE = 'classpath_prefix';
export const DEFAULT_VALUE = '*';
export const DEFAULT_NAME = 'var';
export const TagFilterStore = createContext<any>({});
export const INIT_DATA = 'init_data';
export const ADD_ITEM = 'add_item';
export const UPDATE_ITEM = 'update_item';
export const DELETE_ITEM = 'delete_item';
export const DEFAULT_CLASSPATH_DATA: resourceGroupItem = {
  path: '*',
  id: -1,
  isFavorite: false,
  create_at: 0,
  create_by: 0,
  update_at: 0,
  update_by: 0,
  isBelongIn: favoriteFrom.Common,
  note: '',
  preset: 0,
};

const filterErrorList = (list: Array<any>) => {
  let duplicateList: number[] = [];
  let nonNameList: number[] = [];
  let invalidList: number[] = [];
  let requireList: number[] = [];
  let duplicateKeyList: number[] = [];
  let hasClassPath = false;
  const newMap = new Map<string, number[]>();
  const keyMap = new Map<string, number[]>();
  list.forEach((filterItem, index) => {
    const { tagName, key, value } = filterItem;
    const mapData = newMap.get(tagName);
    if (typeof mapData === 'undefined') {
      newMap.set(tagName, [index]);
    } else {
      newMap.set(tagName, [...mapData, index]);
    }
    const mapData1 = keyMap.get(key);
    if (typeof mapData1 === 'undefined') {
      keyMap.set(key, [index]);
    } else {
      keyMap.set(key, [...mapData1, index]);
    }

    if (tagName === '') {
      nonNameList.push(index);
    }
    if (key === CLASS_PATH_VALUE || key === CLASS_PATH_PREFIX_VALUE) {
      hasClassPath = true;
    }
    if (!/^\w+$/g.test(tagName)) {
      invalidList.push(index);
    }
    if (key === '' || value === '') {
      requireList.push(index);
    }
  });
  for (let i of newMap.values()) {
    if (Array.isArray(i) && i.length > 1) {
      duplicateList = duplicateList.concat(i);
    }
  }
  for (let i of keyMap.values()) {
    if (Array.isArray(i) && i.length > 1) {
      duplicateKeyList = duplicateKeyList.concat(i);
    }
  }
  return {
    duplicateList,
    duplicateKeyList,
    nonNameList,
    invalidList,
    hasClassPath,
    requireList,
  };
};

export const TagFilterReducer = function (state, action) {
  switch (action.type) {
    case INIT_DATA: {
      return {
        ...state,
        ...action.data,
        hasInit: true,
      };
    }
    case ADD_ITEM: {
      const newList = [
        ...state.tagList,
        {
          tagName: DEFAULT_NAME,
          key: '',
          value: DEFAULT_VALUE,
          prefix: false,
        },
      ];
      return {
        ...state,
        tagList: newList,
        ...filterErrorList(newList),
      };
    }
    case UPDATE_ITEM: {
      const newList = state.tagList;
      newList[action.index] = action.data;
      return {
        ...state,
        tagList: newList,
        ...filterErrorList(newList),
      };
    }
    case DELETE_ITEM: {
      state.tagList.splice(action.index, 1);
      return {
        ...state,
        tagList: state.tagList,
        ...filterErrorList(state.tagList),
      };
    }
    default: {
      return state;
    }
  }
};

// https://grafana.com/docs/grafana/latest/datasources/prometheus/#query-variable 根据文档解析表达式
// 每一个promtheus接口都接受start和end参数来限制返回值
export const convertExpressionToQuery = (expression: string, range: IRawTimeRange, item: IVariable, datasourceValue: number) => {
  const { type, datasource, config } = item;
  const parsedRange = parseRange(range);
  const start = moment(parsedRange.start).unix();
  const end = moment(parsedRange.end).unix();
  datasourceValue = datasource?.value || datasourceValue;
  if (datasource?.cate === 'elasticsearch') {
    try {
      const query = JSON.parse(expression);
      return getESVariableResult(datasourceValue, config?.index!, normalizeESQueryRequestBody(query));
    } catch (e) {
      return Promise.resolve([]);
    }
  } else {
    // 非 ES 源或是老配置都默认为 prometheus 源
    if (expression === 'label_names()') {
      return getLabelNames({ start, end }, datasourceValue).then((res) => res.data);
    } else if (expression.startsWith('label_values(')) {
      if (expression.includes(',')) {
        let metricsAndLabel = expression.substring('label_values('.length, expression.length - 1).split(',');
        const label = metricsAndLabel.pop();
        const metric = metricsAndLabel.join(', ');
        return getMetricSeries({ 'match[]': metric.trim(), start, end }, datasourceValue).then((res) => Array.from(new Set(_.map(res.data, (item) => item[label!.trim()]))));
      } else {
        const label = expression.substring('label_values('.length, expression.length - 1);
        return getLabelValues(label, { start, end }, datasourceValue).then((res) => res.data);
      }
    } else if (expression.startsWith('metrics(')) {
      const metric = expression.substring('metrics('.length, expression.length - 1);
      return getMetric({ start, end }, datasourceValue).then((res) => res.data.filter((item) => item.includes(metric)));
    } else if (expression.startsWith('query_result(')) {
      const promql = expression.substring('query_result('.length, expression.length - 1);
      return getQueryResult({ query: promql, start, end }, datasourceValue).then((res) =>
        _.map(res?.data?.result, ({ metric, value }) => {
          const metricName = metric['__name__'];
          const labels = Object.keys(metric)
            .filter((ml) => ml !== '__name__')
            .map((label) => `${label}="${metric[label]}"`);
          const values = value.join(' ');
          return `${metricName || ''} {${labels}} ${values}`;
        }),
      );
    } else if (type === 'query') {
      return getQueryResult({ query: expression, start, end }, datasourceValue).then((res) =>
        _.map(res?.data?.result, ({ metric, value }) => {
          const metricName = metric['__name__'];
          const labels = Object.keys(metric)
            .filter((ml) => ml !== '__name__')
            .map((label) => `${label}="${metric[label]}"`);
          const values = value.join(' ');
          return `${metricName || ''} {${labels}} ${values}`;
        }),
      );
    }
  }
  return Promise.resolve(expression.length > 0 ? expression.split(',').map((i) => i.trim()) : '');
};

const replaceAllPolyfill = (str, substr, newSubstr): string => {
  let result = str;
  while (result.includes(substr)) {
    result = result.replace(substr, newSubstr);
  }
  return result;
};

function getVarsValue(id: string, vars?: IVariable[]) {
  const varsValue = {};
  _.forEach(vars, (item) => {
    varsValue[item.name] = getVaraiableSelected(item.name, id);
  });
  return varsValue;
}

function attachVariable2Url(key, value, id: string, vars?: IVariable[]) {
  const { protocol, host, pathname, search } = window.location;
  const query = queryString.parse(search);
  const varsValue = getVarsValue(id, vars);
  const newQuery = {};
  _.forEach(_.assign({}, varsValue, query, { [key]: value }), (value, key) => {
    newQuery[key] = _.isEmpty(value) ? undefined : value;
  });
  const newurl = `${protocol}//${host}${pathname}?${queryString.stringify(newQuery)}`;
  window.history.replaceState({ path: newurl }, '', newurl);
}

// TODO: 现在通过 localStorage 来维护变量值，并且是通过大盘 id 和变量名作为 key，这个 key 可能会重复，后续需要把变量名改成 uuid
export function setVaraiableSelected({
  name,
  value,
  id,
  urlAttach = false,
  vars,
}: {
  name: string;
  value: string | string[];
  id: string;
  urlAttach?: boolean;
  vars?: IVariable[];
}) {
  if (value === undefined) return;
  localStorage.setItem(`dashboard_${id}_${name}`, typeof value === 'string' ? value : JSON.stringify(value));
  urlAttach && attachVariable2Url(name, value, id, vars);
}

export function getVaraiableSelected(name: string, id: string) {
  const { search } = window.location;
  const searchObj = queryString.parse(search);
  let v: any = searchObj[name];
  // 如果存在 __variable_value_fixed 参数，表示变量值是固定的，不需要从 localStorage 中获取
  if (!searchObj['__variable_value_fixed']) {
    if (!v) {
      v = localStorage.getItem(`dashboard_${id}_${name}`);
      try {
        const parsed = JSON.parse(v);
        if (Array.isArray(parsed)) {
          v = parsed;
        }
      } catch (e) {}
    }
    if (v === null) return null; // null 表示没有初始化过，空字符串表示值被设置成空
    return v || '';
  } else {
    if (v === null) v = undefined;
    return v;
  }
}

export const replaceExpressionVarsSpecifyRule = (
  params: {
    expression: string;
    formData: IVariable[];
    limit: number;
    id: string;
  },
  rule: {
    regex: string;
    getPlaceholder: (expression: string) => string;
  },
) => {
  const { expression, formData, limit, id } = params;
  const { regex, getPlaceholder } = rule;
  let newExpression = expression;
  const vars: any[] | null = newExpression && typeof newExpression.match === 'function' ? newExpression.match(new RegExp(regex, 'g')) : [];
  if (vars && vars.length > 0) {
    for (let i = 0; i < limit; i++) {
      if (formData[i]) {
        const { name, options, reg, allValue } = formData[i];
        const placeholder = getPlaceholder(name);
        const selected = getVaraiableSelected(name, id);

        if (vars.includes(placeholder)) {
          if (Array.isArray(selected)) {
            const realSelected = _.size(selected) === 1 ? selected[0] : `(${(selected as string[]).join('|')})`;
            newExpression = replaceAllPolyfill(newExpression, placeholder, realSelected);
          } else if (typeof selected === 'string') {
            if (selected === 'all') {
              if (allValue) {
                newExpression = replaceAllPolyfill(newExpression, placeholder, allValue);
              } else {
                newExpression = replaceAllPolyfill(
                  newExpression,
                  placeholder,
                  `(${(options as string[]).filter((i) => !reg || !stringToRegex(reg) || (stringToRegex(reg) as RegExp).test(i)).join('|')})`,
                );
              }
            } else {
              newExpression = replaceAllPolyfill(newExpression, placeholder, selected as string);
            }
          } else if (selected === null) {
            // 未选择或填写变量值时替换为空字符串
            newExpression = replaceAllPolyfill(newExpression, placeholder, '');
          } else if (typeof selected === 'number') {
            // number 目前只用于数据源变量的数据源ID
            newExpression = selected as any;
          }
        }
      }
    }
  }
  return newExpression;
};

export const replaceExpressionVars = (expression: string, formData: IVariable[], limit: number, id: string) => {
  let newExpression = expression;
  newExpression = replaceExpressionVarsSpecifyRule(
    { expression: newExpression, formData, limit, id },
    {
      regex: '\\$[0-9a-zA-Z_]+',
      getPlaceholder: (expression: string) => `$${expression}`,
    },
  );
  newExpression = replaceExpressionVarsSpecifyRule(
    { expression: newExpression, formData, limit, id },
    {
      regex: '\\${[0-9a-zA-Z_]+}',
      getPlaceholder: (expression: string) => '${' + expression + '}',
    },
  );
  return newExpression;
};

export const extractExpressionVars = (expression: string) => {
  var newExpression = expression;
  if (newExpression) {
    const vars = newExpression.match(/\$[0-9a-zA-Z\._\-]+/g);
    return vars;
  }
  return [];
};

export function stringStartsAsRegEx(str: string): boolean {
  if (!str) {
    return false;
  }

  return str[0] === '/';
}

export function stringToRegex(str: string): RegExp | false {
  if (!stringStartsAsRegEx(str)) {
    return new RegExp(`^${str}$`);
  }

  const match = str.match(new RegExp('^/(.*?)/(g?i?m?y?)$'));

  if (match) {
    try {
      return new RegExp(match[1], match[2]);
    } catch (e) {
      return false;
    }
  } else {
    return false;
  }
}

export function replaceFieldWithVariable(value: string, dashboardId?: string, variableConfig?: IVariable[]) {
  if (!dashboardId || !variableConfig) {
    return value;
  }
  return replaceExpressionVars(value, variableConfig, variableConfig.length, dashboardId);
}

export function filterOptionsByReg(options, reg, formData: IVariable[], limit: number, id: string) {
  reg = replaceExpressionVars(reg, formData, limit, id);
  const regex = stringToRegex(reg);

  if (reg && regex) {
    const regFilterOptions: string[] = [];
    _.forEach(options, (option) => {
      if (!!option) {
        const matchResult = option.match(regex);
        if (matchResult && matchResult.length > 0) {
          if (matchResult[1]) {
            regFilterOptions.push(matchResult[1]);
          } else {
            regFilterOptions.push(option);
          }
        }
      }
    });
    return _.union(regFilterOptions);
  }
  return options;
}
