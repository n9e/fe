import React, { useState, useEffect, useRef, useContext } from 'react';
import { Select, Tooltip, Space } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { getMonObjectList } from '@/services/targets';

import { useGlobalState } from '../../globalState';
import getValueByOptions from '../utils/getValueByOptions';
import filterOptionsByReg from '../utils/filterOptionsByReg';
import { buildVariableInterpolations } from '../utils/ajustData';
import { formatString } from '../utils/formatString';
import { useVariableManager } from '../VariableManagerContext';
import { Props } from './types';

export default function HostIdent(props: Props) {
  const { datasourceList } = useContext(CommonStateContext);
  const [range] = useGlobalState('range');
  const [dashboardMeta] = useGlobalState('dashboardMeta');

  const { item: variable, variableValueFixed, value, setValue } = props;
  const { name, label, options, multi, allOption } = variable;

  const [errorMsg, setErrorMsg] = useState<string>('');

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

    const formatedReg = currentVariable.reg ? formatString(currentVariable.reg, variableInterpolations) : '';

    try {
      const res = await getMonObjectList({
        gids: dashboardMeta.group_id,
        p: 1,
        limit: 5000,
      });
      const list = _.uniq(_.map(res?.dat?.list, 'ident'));
      const itemOptions = _.sortBy(filterOptionsByReg(_.map(list, _.toString), formatedReg), 'value');

      updateVariable(name, {
        options: itemOptions,
        value: getValueByOptions({
          variableValueFixed,
          variable: currentVariable,
          itemOptions,
        }),
      });
    } catch (err) {
      const errMsg = 'Failed to fetch host idents for variable ' + currentVariable.name;
      setErrorMsg(errMsg);
      updateVariable(name, {
        options: [],
      });
    }
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
      <InputGroupWithFormItem
        label={
          <Space>
            {errorMsg ? (
              <Tooltip title={errorMsg}>
                <WarningOutlined style={{ color: '#f06' }} />
              </Tooltip>
            ) : null}
            {label || name}
          </Space>
        }
      >
        <Select
          allowClear
          mode={multi ? 'tags' : undefined}
          style={{
            width: '180px',
          }}
          maxTagCount='responsive'
          onChange={(v) => {
            let val = v;
            if (_.isArray(v)) {
              const curVal = _.last(v);
              if (curVal === 'all') {
                val = ['all'];
              } else if (_.includes(v, 'all')) {
                val = _.without(v, 'all');
              }
            }
            setValue(val);
            updateVariable(name, {
              value: val,
            });
          }}
          defaultActiveFirstOption={false}
          showSearch
          dropdownMatchSelectWidth={_.toNumber(options?.length) > 100}
          value={value}
          dropdownClassName='overflow-586'
          maxTagPlaceholder={(omittedValues) => {
            return (
              <Tooltip
                title={
                  <div>
                    {omittedValues.map((item, index) => {
                      return <div key={item.key + _.toString(index)}>{item.value}</div>;
                    })}
                  </div>
                }
              >
                <div>+{omittedValues.length}...</div>
              </Tooltip>
            );
          }}
        >
          {allOption && (
            <Select.Option key={'all'} value={'all'}>
              All
            </Select.Option>
          )}
          {_.map(options, (item) => (
            <Select.Option key={item.value} value={item.value} style={{ maxWidth: 500 }}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      </InputGroupWithFormItem>
    </div>
  );
}
