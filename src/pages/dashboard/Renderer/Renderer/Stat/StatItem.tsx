import React from 'react';
import _ from 'lodash';
import { IOptions, IOverride, IStandardOptions, IValueMapping, IThresholds } from '../../../types';
import { getSerieTextObj, getMappedTextObj } from '../../utils/getCalculatedValuesBySeries';
import getOverridePropertiesByName from '../../utils/getOverridePropertiesByName';
import StatGraph from './StatGraph';
import type { StatSparklinePoint } from './statGraphData';

const UNIT_PADDING = 4;
interface StatItemData {
  name?: string;
  metric: Record<string, string | number | undefined>;
  fields?: { refId?: string };
  stat?: number | string | null;
  value?: React.ReactNode;
  unit?: string;
  color?: string;
}

interface StatFontSize {
  title?: number;
  value?: number;
}

const getTextColor = (color: string | undefined, colorMode: string) => {
  return colorMode === 'value' ? color : '#fff';
};

interface Props {
  item: StatItemData;
  textMode: string;
  colorMode: string;
  textSize?: StatFontSize;
  isFullSizeBackground: boolean;
  valueField: string;
  graphMode: string;
  serie?: { data?: StatSparklinePoint[] };
  options: IOptions;
  style?: React.CSSProperties;
  // minFontSize 的键是 name/value（与 textSize 的 title/value 不同）
  minFontSize?: { name?: number; value?: number };
  overrides: IOverride[];
}

export default function StatItem(props: Props) {
  const { textMode, colorMode, textSize, isFullSizeBackground, valueField = 'Value', graphMode, serie, options, style, minFontSize, overrides } = props;
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
      item.value = result?.value;
      item.unit = result?.unit;
      item.color = result?.color;
    } else {
      item.value = value;
    }
  }

  const overrideProps = getOverridePropertiesByName(overrides, 'byFrameRefID', item.fields?.refId);
  if (!_.isEmpty(overrideProps)) {
    const textObj = getSerieTextObj(
      item?.stat,
      overrideProps?.standardOptions as IStandardOptions | undefined,
      overrideProps?.valueMappings as IValueMapping[] | undefined,
      overrideProps?.thresholds as IThresholds | undefined,
    );
    item.name = getMappedTextObj(item.name as string, overrideProps?.valueMappings as IValueMapping[] | undefined)?.text;
    item.value = textObj.value;
    item.unit = textObj.unit;
    item.color = textObj.color;
  }

  const color = item.color;
  const backgroundColor = colorMode === 'background' ? color : 'transparent';
  const headerFontSize = textSize?.title ?? minFontSize?.name ?? 12;
  const valueAndUnitFontSize = textSize?.value ?? minFontSize?.value ?? 12;

  return (
    <div
      className='renderer-stat-item'
      style={{
        ...style,
        backgroundColor: isFullSizeBackground ? 'transparent' : backgroundColor,
      }}
    >
      <div style={{ width: '100%' }}>
        <StatGraph serie={serie} color={color} colorMode={colorMode} graphMode={graphMode} />
        <div className='renderer-stat-item-content'>
          {item.name && (textMode === 'valueAndName' || textMode === 'name') && (
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
