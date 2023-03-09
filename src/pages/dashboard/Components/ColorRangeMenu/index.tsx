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
import { Menu } from 'antd';
import { colors } from './config';
import './style.less';

interface IProps {
  onClick: (e: any) => void;
  selectedKeys: string[];
}

export default function index(props: IProps) {
  const { onClick, selectedKeys } = props;
  return (
    <Menu prefixCls='ant-dropdown-menu' onClick={onClick} selectedKeys={selectedKeys} className='color-scales'>
      {_.map(colors, (item) => {
        return (
          <Menu.Item key={item.label} className='color-scales-menu-item'>
            <span className='color-scales-menu-colors'>
              {_.map(item.value, (color) => {
                return (
                  <span
                    key={color}
                    style={{
                      backgroundColor: color,
                    }}
                  />
                );
              })}
            </span>
            {item.label}
          </Menu.Item>
        );
      })}
    </Menu>
  );
}
