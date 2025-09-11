import React, { useRef } from 'react';
import _ from 'lodash';
import Color from 'color';

import { calculatePercentage } from '@/pages/dashboard/Renderer/Renderer/BarGauge/utils';

import { TextObject } from '../types';

interface Props {
  maxFieldTextWidth: number;
  item: TextObject;
  valueMode: 'color' | 'text' | 'hidden';
  themeMode?: 'dark';
  minValue: number;
  maxValue: number;
}

export default function BasicBar(props: Props) {
  const { maxFieldTextWidth, item, valueMode, themeMode, minValue, maxValue } = props;
  const color = item.color;
  let backgroundColor = 'unset';
  const bgRef = useRef(null);
  const textRef = useRef(null);

  try {
    backgroundColor = Color(color).alpha(0.2).rgb().string();
  } catch (e) {
    console.warn('Invalid color:', color);
  }

  return (
    <div className='renderer-table-ng-bar-gauge'>
      <div className='renderer-table-ng-bar-gauge-item'>
        <div className='renderer-table-ng-bar-gauge-item-value'>
          <div
            className='renderer-table-ng-bar-gauge-item-value-bg'
            style={{
              backgroundColor: themeMode === 'dark' ? '#20222E' : '#F6F6F6',
            }}
          />
          <div
            ref={bgRef}
            className='renderer-table-ng-bar-gauge-item-value-color-bg'
            style={{
              color: themeMode === 'dark' ? '#fff' : '#20222E',
              borderRight: `2px solid ${color}`,
              backgroundColor,
              width: (item.stat !== undefined ? calculatePercentage(item.stat, minValue, maxValue) : 0) + '%',
            }}
          ></div>
        </div>
        {valueMode !== 'hidden' && (
          <div
            ref={textRef}
            className='renderer-table-ng-bar-gauge-item-value-text'
            style={{
              color: valueMode === 'color' ? color : 'inherit',
              width: maxFieldTextWidth,
            }}
          >
            {item.text}
          </div>
        )}
      </div>
    </div>
  );
}
