import React from 'react';
import _ from 'lodash';
import Color from 'color';

import { IOptions } from '@/pages/dashboard/types';
import { getSerieTextObj } from '@/pages/dashboard/Renderer/utils/getCalculatedValuesBySeries';

import { TextObject } from '../types';

interface Props {
  maxFieldTextWidth: number;
  item: TextObject;
  valueMode: 'color' | 'text' | 'hidden';
  options: IOptions;
  minValue: number;
  maxValue: number;
  maxBarWidth: number;
}

const CELL_WIDTH = 10;
const CELL_HEIGHT = 23;
const CELL_SPACING = 2;

export default function LCDBar(props: Props) {
  const { maxFieldTextWidth, item, valueMode, options, minValue, maxValue, maxBarWidth } = props;
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
    const cellStyles: any = {};
    cellStyles.width = `${CELL_WIDTH}px`;
    cellStyles.height = `${CELL_HEIGHT}px`;
    cellStyles.marginRight = `${CELL_SPACING}px`;

    if (currentValue <= item.stat) {
      cellStyles.backgroundColor = textObj.color;
    } else {
      cellStyles.backgroundColor = Color(textObj.color).alpha(0.3).string();
    }
    cells.push(<div key={i.toString()} style={cellStyles} className='renderer-table-ng-bar-gauge-lcd-item-cells' />);
  }

  return (
    <div className='renderer-table-ng-bar-gauge-lcd'>
      <div className='renderer-table-ng-bar-gauge-lcd-item'>
        <div className='renderer-table-ng-bar-gauge-lcd-item-cells-wrapper'>{cells}</div>
        {valueMode !== 'hidden' && (
          <div
            className='renderer-table-ng-bar-gauge-lcd-item-value'
            style={{
              color: valueMode === 'color' ? item.color : 'inherit',
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
