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
import React, { useRef } from 'react';
import { Tooltip } from 'antd';
import _ from 'lodash';
import Color from 'color';
import { useSize } from 'ahooks';
import { IPanel, IBarGaugeStyles } from '../../../types';
import getCalculatedValuesBySeries from '../../utils/getCalculatedValuesBySeries';
import { getDetailUrl } from '../../utils/replaceExpressionDetail';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { useGlobalState } from '../../../globalState';

import './style.less';

interface IProps {
  values: IPanel;
  series: any[];
  themeMode?: 'dark';
  time: IRawTimeRange;
}

function Item(props) {
  const { item, custom, themeMode, maxValue, time } = props;
  const { baseColor = '#FF656B', displayMode = 'basic', serieWidth = 20, detailUrl } = custom as IBarGaugeStyles;
  const color = item.color ? item.color : baseColor;
  const bgRef = useRef(null);
  const bgSize = useSize(bgRef);
  const textRef = useRef(null);
  const textSize = useSize(textRef);
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const getTextRight = () => {
    if (bgSize?.width !== undefined && textSize?.width !== undefined) {
      if (bgSize?.width < textSize?.width + 8) {
        return -textSize?.width - 8;
      }
      return 0;
    }
    return 0;
  };

  return (
    <Tooltip title={item.name}>
      <div className='renderer-bar-gauge-item' key={item.name}>
        <div
          className='renderer-bar-gauge-item-name'
          style={{
            width: `${serieWidth}%`,
          }}
        >
          {detailUrl ? (
            <a target='_blank' href={getDetailUrl(detailUrl, item, dashboardMeta, time)}>
              {item.name}
            </a>
          ) : (
            item.name
          )}
        </div>

        <div
          className='renderer-bar-gauge-item-value'
          style={{
            width: `${100 - serieWidth}%`,
          }}
        >
          <div
            className='renderer-bar-gauge-item-value-bg'
            style={{
              backgroundColor: themeMode === 'dark' ? '#20222E' : '#F6F6F6',
            }}
          />
          <div
            ref={bgRef}
            className='renderer-bar-gauge-item-value-color-bg'
            style={{
              color: themeMode === 'dark' ? '#fff' : '#20222E',
              borderRight: `2px solid ${color}`,
              backgroundColor: Color(color)
                .alpha(displayMode === 'basic' ? 0.2 : 1)
                .rgb()
                .string(),
              width: `${(item.stat / maxValue) * 100}%`,
            }}
          >
            {displayMode === 'basic' && (
              <div
                ref={textRef}
                className='renderer-bar-gauge-item-value-text'
                style={{
                  color: color,
                  right: getTextRight(),
                }}
              >
                {item.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </Tooltip>
  );
}

export default function BarGauge(props: IProps) {
  const { values, series, themeMode, time } = props;
  const { custom, options } = values;
  const { calc, maxValue, sortOrder = 'desc' } = custom;
  let calculatedValues = getCalculatedValuesBySeries(
    series,
    calc,
    {
      unit: options?.standardOptions?.util,
      decimals: options?.standardOptions?.decimals,
      dateFormat: options?.standardOptions?.dateFormat,
    },
    options?.valueMappings,
  );
  if (sortOrder && sortOrder !== 'none') {
    calculatedValues = _.orderBy(calculatedValues, ['stat'], [sortOrder]);
  }
  const curMaxValue = maxValue !== undefined && maxValue !== null ? maxValue : _.maxBy(calculatedValues, 'stat')?.stat || 0;

  return (
    <div className='renderer-bar-gauge-container'>
      <div className='renderer-bar-gauge scroll-container'>
        {_.map(calculatedValues, (item) => {
          return <Item key={item.id} item={item} custom={custom} themeMode={themeMode} maxValue={curMaxValue} time={time} />;
        })}
      </div>
    </div>
  );
}
