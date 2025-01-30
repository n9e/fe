import React, { CSSProperties } from 'react';
import { Tooltip, Space } from 'antd';
import _ from 'lodash';
import Color from 'color';

import { IRawTimeRange } from '@/components/TimeRangePicker';

import { IOptions, IBarGaugeStyles } from '../../../../types';
import { useGlobalState } from '../../../../globalState';
import { getDetailUrl } from '../../../utils/replaceExpressionDetail';
import { getSerieTextObj } from '../../../utils/getCalculatedValuesBySeries';

interface Props {
  item: any;
  custom: IBarGaugeStyles;
  options: IOptions;
  themeMode?: 'dark';
  minValue: number;
  maxValue: number;
  time: IRawTimeRange;
  maxNameWidth: number;
  maxBarWidth: number;
}

const CELL_WIDTH = 10;
const CELL_HEIGHT = 16;
const CELL_SPACING = 2;

export default function LCDBar(props: Props) {
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const { item, custom, options, themeMode, minValue, maxValue, time, maxNameWidth, maxBarWidth } = props;
  const { stat, metric } = item;
  const { serieWidth, detailUrl, nameField, valueMode = 'color' } = custom as IBarGaugeStyles;
  const name = nameField ? _.get(metric, nameField, item.name) : item.name;
  const valueRange = maxValue - minValue;
  const cellCount = Math.floor(maxBarWidth / (CELL_WIDTH + CELL_SPACING));
  const cells: JSX.Element[] = [];

  for (let i = 0; i < cellCount; i++) {
    const currentValue = minValue + (valueRange / cellCount) * i;
    const textObj = getSerieTextObj(
      currentValue,
      {
        unit: options?.standardOptions?.util,
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

  return (
    <Tooltip
      mouseEnterDelay={0.5}
      title={
        <Space>
          {item.name}
          {item.value}
          {item.unit}
        </Space>
      }
    >
      <div key={item.id} className='renderer-bar-gauge-lcd-item'>
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
        <div className='renderer-bar-gauge-lcd-item-cells-wrapper'>{cells}</div>
        {valueMode === 'color' && (
          <div
            className='renderer-bar-gauge-lcd-item-value'
            style={{
              color: item.color,
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
