import React, { useRef } from 'react';
import { Space, Tooltip } from 'antd';
import _ from 'lodash';
import Color from 'color';
import { useSize } from 'ahooks';

import { IRawTimeRange } from '@/components/TimeRangePicker';

import { IOptions, IBarGaugeStyles } from '../../../types';
import { useGlobalState } from '../../../globalState';
import { getDetailUrl } from '../../utils/replaceExpressionDetail';

import { calculatePercentage } from './utils';

interface Props {
  custom: IBarGaugeStyles;
  options: IOptions;
  item: any;
  themeMode?: 'dark';
  minValue: number;
  maxValue: number;
  time: IRawTimeRange;
  maxNameWidth: number;
}

export default function BasicDisplayMode(props: Props) {
  const { item, custom, options, themeMode, minValue, maxValue, time, maxNameWidth } = props;
  const metric = item.metric;
  const { serieWidth, detailUrl, nameField, valueMode = 'color' } = custom as IBarGaugeStyles;
  const { thresholds } = options;
  const baseColor = _.find(thresholds?.steps, { type: 'base' })?.color ?? '#7EB26D';
  const name = nameField ? _.get(metric, nameField, item.name) : item.name;
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
    <Tooltip
      title={
        <Space>
          {item.name}
          {item.value}
          {item.unit}
        </Space>
      }
    >
      <div className='renderer-bar-gauge-item' key={item.name}>
        <div
          className='renderer-bar-gauge-item-name'
          style={{
            width: serieWidth ? `${serieWidth}%` : `${maxNameWidth + 4}px`, // 4px 是 省略号的宽度
          }}
        >
          {detailUrl ? (
            <a target='_blank' href={getDetailUrl(detailUrl, item, dashboardMeta, time)}>
              {name}
            </a>
          ) : (
            name
          )}
        </div>

        <div
          className='renderer-bar-gauge-item-value'
          style={{
            width: '100%',
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
              backgroundColor: Color(color).alpha(0.2).rgb().string(),
              width: calculatePercentage(item.stat, minValue, maxValue) + '%',
            }}
          >
            {valueMode === 'color' && (
              <div
                ref={textRef}
                className='renderer-bar-gauge-item-value-text'
                style={{
                  color: color,
                  right: getTextRight(),
                }}
              >
                {item.value}
                {item.unit}
              </div>
            )}
          </div>
        </div>
      </div>
    </Tooltip>
  );
}
