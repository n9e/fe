import React, { useEffect, useContext, useRef } from 'react';
import { Select } from 'antd';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { useGlobalState } from '@/pages/dashboard/globalState';

import getValueByOptions from '../utils/getValueByOptions';
import stringToRegex from '../utils/stringToRegex';
import { buildVariableInterpolations } from '../utils/ajustData';
import { formatString } from '../utils/formatString';
import { useVariableManager } from '../VariableManagerContext';
import { Props } from './types';

export default function Datasource(props: Props) {
  const { datasourceList, groupedDatasourceList } = useContext(CommonStateContext);
  const [range] = useGlobalState('range');

  const { hide, item: variable, variableValueFixed, value, setValue } = props;
  const { name, label, options } = variable;

  const { getVariables, updateVariable, registerVariable, registeredVariables } = useVariableManager();
  const variableRef = useRef(variable);

  useEffect(() => {
    variableRef.current = variable;
  });

  // 执行查询的核心逻辑
  const executeQuery = async () => {
    const currentVariable = variableRef.current;

    const variableInterpolations = buildVariableInterpolations({
      variable: currentVariable,
      variables: getVariables(),
      datasourceList,
      range,
    });

    let currentDatasourceList = currentVariable.definition ? (groupedDatasourceList[currentVariable.definition] as any) : [];
    const formatedRegex = currentVariable.regex ? formatString(currentVariable.regex, variableInterpolations) : '';
    const regex = stringToRegex(formatedRegex);
    if (regex) {
      currentDatasourceList = _.filter(currentDatasourceList, (option) => {
        return regex.test(option.name);
      });
    }
    const itemOptions = _.map(currentDatasourceList, (ds) => {
      return { label: ds.name, value: ds.id as any }; // TODO value 实际是 number 类型
    });

    updateVariable(name, {
      options: itemOptions,
      value: getValueByOptions({
        variableValueFixed,
        variable: currentVariable,
        itemOptions,
      }),
    });
  };

  // 计算变量的配置签名（排除 label, value, options, hide）
  const variableConfigSignature = React.useMemo(() => {
    const { label, value, options, hide, ...rest } = variable;
    return JSON.stringify(rest);
  }, [variable]);

  // 注册变量到管理器
  useEffect(() => {
    const meta = {
      name: variable.name,
      variable,
      executor: executeQuery,
    };

    registerVariable(meta);

    // 配置变更时清理订阅
    return () => {
      const meta = registeredVariables.current.get(variable.name);
      if (meta && meta.cleanup) meta.cleanup();
    };
  }, [variableConfigSignature]);

  return (
    <div className={hide ? 'hidden' : ''}>
      <InputGroupWithFormItem label={label || name}>
        <Select
          style={{
            width: '180px',
          }}
          maxTagCount='responsive'
          defaultActiveFirstOption={false}
          showSearch
          dropdownMatchSelectWidth={false}
          value={value}
          onChange={(newValue) => {
            setValue(newValue as any);
            updateVariable(name, {
              value: newValue,
            });
          }}
          optionFilterProp='children'
        >
          {_.map(options as any, (item) => (
            <Select.Option key={item.value} value={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      </InputGroupWithFormItem>
    </div>
  );
}
