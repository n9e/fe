import React, { useEffect, useRef } from 'react';
import { Input } from 'antd';
import _ from 'lodash';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

import getValueByOptions from '../utils/getValueByOptions';
import { useVariableManager } from '../VariableManagerContext';
import { Props } from './types';

export default function Constant(props: Props) {
  const { hide, item: variable, variableValueFixed } = props;
  const { name, label, definition } = variable;

  const { updateVariable, registerVariable, registeredVariables } = useVariableManager();
  const variableRef = useRef(variable);

  useEffect(() => {
    variableRef.current = variable;
  });

  // 执行查询的核心逻辑
  const executeQuery = async () => {
    const currentVariable = variableRef.current;

    updateVariable(name, {
      options: [],
      value: getValueByOptions({
        variableValueFixed,
        variable: {
          ...currentVariable,
          value: currentVariable.definition,
        },
        itemOptions: [],
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
        <Input disabled value={definition} />
      </InputGroupWithFormItem>
    </div>
  );
}
