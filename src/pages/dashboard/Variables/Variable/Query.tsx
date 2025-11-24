import React, { useEffect, useState, useContext } from 'react';
import { Select, Space, Tooltip } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useRequest } from 'ahooks';

import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { useGlobalState } from '@/pages/dashboard/globalState';

import { IVariable } from '../types';
import { formatString, formatDatasource } from '../utils/formatString';
import filterOptionsByReg from '../utils/filterOptionsByReg';
import getValueByOptions from '../utils/getValueByOptions';
import datasource from '../datasource';
import { Props } from './types';

export default function Query(props: Props) {
  const { datasourceList } = useContext(CommonStateContext);
  const [range] = useGlobalState('range');
  const { item, onChange, data, formatedReg, variableValueFixed, value, setValue } = props;
  const { name, label, multi, allOption, options } = item;
  const latestItemRef = React.useRef<IVariable>(item);
  const initializedRef = React.useRef<boolean>(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const formatedDefinition = formatString(item.definition, data);
  const formatedQuery = item.query?.query ? formatString(item.query.query, data) : undefined;
  const datasourceCate = item.datasource?.cate;
  const datasourceValue = formatDatasource(item.datasource?.value as any, data);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    latestItemRef.current = item;
  });

  const service = () => {
    if (!item.datasource) {
      const errMsg = 'Variable ' + name + ' datasource not found';
      setErrorMsg(errMsg);
      return Promise.reject(errMsg);
    }
    if (!datasourceValue) {
      const errMsg = 'Variable ' + name + ' datasource not found';
      setErrorMsg(errMsg);
      return Promise.reject(errMsg);
    }
    return datasource({
      datasourceCate,
      datasourceValue,
      datasourceList,
      query: {
        ...item.query,
        query: formatedDefinition || formatedQuery, // query 是标准写法
        range,
        config: item.config, // config 是 es 特有的写法
      },
    })
      .then((options) => {
        const itemClone = _.cloneDeep(latestItemRef.current);
        const itemOptions = _.sortBy(filterOptionsByReg(_.map(options, _.toString), formatedReg), 'value');

        setErrorMsg('');
        const isFirstLoad = !initializedRef.current;
        onChange({
          options: itemOptions,
          value: getValueByOptions({
            variableValueFixed,
            variable: itemClone,
            itemOptions,
          }),
          initialized: isFirstLoad ? true : undefined,
        });
        initializedRef.current = true;
      })
      .catch((error) => {
        setErrorMsg(error.message || 'Error fetching variable options');
        const isFirstLoad = !initializedRef.current;
        onChange({
          options: [],
          // value: variableValueFixed ? value : undefined, // TODO 如果查询失败暂时不清除变量值
          initialized: isFirstLoad ? true : undefined,
        });
        initializedRef.current = true;
      });
  };

  useRequest(service, {
    refreshDeps: [datasourceCate, datasourceValue, JSON.stringify(range), formatedDefinition, formatedQuery, formatedReg],
    throttleWait: 300,
  });

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
              onChange({
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
                onChange({
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
                onChange({
                  value,
                });
              }
            }
            setDropdownVisible(open);
          }}
          onClear={() => {
            if (multi) {
              setValue([]);
              onChange({
                value: [],
              });
            } else {
              // 2024-10-28 清空变量时将 undefined 转为 '', 使之能缓存清空值状态，以便下次访问时变量值为空
              setValue('');
              onChange({
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
