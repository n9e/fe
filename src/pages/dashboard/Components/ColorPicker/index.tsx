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
import React, { useState, useRef, useEffect, useContext } from 'react';
import { SketchPicker } from 'react-color';
import { Popover, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { CommonStateContext } from '@/App';
import useOnClickOutside from '@/components/useOnClickOutside';
import { PRIMARY_COLOR } from '@/utils/constant';
import { getBuiltinColorCssValue, isBuiltinColor, resolveColor } from './builtinColors';
import './style.less';
interface IProps {
  value?: string;
  onChange?: (val: string) => void;
  builtin?: boolean;
}

export default function index(props: IProps) {
  const { value = '#000', onChange, builtin = false } = props;
  const { t } = useTranslation('dashboard');
  const { darkMode } = useContext(CommonStateContext);
  const [visible, setVisible] = useState(false);
  const [activeKey, setActiveKey] = useState('custom');
  const eleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (builtin && visible) {
      setActiveKey(isBuiltinColor(value) ? 'colors' : 'custom');
    }
  }, [builtin, visible, value]);

  useOnClickOutside(eleRef, () => {
    setVisible(false);
  });

  const sketchPicker = (
    <SketchPicker
      disableAlpha={false}
      color={isBuiltinColor(value) ? resolveColor(value, Boolean(darkMode)) : value}
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
  );

  const colorTabs = (
    <Tabs activeKey={activeKey} onChange={setActiveKey}>
      <Tabs.TabPane tab={t('colorPicker.colors')} key='colors'>
        <div className='w-[276px] px-3 py-2'>
          {(['red', 'orange', 'yellow', 'green', 'blue', 'purple'] as const).map((hue) => (
            <div key={hue} className='flex h-10 items-center gap-1.5'>
              <span className='w-12 shrink-0'>{t(`colorPicker.${hue}`)}</span>
              <div className='flex flex-1 items-center justify-between gap-1'>
                {[11, 10, 9, 8, 7].map((level) => {
                  const token = `${hue}-${level}`;
                  const selected = value === token;
                  return (
                    <button
                      key={token}
                      type='button'
                      aria-label={`${t(`colorPicker.${hue}`)} ${level}`}
                      aria-pressed={selected}
                      className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0'
                      onClick={() => onChange?.(token)}
                    >
                      <span
                        className={`block rounded-full transition-transform duration-150 ${selected ? 'hover:scale-105' : 'hover:scale-110'}`}
                        style={{
                          position: 'relative',
                          width: level === 9 ? 32 : 24,
                          height: level === 9 ? 32 : 24,
                          backgroundColor: getBuiltinColorCssValue(token),
                        }}
                      >
                        {selected && (
                          <span
                            aria-hidden='true'
                            className='absolute rounded-full'
                            style={{
                              inset: 2,
                              border: '2px solid #000',
                              boxSizing: 'border-box',
                              pointerEvents: 'none',
                            }}
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className='mt-2 flex items-center gap-5 border-t pt-3' style={{ borderColor: 'var(--fc-border-color)' }}>
            {(['transparent', 'text'] as const).map((token) => {
              const selected = value === token;
              const label = token === 'transparent' ? t('colorPicker.transparent') : t('colorPicker.text_color');
              return (
                <button
                  key={token}
                  type='button'
                  aria-label={label}
                  aria-pressed={selected}
                  className='flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0'
                  onClick={() => onChange?.(token)}
                >
                  <span
                    className={`block h-6 w-6 rounded-full transition-transform duration-150 ${selected ? 'hover:scale-105' : 'hover:scale-110'}`}
                    style={{
                      position: 'relative',
                      backgroundColor: getBuiltinColorCssValue(token),
                      border: token === 'transparent' ? '1px solid var(--fc-border-color2)' : undefined,
                    }}
                  >
                    {selected && (
                      <span
                        aria-hidden='true'
                        className='absolute rounded-full'
                        style={{
                          inset: 2,
                          border: `2px solid ${token === 'text' && !darkMode ? '#fff' : '#000'}`,
                          boxSizing: 'border-box',
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </Tabs.TabPane>
      <Tabs.TabPane tab={t('colorPicker.custom')} key='custom'>
        {sketchPicker}
      </Tabs.TabPane>
    </Tabs>
  );

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
          {builtin ? colorTabs : sketchPicker}
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
            background: getBuiltinColorCssValue(value),
            width: 32,
            height: 32,
            borderRadius: 2,
            cursor: 'pointer',
            border: '1px solid #d9d9d9',
            position: 'absolute',
            zIndex: 1,
          }}
          data-testid='color-picker-trigger'
          onClick={() => {
            setVisible(!visible);
          }}
        />
      </div>
    </Popover>
  );
}
