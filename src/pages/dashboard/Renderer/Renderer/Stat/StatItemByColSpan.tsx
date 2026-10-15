import React, { useRef } from 'react';
import _ from 'lodash';
import { useSize } from 'ahooks';
import { getSerieTextObj } from '../../utils/getCalculatedValuesBySeries';
import { getMaxFontSize } from '../../utils/getTextWidth';
import StatGraph from './StatGraph';
import type { StatSparklinePoint } from './statGraphData';
import type { IOptions } from '../../../types';

const MIN_SIZE = 12;
const UNIT_PADDING = 4;
const getTextColor = (color: string | undefined, colorMode: string) => {
  return colorMode === 'value' ? color : '#fff';
};

interface StatItemData {
  name?: string;
  metric: Record<string, string | number | undefined>;
  value?: string | number;
  unit?: string;
  color?: string;
}
interface StatItemProps {
  item: StatItemData;
  idx?: number;
  textMode: string;
  colorMode: string;
  textSize?: { title?: number; value?: number };
  isFullSizeBackground: boolean;
  valueField?: string;
  graphMode: string;
  serie?: { data?: StatSparklinePoint[] };
  options: IOptions;
  style?: React.CSSProperties;
}

export default function StatItem(props: StatItemProps) {
  const ele = useRef(null);
  const eleSize = useSize(ele);
  const { textMode, colorMode, textSize, isFullSizeBackground, valueField = 'Value', graphMode, serie, options, style } = props;
  let item = props.item;

  if (valueField !== 'Value') {
    const value = _.get(item, ['metric', valueField]);
    if (!_.isNaN(_.toNumber(value))) {
      const result = getSerieTextObj(
        value,
        {
          unit: options?.standardOptions?.unit,
          decimals: options?.standardOptions?.decimals,
          dateFormat: options?.standardOptions?.dateFormat,
        },
        options?.valueMappings,
        options?.thresholds,
      );
      item.value = result?.value as string | number | undefined;
      item.unit = result?.unit;
      item.color = result?.color;
    } else {
      item.value = value;
    }
  }

  const color = item.color;
  const backgroundColor = colorMode === 'background' ? color : 'transparent';
  const valueAndUnit = `${item.value} ${item.unit}`;
  let headerFontSize = textSize?.title ?? MIN_SIZE;
  let valueAndUnitFontSize = textSize?.value ?? MIN_SIZE;
  if (eleSize) {
    if (!textSize?.title) {
      headerFontSize = getMaxFontSize(item.name as string, (eleSize?.width - 20) * 0.8, eleSize?.height / 2 / 3);
    }
    if (!textSize?.value) {
      valueAndUnitFontSize = getMaxFontSize(valueAndUnit, (eleSize?.width - 20) * 0.8, (eleSize?.height / 2 / 3) * 2);
    }
  }

  return (
    <div
      className='renderer-stat-item'
      ref={ele}
      style={{
        ...style,
        backgroundColor: isFullSizeBackground ? 'transparent' : backgroundColor,
      }}
    >
      <div style={{ width: '100%' }}>
        <StatGraph serie={serie} color={color} colorMode={colorMode} graphMode={graphMode} />
        <div className='renderer-stat-item-content'>
          {(textMode === 'valueAndName' || textMode === 'name') && (
            <div
              className='renderer-stat-header'
              style={{
                fontSize: headerFontSize > 100 ? 100 : headerFontSize,
                color: colorMode === 'background' ? '#fff' : 'unset',
              }}
            >
              {item.name}
            </div>
          )}
          {(textMode === 'valueAndName' || textMode === 'value') && (
            <div
              className='renderer-stat-value'
              style={{
                color: getTextColor(color, colorMode),
                fontSize: valueAndUnitFontSize,
              }}
            >
              {item.value}
              <span style={{ fontSize: valueAndUnitFontSize * 0.6, paddingLeft: UNIT_PADDING }}>{item.unit}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
