import React, { useRef, useEffect } from 'react';
import _ from 'lodash';
import TsGraph from '@fc-plot/ts-graph';
import { getSerieTextObj } from '../../utils/getCalculatedValuesBySeries';

const UNIT_PADDING = 4;
const getTextColor = (color, colorMode) => {
  return colorMode === 'value' ? color : '#fff';
};

export default function StatItem(props) {
  const chartEleRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<TsGraph>(null);
  const { textMode, colorMode, textSize, isFullSizeBackground, valueField = 'Value', graphMode, serie, options, style, width, height, minFontSize } = props;
  let item = props.item;

  if (valueField !== 'Value') {
    const value = _.get(item, ['metric', valueField]);
    if (!_.isNaN(_.toNumber(value))) {
      const result = getSerieTextObj(
        value,
        {
          unit: options?.standardOptions?.util,
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

  const color = item.color;
  const backgroundColor = colorMode === 'background' ? color : 'transparent';
  const headerFontSize = textSize?.title ?? minFontSize?.name;
  const valueAndUnitFontSize = textSize?.value ?? minFontSize?.value;

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
        ykeyFormatter: (value) => Number(value),
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
          {textMode === 'valueAndName' && (
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
        </div>
      </div>
    </div>
  );
}
