import React, { useEffect, useState, useRef } from 'react';
import { Select, Tooltip } from 'antd';
import _ from 'lodash';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

import filterOptionsByReg from '../utils/filterOptionsByReg';
import getValueByOptions from '../utils/getValueByOptions';
import { useVariableManager } from '../VariableManagerContext';
import { Props } from './types';

export default function Custom(props: Props) {
  const { hide, item: variable, variableValueFixed, value, setValue } = props;
  const { name, label, multi, allOption, options } = variable;
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const { updateVariable, registerVariable, registeredVariables } = useVariableManager();
  const variableRef = useRef(variable);

  useEffect(() => {
    variableRef.current = variable;
  });

  // 执行查询的核心逻辑
  const executeQuery = async () => {
    const currentVariable = variableRef.current;

    const options = _.map(_.compact(_.split(currentVariable.definition, ',')), _.trim);
    const itemOptions = _.sortBy(filterOptionsByReg(options), 'value');

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
            if (!open) {
              // 多选模式下 dropdown 关闭时，触发 onChange
              if (multi) {
                // 完成选择后清空搜索框
                setSearchValue('');
                updateVariable(name, {
                  value,
                });
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
