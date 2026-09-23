import React, { CSSProperties } from 'react';
import { Tooltip, Space } from 'antd';
import classNames from 'classnames';
import _ from 'lodash';
import Color from 'color';

import { useReplaceTemplateVariables } from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';

import { IOptions, IBarGaugeStyles, ScopedVariables } from '../../../../types';
import { getSerieTextObj } from '../../../utils/getCalculatedValuesBySeries';
import type { BarGaugeValue } from '../utils';

interface Props {
  item: BarGaugeValue;
  custom: IBarGaugeStyles;
  options: IOptions;
  themeMode?: 'dark';
  minValue: number;
  maxValue: number;
  maxNameWidth: number;
  maxValueWidth: number;
  maxBarWidth: number;
  namePlacement?: 'top' | 'bottom' | 'left' | 'hidden';
}

const CELL_WIDTH = 10;
const CELL_HEIGHT = 16;
const CELL_SPACING = 2;

export default function LCDBar(props: Props) {
  const replaceTemplateVariables = useReplaceTemplateVariables();
  const { item, custom, options, themeMode, minValue, maxValue, maxNameWidth, maxValueWidth, maxBarWidth, namePlacement = 'left' } = props;
  const { stat, metric } = item;
  const { serieWidth, detailUrl, nameField, valueMode = 'color' } = custom as IBarGaugeStyles;
  const name = nameField ? _.get(metric, nameField, item.name) : item.name;
  const valueRange = maxValue - minValue;
  const cellCount = Math.max(1, Math.floor(maxBarWidth / (CELL_WIDTH + CELL_SPACING)));
  const cells: JSX.Element[] = [];

  for (let i = 0; i < cellCount; i++) {
    const currentValue = minValue + (valueRange / cellCount) * i;
    const textObj = getSerieTextObj(
      currentValue,
      {
        unit: options?.standardOptions?.unit,
        decimals: options?.standardOptions?.decimals,
        dateFormat: options?.standardOptions?.dateFormat,
      },
      options?.valueMappings,
      options?.thresholds,
      [minValue, maxValue],
    );
    const cellStyles: CSSProperties = {};
    cellStyles.width = `${CELL_WIDTH}px`;
    cellStyles.height = `${CELL_HEIGHT}px`;
    cellStyles.marginRight = `${CELL_SPACING}px`;

    if (currentValue <= stat) {
      cellStyles.backgroundColor = textObj.color;
    } else {
      cellStyles.backgroundColor = Color(textObj.color).alpha(0.3).string();
    }
    cells.push(<div key={i.toString()} style={cellStyles} className='renderer-bar-gauge-lcd-item-cells' />);
  }

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
        key={item.id}
        className={classNames('renderer-bar-gauge-lcd-item', {
          'renderer-bar-gauge-item-name-top': namePlacement === 'top',
          'renderer-bar-gauge-item-name-bottom': namePlacement === 'bottom',
        })}
      >
        {namePlacement !== 'hidden' && (
          <div
            className='renderer-bar-gauge-item-name'
            style={{
              width: namePlacement === 'left' ? (serieWidth ? `${serieWidth}%` : `${maxNameWidth + 4}px`) : undefined,
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
        <div className='renderer-bar-gauge-lcd-item-cells-wrapper'>{cells}</div>
        {valueMode !== 'hidden' && (
          <div
            className='renderer-bar-gauge-lcd-item-value'
            style={{
              color: valueMode === 'text' ? (themeMode === 'dark' ? '#fff' : '#20222E') : item.color,
              width: `${maxValueWidth}px`,
            }}
          >
            {item.value}
            {item.unit}
          </div>
        )}
      </div>
    </Tooltip>
  );
}
