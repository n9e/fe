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
import React, { useState, useRef } from 'react';
import _ from 'lodash';
import { SketchPicker } from 'react-color';
import { Popover } from 'antd';
import useOnClickOutside from '@/components/useOnClickOutside';
import { PRIMARY_COLOR } from '@/utils/constant';
import './style.less';
interface IProps {
  value?: string;
  onChange?: (val: string) => void;
}

export default function index(props: IProps) {
  const { value = '#000', onChange } = props;
  const [visible, setVisible] = useState(false);
  const eleRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(eleRef, () => {
    setVisible(false);
  });

  return (
    <Popover
      trigger='click'
      placement='left'
      visible={visible}
      overlayClassName='color-picker-popover'
      content={
        <div
          ref={eleRef}
          onMouseLeave={() => {
            setVisible(false);
          }}
        >
          <SketchPicker
            disableAlpha={false}
            color={value}
            presetColors={[
              '#FF656B',
              '#FF8286',
              '#CE4F52',
              '#FF9919',
              '#FFAE39',
              '#CE7B00',
              '#E6C627',
              '#ECD245',
              '#B99F00',
              '#3FC453',
              '#61D071',
              '#2C9D3D',
              '#9470FF',
              PRIMARY_COLOR,
              '#51566B',
              '#FFFFFF',
            ]}
            onChange={(val) => {
              if (onChange) {
                const {
                  rgb: { r, g, b, a },
                } = val;
                onChange(`rgba(${r}, ${g}, ${b}, ${a})`);
              }
            }}
          />
        </div>
      }
    >
      <div style={{ position: 'relative', width: 32, height: 32 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADFJREFUOE9jZGBgEGHAD97gk2YcNYBhmIQBgWSAP52AwoAQwJvQRg1gACckQoC2gQgAIF8IscwEtKYAAAAASUVORK5CYII=") left center',
          }}
        ></div>
        <div
          style={{
            background: value,
            width: 32,
            height: 32,
            borderRadius: 2,
            cursor: 'pointer',
            border: '1px solid #d9d9d9',
            position: 'absolute',
            zIndex: 1,
          }}
          onClick={() => {
            setVisible(!visible);
          }}
        />
      </div>
    </Popover>
  );
}
