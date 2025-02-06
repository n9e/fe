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
import _ from 'lodash';
import { useSize } from 'ahooks';

import { getTextWidth } from '@/pages/dashboard/Renderer/Renderer/Hexbin/utils';
import { IRawTimeRange } from '@/components/TimeRangePicker';

import { IPanel } from '../../../types';
import getCalculatedValuesBySeries from '../../utils/getCalculatedValuesBySeries';
import { useGlobalState } from '../../../globalState';
import { getSerieTextObj } from '../../utils/getCalculatedValuesBySeries';

import { getColumnsKeys } from './utils';
import BasicDisplayMode from './BasicDisplayMode';
import LCDBars from './LCDBars';
import './style.less';

interface IProps {
  values: IPanel;
  series: any[];
  themeMode?: 'dark';
  time: IRawTimeRange;
  isPreview?: boolean;
}

const NAME_VALUE_SPACE = 10;

export default function BarGauge(props: IProps) {
  const { values, series, themeMode, time, isPreview } = props;
  const { custom, options } = values;
  const { displayMode = 'basic', calc, sortOrder = 'desc', valueField = 'Value', topn, combine_other, otherPosition = 'none' } = custom;
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
    options?.thresholds,
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
  if (sortOrder && sortOrder !== 'none') {
    calculatedValues = _.orderBy(calculatedValues, ['stat'], [sortOrder]);
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
      const otherOption = {
        id: 'other',
        name: 'Other',
        stat: sumValue,
        value: textObj?.value,
        unit: textObj?.unit,
      };
      if (otherPosition === 'top') {
        calculatedValues = _.concat([otherOption], items);
      } else if (otherPosition === 'bottom') {
        calculatedValues = _.concat(items, [otherOption]);
      } else if (otherPosition === 'none') {
        calculatedValues = _.concat(items, [otherOption]);
        if (sortOrder && sortOrder !== 'none') {
          calculatedValues = _.orderBy(calculatedValues, ['stat'], [sortOrder]);
        }
      }
    } else {
      calculatedValues = items;
    }
  }
  const minValue = options?.standardOptions?.min ?? _.minBy(calculatedValues, 'stat')?.stat ?? 0;
  const maxValue = options?.standardOptions?.max ?? _.maxBy(calculatedValues, 'stat')?.stat ?? 0;
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
      if (max > (containerSize.width - NAME_VALUE_SPACE) / 2) {
        return (containerSize.width - NAME_VALUE_SPACE) / 2;
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
    <div className='renderer-bar-gauge-container-wrapper'>
      <div className='renderer-bar-gauge-container scroll-container' ref={containerRef}>
        {displayMode === 'lcd' && containerSize?.width ? (
          <LCDBars
            values={calculatedValues}
            custom={custom}
            options={options}
            themeMode={themeMode}
            minValue={_.floor(minValue)}
            maxValue={_.ceil(maxValue)}
            time={time}
            maxNameWidth={maxNameWidth}
            maxBarWidth={containerSize.width - maxNameWidth - NAME_VALUE_SPACE}
          />
        ) : (
          <div className='renderer-bar-gauge'>
            {_.map(calculatedValues, (item) => {
              return (
                <BasicDisplayMode
                  key={item.id}
                  item={item}
                  custom={custom}
                  options={options}
                  themeMode={themeMode}
                  minValue={minValue}
                  maxValue={maxValue}
                  time={time}
                  maxNameWidth={maxNameWidth}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
