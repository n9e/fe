import _ from 'lodash';

import { DatasourceCateEnum } from '@/utils/constant';

import { IVariable } from '../types';
import { replaceAllSeparatorMap } from '../constant';
import stringToRegex from './stringToRegex';
import { escapePromQLString, escapeJsonString } from './escapeString';
import { getBuiltInVariables } from './replaceTemplateVariables';
import isPlaceholderQuoted from './isPlaceholderQuoted';

function adjustValue(
  value: string,
  params: {
    datasourceCate: DatasourceCateEnum;
    isPlaceholderQuoted?: boolean;
    isEscapeJsonString?: boolean;
  },
) {
  const { datasourceCate, isPlaceholderQuoted, isEscapeJsonString } = params;
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

export default function adjustData(
  variables: IVariable[],
  options: {
    isEscapeJsonString?: boolean; // only for ES
    isPlaceholderQuoted?: boolean; // only for ES
    datasourceList: {
      identifier?: string;
      id: number;
      name: string;
    }[];
  },
): {
  [key: string]: string | number;
} {
  const { isEscapeJsonString, isPlaceholderQuoted, datasourceList } = options;
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
      return result;
    },
    {},
  );
  return data;
}

export function buildVariableInterpolations({ variable, variables, datasourceList, range }: { variable: IVariable; variables: IVariable[]; datasourceList: any[]; range: any }) {
  const builtInVariables = getBuiltInVariables({
    range,
  });
  const data = adjustData(_.concat(variables, builtInVariables), {
    datasourceList: datasourceList,
    isPlaceholderQuoted: isPlaceholderQuoted(variable.definition, variable.name), // only for ES
    isEscapeJsonString: true, // only for ES
  });
  return data;
}
