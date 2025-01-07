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
import React, { useState } from 'react';
import { RightOutlined, DownOutlined } from '@ant-design/icons';
import classnames from 'classnames';

interface IProps {
  isActive?: boolean;
  header: React.ReactNode;
  children: React.ReactNode;
  extra?: React.ReactNode;
  isInner?: boolean;
}

export default function Panel(props: IProps) {
  const [isActive, setIsActive] = useState<boolean>(props.isActive || true);
  return (
    <div
      className={classnames({
        'n9e-collapse-item': true,
        'n9e-collapse-item-active': isActive,
        'n9e-collapse-item-inner': props.isInner,
      })}
    >
      <div
        className='n9e-collapse-header'
        onClick={() => {
          setIsActive(!isActive);
        }}
      >
        {isActive ? <DownOutlined className='n9e-collapse-arrow' /> : <RightOutlined className='n9e-collapse-arrow' />}
        {props.header}
        <div
          className='n9e-collapse-extra'
          onClick={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
          }}
        >
          {props.extra}
        </div>
      </div>
      <div
        className={classnames({
          'n9e-collapse-content': true,
          'n9e-collapse-content-hidden': !isActive,
        })}
      >
        <div className='n9e-collapse-content-box'>{props.children}</div>
      </div>
    </div>
  );
}
