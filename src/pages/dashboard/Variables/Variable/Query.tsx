import React, { useEffect, useState, useContext, useRef } from 'react';
import { Select, Space, Tooltip } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { useGlobalState } from '@/pages/dashboard/globalState';

import { buildVariableInterpolations } from '../utils/ajustData';
import { useVariableManager } from '../VariableManagerContext';
import { formatString, formatDatasource } from '../utils/formatString';
import filterOptionsByReg from '../utils/filterOptionsByReg';
import getValueByOptions from '../utils/getValueByOptions';
import datasource from '../datasource';
import { Props } from './types';

export default function Query(props: Props) {
  const { datasourceList } = useContext(CommonStateContext);
  const [range] = useGlobalState('range');
  const { hide, item: variable, variableValueFixed, value, setValue } = props;
  const { name, label, multi, allOption, options } = variable;
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const { getVariables, updateVariable, registerVariable, registeredVariables } = useVariableManager();
  const variableRef = useRef(variable);
  const dropdownOpenValueRef = useRef<any>(null);

  useEffect(() => {
    variableRef.current = variable;
  });

  // 执行查询的核心逻辑
  const executeQuery = async () => {
    const currentVariable = variableRef.current;

    if (!currentVariable.datasource) {
      const errMsg = 'Variable ' + currentVariable.name + ' datasource not found';
      setErrorMsg(errMsg);
      return Promise.reject(errMsg);
    }

    const variableInterpolations = buildVariableInterpolations({
      variable: currentVariable,
      variables: getVariables(),
      datasourceList,
      range,
    });

    const formatedReg = currentVariable.reg ? formatString(currentVariable.reg, variableInterpolations) : '';
    const formatedDefinition = formatString(currentVariable.definition, variableInterpolations);
    const formatedQuery = currentVariable.query?.query ? formatString(currentVariable.query.query, variableInterpolations) : undefined;
    const datasourceCate = currentVariable.datasource?.cate;
    const datasourceValue = formatDatasource(currentVariable.datasource?.value as any, variableInterpolations);

    if (!datasourceValue) {
      const errMsg = 'Variable ' + currentVariable.name + ' datasource not found';
      setErrorMsg(errMsg);
      return Promise.reject(errMsg);
    }

    setErrorMsg('');
    try {
      const options = await datasource({
        datasourceCate,
        datasourceValue,
        datasourceList,
        query: {
          ...(currentVariable.query ?? {}),
          query: formatedDefinition || formatedQuery, // query 是标准写法
          range,
          config: currentVariable.config, // config 是 es 特有的写法
        },
      });
      const filteredOptions = _.sortBy(filterOptionsByReg(_.map(options, _.toString), formatedReg), 'value');
      updateVariable(name, {
        options: filteredOptions,
        value: getValueByOptions({
          variableValueFixed,
          variable: currentVariable,
          itemOptions: filteredOptions,
        }),
      });
    } catch (error: any) {
      setErrorMsg(error?.message || 'Error fetching variable options');
      updateVariable(name, {
        options: [],
        // value: variableValueFixed ? value : undefined, // TODO 如果查询失败暂时不清除变量值
      });
    }
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
  }, [variableConfigSignature]); // 使用 useMemo 计算的配置签名

  return (
    <div className={hide ? 'hidden' : ''}>
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
          mode={multi ? 'multiple' : undefined}
          style={{
            width: '180px',
          }}
          maxTagCount='responsive'
          onSelect={(v: string) => {
            // 单选模式直接触发 onChange
            if (multi) {
              // 多选模式下如果选中的是 all，清空其他选项
              if (v === 'all') {
                setValue(['all']);
              } else {
                // 如果选中的是 all 之外的其他选项，清除 all 值
                setValue(_.without([...((value as string[]) || []), v], 'all'));
              }
            } else {
              // 完成选择后清空搜索框
              setSearchValue('');
              setValue(v);
              updateVariable(name, {
                value: v,
              });
            }
          }}
          onDeselect={(v: string) => {
            // 只有多选生效 onDeselect 事件
            // 如果取消选中的是 all，清空所有选项
            // 如果取消选中的是 all 之外的其他选项，则排除该选项
            if (multi) {
              let newSelected: string[] = [];
              if (v === 'all') {
                newSelected = [];
              } else {
                newSelected = _.without(value as string[], v);
              }
              setValue(newSelected);
              // 如果是点击的 Tag 上的关闭按钮，也需要触发 onChange
              if (!dropdownVisible) {
                setSearchValue('');
                updateVariable(name, {
                  value: newSelected,
                });
              }
            }
          }}
          defaultActiveFirstOption={false}
          showSearch
          searchValue={searchValue}
          onSearch={(v) => {
            setSearchValue(v);
          }}
          open={dropdownVisible}
          onDropdownVisibleChange={(open) => {
            if (open) {
              // dropdown 打开时，记录当前的值
              dropdownOpenValueRef.current = value;
            } else {
              // 多选模式下 dropdown 关闭时，触发 onChange
              if (multi) {
                // 完成选择后清空搜索框
                setSearchValue('');
                // 只有当值发生变化时才调用 updateVariable
                if (!_.isEqual(dropdownOpenValueRef.current, value)) {
                  updateVariable(name, {
                    value,
                  });
                }
              }
            }
            setDropdownVisible(open);
          }}
          onClear={() => {
            if (multi) {
              setValue([]);
              updateVariable(name, {
                value: [],
              });
            } else {
              // 2024-10-28 清空变量时将 undefined 转为 '', 使之能缓存清空值状态，以便下次访问时变量值为空
              setValue('');
              updateVariable(name, {
                value: '',
              });
            }
          }}
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
