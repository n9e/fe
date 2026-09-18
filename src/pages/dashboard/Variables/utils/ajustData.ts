import _ from 'lodash';

import { DatasourceCateEnum } from '@/utils/constant';
import type { IRawTimeRange } from '@/components/TimeRangePicker';
import type { DashboardDatasource } from '@/pages/dashboard/types';

import { IVariable } from '../types';
import { replaceAllSeparatorMap } from '../constant';
import stringToRegex from './stringToRegex';
import { escapePromQLString, escapeJsonString } from './escapeString';
import { VARIABLE_INTERPOLATION_METADATA } from './formatString';
import type { InterpolationData, VariableInterpolationMetadata } from './formatString';
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
    value: string | number;
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
  // SQL 数据源多值：按 Grafana sqlstring 风格输出单引号包裹的值列表，Doris 用逗号加空格分隔以便阅读。
  if (datasourceCate === DatasourceCateEnum.mysql || datasourceCate === DatasourceCateEnum.doris) {
    const valueSeparator = datasourceCate === DatasourceCateEnum.doris ? ', ' : ',';
    return _.join(
      _.map(values, (item) => adjustValue(String(item.value), { datasourceCate, isPlaceholderQuoted, isEscapeJsonString, isSqlMulti: true })),
      valueSeparator,
    );
  }
  // 如果只有一个值时，不需要使用分隔符连接和外包裹（括号）
  if (values.length === 1 && values[0]) {
    return adjustValue(String(values[0].value), {
      datasourceCate,
      isPlaceholderQuoted,
    });
  }
  if (separator) {
    return `(${_.trim(
      _.join(
        _.map(values, (item) => {
          return adjustValue(String(item.value), {
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
    return values.map((item) => item.value).join(',');
  }
}

function getInterpolationMetadata(variable: IVariable): Omit<VariableInterpolationMetadata, 'defaultValue'> {
  const { options = [], reg, defaultValue, definition, value, allValue, type } = variable;
  const isAll = _.isEqual(value, ['all']) || _.isEqual(value, ['__all__']);

  if (isAll) {
    if (allValue) {
      return {
        values: [allValue],
        texts: ['All'],
        allValue,
        isAll: true,
      };
    }
    const allOptions = options.filter((option) => !reg || !stringToRegex(reg) || (stringToRegex(reg) as RegExp).test(String(option.value)));
    return {
      values: allOptions.map((option) => String(option.value)),
      texts: ['All'],
      isAll: true,
    };
  }

  let selectedValue = value;
  if (type === 'constant') {
    selectedValue = value ?? definition ?? '';
  } else if (type === 'textbox' || type === 'datasource' || type === 'datasourceIdentifier') {
    selectedValue = value ?? defaultValue;
  }

  const selectedValues = Array.isArray(selectedValue) ? selectedValue : selectedValue == null ? [] : [selectedValue];
  const selectedOptions = selectedValues.map((selected) => {
    return options.find((option) => option.value === selected) || { label: String(selected), value: selected };
  });
  return {
    values: selectedOptions.map((option) => String(option.value)),
    texts: selectedOptions.map((option) => option.label),
  };
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
): InterpolationData {
  const { isEscapeJsonString, isPlaceholderQuoted, datasourceList } = options;
  if (_.isEmpty(variables)) {
    return {};
  }
  const metadata: Record<string, VariableInterpolationMetadata> = {};
  const data = _.reduce<IVariable, InterpolationData>(
    variables,
    (result, variable) => {
      const { options, reg, defaultValue, definition, value, allValue, type, datasource } = variable;
      const datasourceCate = (datasource?.cate as DatasourceCateEnum) || DatasourceCateEnum.prometheus;
      const separator = datasourceCate in replaceAllSeparatorMap ? replaceAllSeparatorMap[datasourceCate as keyof typeof replaceAllSeparatorMap] : '';
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
              return !reg || !stringToRegex(reg) || (stringToRegex(reg) as RegExp).test(String(option.value));
            }),
            params,
          );
        }
      } else if (_.isArray(value)) {
        const currentOptions = _.map(value, (item) => {
          return _.find(options, (option) => option.value === item) || { label: String(item), value: item };
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
      const interpolatedDefaultValue = Array.isArray(joinedValue) ? joinedValue.join(',') : joinedValue;
      result[variable.name] = interpolatedDefaultValue;
      metadata[variable.name] = {
        defaultValue: interpolatedDefaultValue,
        ...getInterpolationMetadata(variable),
      };
      return result;
    },
    {},
  );
  Object.defineProperty(data, VARIABLE_INTERPOLATION_METADATA, {
    value: metadata,
    enumerable: false,
  });
  return data;
}

export function buildVariableInterpolations({
  variable,
  variables,
  datasourceList,
  range,
}: {
  variable: IVariable;
  variables: IVariable[];
  datasourceList: DashboardDatasource[];
  range: IRawTimeRange;
}) {
  const builtInVariables = getBuiltInVariables(range);
  const data = adjustData(_.concat(variables, builtInVariables), {
    datasourceList: datasourceList,
    isPlaceholderQuoted: isPlaceholderQuoted(variable.definition, variable.name), // only for ES
    isEscapeJsonString: true, // only for ES
  });
  return data;
}
