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
import React from 'react';
import _ from 'lodash';
import { Checkbox, Space, Divider, Select } from 'antd';
import UnitPicker from '@/pages/dashboard/Components/UnitPicker';

interface IProps {
  type?: 'vertical' | 'horizontal';
  highLevelConfig: any;
  setHighLevelConfig: (val: any) => void;
}

export default function GraphStandardOptions(props: IProps) {
  const { type, highLevelConfig, setHighLevelConfig } = props;

  if (type === 'horizontal') {
    return (
      <>
        <span
          style={{
            // 2024-05-08 解决 antd v4 无边框的的 select 组件左右有无法去除的 padding 问题
            position: 'relative',
            right: -4,
          }}
        >
          Unit
          <UnitPicker
            size='small'
            optionLabelProp='cleanLabelLink'
            bordered={false}
            dropdownMatchSelectWidth={false}
            value={highLevelConfig.unit}
            onChange={(val) => {
              setHighLevelConfig({ ...highLevelConfig, unit: val });
            }}
          />
        </span>
        <Space>
          <Divider type='vertical' />
          <Checkbox
            checked={highLevelConfig.legend}
            onChange={(e) => {
              setHighLevelConfig({ ...highLevelConfig, legend: e.target.checked });
            }}
            className='n9e-checkbox-padding-right-0'
          >
            Show Legend
          </Checkbox>
          <Divider type='vertical' />
          <span>
            <Checkbox
              checked={highLevelConfig.shared}
              onChange={(e) => {
                setHighLevelConfig({ ...highLevelConfig, shared: e.target.checked });
              }}
              className='n9e-checkbox-padding-right-0'
            >
              Multi Tooltip, order value
            </Checkbox>
            <Select
              size='small'
              bordered={false}
              options={[
                {
                  label: <a>desc</a>,
                  value: 'desc',
                },
                {
                  label: <a>asc</a>,
                  value: 'asc',
                },
              ]}
              value={highLevelConfig.sharedSortDirection}
              onChange={(val) => {
                setHighLevelConfig({ ...highLevelConfig, sharedSortDirection: val });
              }}
            />
          </span>
        </Space>
      </>
    );
  }

  return (
    <div>
      <Checkbox
        checked={highLevelConfig.shared}
        onChange={(e) => {
          setHighLevelConfig({ ...highLevelConfig, shared: e.target.checked });
        }}
      >
        Multi Series in Tooltip, order value
      </Checkbox>
      <Select
        size='small'
        bordered={false}
        options={[
          {
            label: <a>desc</a>,
            value: 'desc',
          },
          {
            label: <a>asc</a>,
            value: 'asc',
          },
        ]}
        value={highLevelConfig.sharedSortDirection}
        onChange={(val) => {
          setHighLevelConfig({ ...highLevelConfig, sharedSortDirection: val });
        }}
      />
      <br />
      <Checkbox
        checked={highLevelConfig.legend}
        onChange={(e) => {
          setHighLevelConfig({ ...highLevelConfig, legend: e.target.checked });
        }}
      >
        Show Legend
      </Checkbox>
      <br />
      Value format with:{' '}
      <UnitPicker
        size='small'
        optionLabelProp='cleanLabelLink'
        bordered={false}
        dropdownMatchSelectWidth={false}
        value={highLevelConfig.unit}
        onChange={(val) => {
          setHighLevelConfig({ ...highLevelConfig, unit: val });
        }}
      />
    </div>
  );
}
