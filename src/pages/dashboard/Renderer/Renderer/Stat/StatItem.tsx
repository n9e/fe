import React, { useRef, useEffect } from 'react';
import _ from 'lodash';
import TsGraph from '@fc-plot/ts-graph';
import { IOptions, IOverride, IStandardOptions, IValueMapping, IThresholds } from '../../../types';
import { getSerieTextObj, getMappedTextObj } from '../../utils/getCalculatedValuesBySeries';
import getOverridePropertiesByName from '../../utils/getOverridePropertiesByName';

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
  serie: unknown;
  options: IOptions;
  style?: React.CSSProperties;
  // minFontSize 的键是 name/value（与 textSize 的 title/value 不同）
  minFontSize?: { name?: number; value?: number };
  overrides: IOverride[];
}

export default function StatItem(props: Props) {
  const chartEleRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<TsGraph>(null);
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

  useEffect(() => {
    if (chartEleRef.current) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
      chartRef.current = new TsGraph({
        timestamp: 'X',
        xkey: 0,
        ykey: 1,
        ykey2: 2,
        ykeyFormatter: (value: number | string) => Number(value),
        chart: {
          renderTo: chartEleRef.current,
          height: chartEleRef.current.clientHeight,
          marginTop: 0,
          marginRight: 0,
          marginBottom: 0,
          marginLeft: 0,
          colors: [colorMode === 'background' ? 'rgba(255, 255, 255, 0.5)' : color],
        },
        series: [serie],
        line: {
          width: 1,
        },
        xAxis: {
          visible: false,
        },
        yAxis: {
          visible: false,
        },
        area: {
          opacity: 0.2,
        },
      });
    }
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [colorMode, graphMode]);

  return (
    <div
      className='renderer-stat-item'
      style={{
        ...style,
        backgroundColor: isFullSizeBackground ? 'transparent' : backgroundColor,
      }}
    >
      <div style={{ width: '100%' }}>
        {graphMode === 'area' && (
          <div className='renderer-stat-item-graph'>
            <div ref={chartEleRef} style={{ height: '100%', width: '100%' }} />
          </div>
        )}
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
