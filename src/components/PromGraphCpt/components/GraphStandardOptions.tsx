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
import { Menu, Checkbox, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';

interface IProps {
  highLevelConfig: any;
  setHighLevelConfig: (val: any) => void;
}

export const units = [
  {
    label: 'SI prefixes',
    value: 'default',
  },
  {
    label: 'none',
    value: 'none',
  },
  {
    label: 'bits(SI)',
    value: 'bitsSI',
  },
  {
    label: 'bytes(SI)',
    value: 'bytesSI',
  },
  {
    label: 'bits(IEC)',
    value: 'bitsIEC',
  },
  {
    label: 'bytes(IEC)',
    value: 'bytesIEC',
  },
  {
    label: '百分比(0-100)',
    value: 'percent',
  },
  {
    label: '百分比(0.0-1.0)',
    value: 'percentUnit',
  },
  {
    label: 'seconds',
    value: 'seconds',
  },
  {
    label: 'milliseconds',
    value: 'milliseconds',
  },
  {
    label: 'humanize(seconds)',
    value: 'humantimeSeconds',
  },
  {
    label: 'humanize(milliseconds)',
    value: 'humantimeMilliseconds',
  },
];

export default function GraphStandardOptions(props: IProps) {
  const { highLevelConfig, setHighLevelConfig } = props;
  const aggrFuncMenu = (
    <Menu
      onClick={(sort) => {
        setHighLevelConfig({ ...highLevelConfig, sharedSortDirection: (sort as { key: 'desc' | 'asc' }).key });
      }}
      selectedKeys={[highLevelConfig.sharedSortDirection]}
    >
      <Menu.Item key='desc'>desc</Menu.Item>
      <Menu.Item key='asc'>asc</Menu.Item>
    </Menu>
  );
  const precisionMenu = (
    <Menu
      onClick={(e) => {
        setHighLevelConfig({ ...highLevelConfig, unit: e.key });
      }}
      selectedKeys={[highLevelConfig.unit]}
    >
      {_.map(units, (item) => {
        return <Menu.Item key={item.value}>{item.label}</Menu.Item>;
      })}
    </Menu>
  );
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
      <Dropdown overlay={aggrFuncMenu}>
        <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
          {highLevelConfig.sharedSortDirection} <DownOutlined />
        </a>
      </Dropdown>
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
      <Dropdown overlay={precisionMenu}>
        <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
          {_.get(_.find(units, { value: highLevelConfig.unit }), 'label')} <DownOutlined />
        </a>
      </Dropdown>
    </div>
  );
}
