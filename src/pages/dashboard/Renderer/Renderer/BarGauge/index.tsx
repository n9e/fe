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
import React, { useRef, useEffect, useMemo } from 'react';
import { Tooltip } from 'antd';
import _ from 'lodash';
import Color from 'color';
import { useSize } from 'ahooks';
import { getTextWidth } from '@/pages/dashboard/Renderer/Renderer/Hexbin/utils';
import { IPanel, IBarGaugeStyles } from '../../../types';
import getCalculatedValuesBySeries from '../../utils/getCalculatedValuesBySeries';
import { getDetailUrl } from '../../utils/replaceExpressionDetail';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { useGlobalState } from '../../../globalState';
import { getSerieTextObj } from '../../utils/getCalculatedValuesBySeries';
import './style.less';

interface IProps {
  values: IPanel;
  series: any[];
  themeMode?: 'dark';
  time: IRawTimeRange;
  isPreview?: boolean;
}

const getColumnsKeys = (data: any[]) => {
  const keys = _.reduce(
    data,
    (result, item) => {
      return _.union(result, _.keys(item.metric));
    },
    [],
  );
  return _.uniq(keys);
};

function Item(props) {
  const { item, custom, themeMode, maxValue, time, maxNameWidth } = props;
  const metric = item.metric;
  const { baseColor = '#FF656B', displayMode = 'basic', serieWidth, detailUrl, nameField } = custom as IBarGaugeStyles;
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
    <Tooltip title={item.name}>
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

export default function BarGauge(props: IProps) {
  const { values, series, themeMode, time, isPreview } = props;
  const { custom, options } = values;
  const { calc, maxValue, sortOrder = 'desc', valueField = 'Value', topn, combine_other } = custom;
  const containerRef = useRef(null);
  const containerSize = useSize(containerRef);
  const [statFields, setStatFields] = useGlobalState('statFields');
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
  if (valueField !== 'Value') {
    calculatedValues = _.map(calculatedValues, (item) => {
      const itemClone = _.cloneDeep(item);
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
        itemClone.stat = _.toNumber(value);
        itemClone.value = result?.value;
        itemClone.unit = result?.unit;
        itemClone.color = result?.color;
      } else {
        itemClone.stat = value;
        itemClone.value = value;
      }
      return itemClone;
    });
  }
  if (topn) {
    const items = _.take(calculatedValues, topn);
    if (combine_other) {
      const sumValue = _.sumBy(_.slice(calculatedValues, topn), (item) => {
        return item.stat;
      });
      const textObj = getSerieTextObj(
        sumValue,
        {
          unit: options?.standardOptions?.util,
          decimals: options?.standardOptions?.decimals,
          dateFormat: options?.standardOptions?.dateFormat,
        },
        options?.valueMappings,
      );
      calculatedValues = _.concat(items, [
        {
          id: 'other',
          name: 'Other',
          stat: sumValue,
          value: textObj?.value,
          unit: textObj?.unit,
        },
      ]);
    } else {
      calculatedValues = items;
    }
  }
  if (sortOrder && sortOrder !== 'none') {
    calculatedValues = _.orderBy(calculatedValues, ['stat'], [sortOrder]);
  }
  const curMaxValue = maxValue !== undefined && maxValue !== null ? maxValue : _.maxBy(calculatedValues, 'stat')?.stat || 0;
  const maxNameWidth = useMemo(() => {
    if (containerSize) {
      let max = 0;
      _.forEach(calculatedValues, (item) => {
        const { metric } = item;
        const { nameField } = custom;
        const name = nameField ? _.get(metric, nameField, item.name) : item.name;
        const nameWidth = getTextWidth(name);
        if (nameWidth > max) {
          max = nameWidth;
        }
      });
      if (max > (containerSize.width - 10) / 2) {
        return (containerSize.width - 10) / 2;
      }
      return max;
    }
    return 0;
  }, [calculatedValues, containerSize]);

  useEffect(() => {
    if (isPreview) {
      setStatFields(getColumnsKeys(calculatedValues));
    }
  }, [isPreview, JSON.stringify(calculatedValues)]);

  return (
    <div className='renderer-bar-gauge-container'>
      <div className='renderer-bar-gauge scroll-container' ref={containerRef}>
        {_.map(calculatedValues, (item) => {
          return <Item key={item.id} item={item} custom={custom} themeMode={themeMode} maxValue={curMaxValue} time={time} maxNameWidth={maxNameWidth} />;
        })}
      </div>
    </div>
  );
}
