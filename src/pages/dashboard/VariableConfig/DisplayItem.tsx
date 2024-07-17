/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useEffect, useState } from 'react';
import { Select, Input, Tooltip } from 'antd';
import _ from 'lodash';
import { IVariable } from './definition';

interface IProps {
  expression: IVariable;
  value: string | string[] | undefined;
  onChange: (val: string | string[] | undefined) => void; // 目前只为了外层更新变量 options
}

export default function DisplayItem(props: IProps) {
  const { expression, value, onChange } = props;
  const { name, label, multi, allOption, options, type, hide } = expression;
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selected, setSelected] = useState<string | string[] | undefined>(value);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    let curValue = value;
    // 当 query 和 custom 类型开启多选时，如果 value 为字符串，需要转为数组
    if ((type === 'query' || type === 'custom') && multi) {
      if (value === undefined) {
        curValue = undefined;
      } else {
        curValue = Array.isArray(value) ? value : [value];
      }
    }
    setSelected(curValue);
  }, [JSON.stringify(value)]);

  // 兼容旧数据，businessGroupIdent 和 constant 的 hide 默认为 true
  if (hide || ((type === 'businessGroupIdent' || type === 'constant') && hide === undefined)) return null;

  return (
    <div className='tag-content-close-item'>
      <Input.Group>
        <span className='ant-input-group-addon'>{label || name}</span>
        {type === 'query' || type === 'custom' ? (
          <Select
            allowClear
            mode={multi ? 'multiple' : undefined}
            style={{
              width: '180px',
            }}
            maxTagCount='responsive'
            onSelect={(v) => {
              // 单选模式直接触发 onChange
              if (multi) {
                // 多选模式下如果选中的是 all，清空其他选项
                if (v === 'all') {
                  setSelected(['all']);
                } else {
                  // 如果选中的是 all 之外的其他选项，清除 all 值
                  setSelected(_.without([...(selected || []), v], 'all'));
                }
              } else {
                // 完成选择后清空搜索框
                setSearchValue('');
                setSelected(v);
                onChange(v);
              }
            }}
            onDeselect={(v) => {
              // 只有多选生效 onDeselect 事件
              // 如果取消选中的是 all，清空所有选项
              // 如果取消选中的是 all 之外的其他选项，则排除该选项
              if (multi) {
                let newSelected: string[] = [];
                if (v === 'all') {
                  newSelected = [];
                } else {
                  newSelected = _.without(selected, v);
                }
                setSelected(newSelected);
                // 如果是点击的 Tag 上的关闭按钮，也需要触发 onChange
                if (!dropdownVisible) {
                  setSearchValue('');
                  onChange(newSelected);
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
                  onChange(selected);
                }
              }
              setDropdownVisible(open);
            }}
            onClear={() => {
              if (multi) {
                setSelected([]);
                onChange([]);
              } else {
                setSelected(undefined);
                onChange(undefined);
              }
            }}
            dropdownMatchSelectWidth={_.toNumber(options?.length) > 100}
            value={selected}
            dropdownClassName='overflow-586'
            maxTagPlaceholder={(omittedValues) => {
              return (
                <Tooltip
                  title={
                    <div>
                      {omittedValues.map((item) => {
                        return <div key={item.key}>{item.value}</div>;
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
            {options &&
              options.map((value) => (
                <Select.Option key={value} value={value} style={{ maxWidth: 500 }}>
                  {value}
                </Select.Option>
              ))}
          </Select>
        ) : null}
        {type === 'textbox' ? (
          <Input
            value={selected}
            onBlur={(e) => {
              let val = e.target.value;
              onChange(val);
            }}
            onKeyDown={(e: any) => {
              if (e.code === 'Enter') {
                let val = e.target.value;
                onChange(val);
              }
            }}
            onChange={(e) => {
              let val = e.target.value;
              setSelected(val as any);
            }}
          />
        ) : null}
        {type === 'datasource' ? (
          <Select
            style={{
              width: '180px',
            }}
            maxTagCount='responsive'
            defaultActiveFirstOption={false}
            showSearch
            dropdownMatchSelectWidth={false}
            value={selected}
            onChange={(value) => {
              setSelected(value as any);
              onChange(value);
            }}
          >
            {_.map(options as any, (item) => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        ) : null}
        {type === 'hostIdent' ? (
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
                } else if (v.includes('all')) {
                  val = _.without(v, 'all');
                }
              }
              setSelected(val);
              onChange(val);
            }}
            defaultActiveFirstOption={false}
            showSearch
            dropdownMatchSelectWidth={_.toNumber(options?.length) > 100}
            value={selected}
            dropdownClassName='overflow-586'
            maxTagPlaceholder={(omittedValues) => {
              return (
                <Tooltip
                  title={
                    <div>
                      {omittedValues.map((item) => {
                        return <div key={item.key}>{item.value}</div>;
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
                all
              </Select.Option>
            )}
            {_.map(options, (value) => (
              <Select.Option key={value} value={value} style={{ maxWidth: 500 }}>
                {value}
              </Select.Option>
            ))}
          </Select>
        ) : null}
        {type === 'businessGroupIdent' ? <Input disabled value={value} /> : null}
        {type === 'constant' ? <Input disabled value={value} /> : null}
      </Input.Group>
    </div>
  );
}
