import React, { CSSProperties } from 'react';
import { Space, Tooltip } from 'antd';
import classNames from 'classnames';
import _ from 'lodash';
import Color from 'color';

import { useReplaceTemplateVariables } from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';
import { getTextWidth } from '@/pages/dashboard/Renderer/Renderer/Hexbin/utils';

import { IOptions, IBarGaugeStyles, ScopedVariables } from '../../../types';
import { BarGaugeValue, calculatePercentage, getGradientBackground } from './utils';

interface Props {
  custom: IBarGaugeStyles;
  options: IOptions;
  item: BarGaugeValue;
  themeMode?: 'dark';
  minValue: number;
  maxValue: number;
  maxNameWidth: number;
  maxValueWidth: number;
  itemWidth: number;
  orientation: 'horizontal' | 'vertical';
  namePlacement: 'top' | 'bottom' | 'left' | 'hidden';
  itemStyle?: CSSProperties;
}

export default function BasicDisplayMode(props: Props) {
  const replaceTemplateVariables = useReplaceTemplateVariables();
  const { item, custom, options, themeMode, minValue, maxValue, maxNameWidth, maxValueWidth, itemWidth, orientation, namePlacement, itemStyle } = props;
  const metric = item.metric;
  const { serieWidth, detailUrl, nameField, valueMode = 'color', displayMode = 'basic' } = custom as IBarGaugeStyles;
  const { thresholds } = options;
  const baseColor = _.find(thresholds?.steps, { type: 'base' })?.color ?? '#7EB26D';
  const name = nameField ? _.get(metric, nameField, item.name) : item.name;
  const color = item.color ? item.color : baseColor;
  const isVertical = orientation === 'vertical';
  const valueText = `${item.value ?? ''}${item.unit ?? ''}`;
  const verticalValueFontSize = isVertical ? Math.max(4, Math.min(18, Math.floor((Math.max(itemWidth - 4, 1) / Math.max(getTextWidth(valueText), 1)) * 12))) : undefined;
  const gradient =
    displayMode === 'gradient' ? getGradientBackground(thresholds, minValue, maxValue, color, isVertical ? 'to top' : 'to right') : Color(color).alpha(0.2).rgb().string();

  const scopedVars = {
    '__field.name': item.name,
    '__field.value': item.value,
  };
  _.forEach(item.metric, (value, key) => {
    scopedVars[`__field.labels.${key}`] = value;
  });

  return (
    <Tooltip
      mouseEnterDelay={0.5}
      overlayClassName='ant-tooltip-max-width-600'
      title={
        <Space>
          {name}
          <Space size={2}>
            {item.value}
            {item.unit}
          </Space>
        </Space>
      }
    >
      <div
        className={classNames('renderer-bar-gauge-item', {
          'renderer-bar-gauge-item-vertical': isVertical,
          'renderer-bar-gauge-item-name-top': namePlacement === 'top',
          'renderer-bar-gauge-item-name-bottom': namePlacement === 'bottom',
        })}
        key={item.name}
        style={itemStyle}
      >
        {namePlacement !== 'hidden' && (
          <div
            className='renderer-bar-gauge-item-name'
            style={{
              width: namePlacement === 'left' && !isVertical ? (serieWidth ? `${serieWidth}%` : `${maxNameWidth + 4}px`) : undefined,
            }}
          >
            {detailUrl ? (
              <a
                target='_blank'
                href={replaceTemplateVariables(detailUrl, {
                  scopedVars: scopedVars as unknown as ScopedVariables,
                })}
              >
                {name}
              </a>
            ) : (
              name
            )}
          </div>
        )}

        <div className='renderer-bar-gauge-item-content'>
          <div className='renderer-bar-gauge-item-value'>
            <div
              className='renderer-bar-gauge-item-value-bg'
              style={{
                backgroundColor: themeMode === 'dark' ? '#20222E' : '#F6F6F6',
              }}
            />
            <div
              className='renderer-bar-gauge-item-value-color-bg'
              style={
                isVertical
                  ? {
                      color: themeMode === 'dark' ? '#fff' : '#20222E',
                      borderTop: `2px solid ${color}`,
                      background: gradient,
                      height: calculatePercentage(item.stat, minValue, maxValue) + '%',
                      width: '100%',
                    }
                  : {
                      color: themeMode === 'dark' ? '#fff' : '#20222E',
                      borderRight: `2px solid ${color}`,
                      background: gradient,
                      width: calculatePercentage(item.stat, minValue, maxValue) + '%',
                    }
              }
            />
          </div>
          {valueMode !== 'hidden' && (
            <div
              className='renderer-bar-gauge-item-value-text'
              style={{
                color: valueMode === 'text' ? (themeMode === 'dark' ? '#fff' : '#20222E') : color,
                width: isVertical ? undefined : `${maxValueWidth}px`,
                fontSize: verticalValueFontSize ? `${verticalValueFontSize}px` : undefined,
              }}
            >
              {valueText}
            </div>
          )}
        </div>
      </div>
    </Tooltip>
  );
}
