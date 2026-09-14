import _ from 'lodash';

import { DatasourceCateEnum } from '@/utils/constant';

import { IVariable } from '../types';
import { replaceAllSeparatorMap } from '../constant';
import stringToRegex from './stringToRegex';
import { escapePromQLString, escapeJsonString } from './escapeString';
import { getBuiltInVariables } from './replaceTemplateVariables';
import isPlaceholderQuoted from './isPlaceholderQuoted';

function escapeSqlString(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

function adjustValue(
  value: string,
  params: {
    datasourceCate: DatasourceCateEnum;
    isPlaceholderQuoted?: boolean;
    isEscapeJsonString?: boolean;
    isSqlMulti?: boolean;
  },
) {
  const { datasourceCate, isPlaceholderQuoted, isEscapeJsonString, isSqlMulti } = params;
  if (datasourceCate === DatasourceCateEnum.prometheus) {
    value = escapePromQLString(value);
  } else if (datasourceCate === DatasourceCateEnum.elasticsearch) {
    // 如果占位符变量未被引号包裹，插入的值则需要加上引号
    if (!isPlaceholderQuoted) {
      value = `"${value}"`;
    }
    // TODO: 除 ES 外其他类型的变量值是否需要转义？
    if (isEscapeJsonString) {
      value = escapeJsonString(value);
    }
  } else if ((datasourceCate === DatasourceCateEnum.mysql || datasourceCate === DatasourceCateEnum.doris) && isSqlMulti) {
    // Grafana sqlstring 风格：对每个值加单引号并转义内部单引号
    value = escapeSqlString(value);
  }
  return value;
}

function joinValues(
  values: {
    label: string;
    value: string;
  }[],
  params: {
    separator: string;
    datasourceCate: DatasourceCateEnum;
    isPlaceholderQuoted?: boolean;
    isEscapeJsonString?: boolean;
  },
) {
  const { separator, datasourceCate, isPlaceholderQuoted, isEscapeJsonString } = params;
  if (_.isEmpty(values)) return '';
  // mysql 多值：按 Grafana sqlstring 风格输出 'val1','val2'
  if (datasourceCate === DatasourceCateEnum.mysql) {
    return _.join(
      _.map(values, (item) => adjustValue(item.value, { datasourceCate, isPlaceholderQuoted, isEscapeJsonString, isSqlMulti: true })),
      ',',
    );
  }
  // Doris 多值使用 SQL 字符串列表，逗号后保留空格以便阅读。
  if (datasourceCate === DatasourceCateEnum.doris) {
    return _.join(
      _.map(values, (item) => adjustValue(item.value, { datasourceCate, isPlaceholderQuoted, isEscapeJsonString, isSqlMulti: true })),
      ', ',
    );
  }
  // 如果只有一个值时，不需要使用分隔符连接和外包裹（括号）
  if (_.size(values) === 1) {
    return adjustValue(values[0].value, {
      datasourceCate,
      isPlaceholderQuoted,
    });
  }
  if (separator) {
    return `(${_.trim(
      _.join(
        _.map(values, (item) => {
          return adjustValue(item.value, {
            datasourceCate,
            isPlaceholderQuoted,
            isEscapeJsonString,
          });
        }),
        separator,
      ),
      separator,
    )})`;
  } else {
    return _.join(values, ',');
  }
}

function getDorisSqlFormatValues(variable: IVariable): string[] | string | undefined {
  const { value, options = [], reg, allValue } = variable;

  if (_.isEqual(value, ['all']) || _.isEqual(value, ['__all__'])) {
    if (allValue) return allValue;
    return _.map(
      _.filter(options, (option) => !reg || !stringToRegex(reg) || (stringToRegex(reg) as RegExp).test(option.value)),
      'value',
    );
  }

  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => _.find(options, { value: item })?.value || item);
  }

  if (typeof value === 'string') return [value];

  return undefined;
}

function getDorisSqlLikeExpression(variableName: string, values: string[], separator: 'OR' | 'AND'): string {
  return _.join(_.map(values, (value) => `${variableName} LIKE ${escapeSqlString(`%${value}%`)}`), ` ${separator} `);
}

export default function adjustData(
  variables: IVariable[],
  options: {
    isEscapeJsonString?: boolean; // only for ES
    isPlaceholderQuoted?: boolean; // only for ES
    enableDorisSqlFormats?: boolean;
    datasourceList: {
      identifier?: string;
      id: number;
      name: string;
    }[];
  },
): {
  [key: string]: string | number;
} {
  const { isEscapeJsonString, isPlaceholderQuoted, enableDorisSqlFormats, datasourceList } = options;
  if (_.isEmpty(variables)) {
    return {};
  }
  const data = _.reduce(
    variables,
    (result, variable) => {
      const { options, reg, defaultValue, definition, value, allValue, type, datasource } = variable;
      const datasourceCate = (datasource?.cate as DatasourceCateEnum) || DatasourceCateEnum.prometheus;
      const separator = replaceAllSeparatorMap[datasourceCate];
      const params = {
        separator,
        datasourceCate,
        isPlaceholderQuoted,
        isEscapeJsonString,
      };
      // value: 已选的值
      let joinedValue = value;
      if (type === 'constant') {
        // definition: 常量定义的值
        joinedValue = value ?? definition ?? '';
      } else if (type === 'textbox') {
        joinedValue = value ?? defaultValue ?? '';
      } else if (type === 'datasource' || type === 'datasourceIdentifier') {
        // defaultValue: 数据源变量默认值
        joinedValue = value ?? defaultValue;
      }
      if (_.isEqual(value, ['all']) || _.isEqual(value, ['__all__'])) {
        if (allValue) {
          joinedValue = allValue;
        } else {
          joinedValue = joinValues(
            _.filter(options, (option) => {
              return !reg || !stringToRegex(reg) || (stringToRegex(reg) as RegExp).test(option.value);
            }),
            params,
          );
        }
      } else if (_.isArray(value)) {
        const currentOptions = _.map(value, (item) => {
          return _.find(options, (option) => option.value === item) || { label: item, value: item };
        });
        joinedValue = joinValues(currentOptions, params);
      } else if (_.isString(value)) {
        // 如果是数据源标识类型变量，则占位符变量的插值需要替换为数据源 ID
        if (type === 'datasourceIdentifier') {
          const finded = _.find(datasourceList, { identifier: value });
          if (finded) {
            joinedValue = finded.id;
          } else {
            console.error('can not find datasource by identifier: ', value);
          }
        }
      }
      result[variable.name] = joinedValue;

      // 高级 SQL 格式由查询目标是否为 Doris 决定，变量本身可以是 query、custom、textbox 等任意仪表盘变量。
      if (enableDorisSqlFormats && type) {
        const formatValues = getDorisSqlFormatValues(variable);
        if (typeof formatValues === 'string') {
          result[`${variable.name}:sql_like_or`] = formatValues;
          result[`${variable.name}:sql_like_and`] = formatValues;
        } else {
          const values = formatValues ?? [];
          result[`${variable.name}:sql_like_or`] = getDorisSqlLikeExpression(variable.name, values, 'OR');
          result[`${variable.name}:sql_like_and`] = getDorisSqlLikeExpression(variable.name, values, 'AND');
        }
      }
      return result;
    },
    {},
  );
  return data;
}

export function buildVariableInterpolations({
  variable,
  variables,
  datasourceList,
  range,
  enableDorisSqlFormats,
}: {
  variable: IVariable;
  variables: IVariable[];
  datasourceList: any[];
  range: any;
  enableDorisSqlFormats?: boolean;
}) {
  const builtInVariables = getBuiltInVariables({
    range,
  });
  const data = adjustData(_.concat(variables, builtInVariables), {
    datasourceList: datasourceList,
    isPlaceholderQuoted: isPlaceholderQuoted(variable.definition, variable.name), // only for ES
    isEscapeJsonString: true, // only for ES
    enableDorisSqlFormats,
  });
  return data;
}
