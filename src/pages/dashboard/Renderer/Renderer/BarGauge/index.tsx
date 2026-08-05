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

import { IPanel, IBarGaugeStyles } from '../../../types';
import getCalculatedValuesBySeries, { getSerieTextObj } from '../../utils/getCalculatedValuesBySeries';
import type { CalculatedSeries, CalculatedSeriesValue } from '../../utils/getCalculatedValuesBySeries';
import { useGlobalState } from '../../../globalState';
import useStableValue from '../../../hooks/useStableValue';

import { getColumnsKeys, BarGaugeValue } from './utils';
import BasicDisplayMode from './BasicDisplayMode';
import LCDBars from './LCDBars';
import './style.less';

interface IProps {
  values: IPanel;
  series: CalculatedSeries[];
  themeMode?: 'dark';
  isPreview?: boolean;
  dataRevision?: number;
}

const NAME_VALUE_SPACE = 10;

export default function BarGauge(props: IProps) {
  const { values, series, themeMode, isPreview } = props;
  const dataDependency = props.dataRevision ?? series;
  const { custom, options } = values;
  const stableCustom = useStableValue(custom);
  const stableOptions = useStableValue(options);
  // custom 为 JsonObject（宽类型），按 bar gauge 面板实际使用的结构收窄
  const {
    displayMode = 'basic',
    calc,
    sortOrder = 'desc',
    valueField = 'Value',
    topn,
    combine_other,
    otherPosition = 'none',
    nameField,
  } = custom as {
    displayMode?: 'basic' | 'lcd';
    calc?: string;
    sortOrder?: 'none' | 'asc' | 'desc';
    valueField?: string;
    topn?: number;
    combine_other?: boolean;
    otherPosition?: 'top' | 'bottom' | 'none';
    nameField?: string;
  };
  const containerRef = useRef(null);
  const containerSize = useSize(containerRef);
  const [statFields, setStatFields] = useGlobalState('statFields');
  let calculatedValues = useMemo(
    () =>
      getCalculatedValuesBySeries(
        series,
        calc as string,
        {
          unit: options?.standardOptions?.unit,
          decimals: options?.standardOptions?.decimals,
          dateFormat: options?.standardOptions?.dateFormat,
        },
        options?.valueMappings,
        options?.thresholds,
      ),
    [dataDependency, stableCustom, stableOptions],
  );
  if (valueField !== 'Value') {
    calculatedValues = _.map(calculatedValues, (item) => {
      const itemClone = _.cloneDeep(item);
      const value = _.get(item, ['metric', valueField]) as string | number | undefined;
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
        itemClone.stat = _.toNumber(value);
        itemClone.value = result?.value ?? itemClone.value;
        itemClone.unit = result?.unit ?? itemClone.unit;
        itemClone.color = result?.color;
      } else {
        itemClone.stat = value as string | number;
        itemClone.value = value ?? itemClone.value;
      }
      return itemClone;
    });
  }
  if (sortOrder && sortOrder !== 'none') {
    calculatedValues = _.orderBy(calculatedValues, ['stat'], [sortOrder]);
  }

  if (topn) {
    const items = _.take(calculatedValues, topn as number);
    if (combine_other) {
      const sumValue = _.sumBy(_.slice(calculatedValues, topn as number), (item) => {
        return item.stat as number;
      });
      const textObj = getSerieTextObj(
        sumValue,
        {
          unit: options?.standardOptions?.unit,
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
        calculatedValues = _.concat([otherOption as CalculatedSeriesValue], items);
      } else if (otherPosition === 'bottom') {
        calculatedValues = _.concat(items, [otherOption as CalculatedSeriesValue]);
      } else if (otherPosition === 'none') {
        calculatedValues = _.concat(items, [otherOption as CalculatedSeriesValue]);
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
        const name = nameField ? _.get(metric, nameField, item.name) : item.name;
        const nameWidth = getTextWidth(name ?? '');
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
  }, [dataDependency, stableCustom, stableOptions, containerSize]);

  useEffect(() => {
    if (isPreview) {
      setStatFields(getColumnsKeys(calculatedValues as unknown as CalculatedSeries[]));
    }
  }, [isPreview, dataDependency, stableCustom, stableOptions]);

  return (
    <div className='renderer-bar-gauge-container-wrapper'>
      <div className='renderer-bar-gauge-container scroll-container' ref={containerRef}>
        {displayMode === 'lcd' && containerSize?.width ? (
          <LCDBars
            values={calculatedValues as BarGaugeValue[]}
            custom={custom as unknown as IBarGaugeStyles}
            options={options}
            themeMode={themeMode}
            minValue={_.floor(minValue as number)}
            maxValue={_.ceil(maxValue as number)}
            maxNameWidth={maxNameWidth}
            maxBarWidth={containerSize.width - maxNameWidth - NAME_VALUE_SPACE}
          />
        ) : (
          <div className='renderer-bar-gauge'>
            {_.map(calculatedValues, (item) => {
              return (
                <BasicDisplayMode
                  key={item.id}
                  item={item as BarGaugeValue}
                  custom={custom as unknown as IBarGaugeStyles}
                  options={options}
                  themeMode={themeMode}
                  minValue={minValue as number}
                  maxValue={maxValue as number}
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
