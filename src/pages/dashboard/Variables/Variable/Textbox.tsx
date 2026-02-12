import React, { useEffect, useRef } from 'react';
import { Input } from 'antd';
import _ from 'lodash';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

import getValueByOptions from '../utils/getValueByOptions';
import { useVariableManager } from '../VariableManagerContext';
import { Props } from './types';

export default function Textbox(props: Props) {
  const { item: variable, variableValueFixed, value, setValue } = props;
  const { name, label } = variable;

  const { updateVariable, registerVariable, registeredVariables } = useVariableManager();
  const variableRef = useRef(variable);

  useEffect(() => {
    variableRef.current = variable;
  });

  // 执行查询的核心逻辑
  const executeQuery = async () => {
    const currentVariable = variableRef.current;

    updateVariable(name, {
      value: getValueByOptions({
        variableValueFixed,
        variable: currentVariable,
      }),
    });
  };

  // 注册变量到管理器
  useEffect(() => {
    const meta = {
      name: variable.name,
      variable,
      executor: executeQuery,
    };

    registerVariable(meta);

    // 组件卸载时清理
    return () => {
      const meta = registeredVariables.current.get(variable.name);
      if (meta && meta.cleanup) meta.cleanup();
      registeredVariables.current.delete(variable.name);
    };
  }, [variable.name]);

  return (
    <div>
      <InputGroupWithFormItem label={label || name}>
        <Input
          value={value}
          onBlur={(e) => {
            let val = e.target.value;
            updateVariable(name, {
              value: val,
            });
          }}
          onKeyDown={(e: any) => {
            if (e.code === 'Enter') {
              let val = e.target.value;
              updateVariable(name, {
                value: val,
              });
            }
          }}
          onChange={(e) => {
            let val = e.target.value;
            setValue(val as any);
          }}
        />
      </InputGroupWithFormItem>
    </div>
  );
}
