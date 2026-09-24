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
import React, { CSSProperties, useRef, useEffect, useMemo } from 'react';
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
const DEFAULT_MIN_VIZ_WIDTH = 40;
const DEFAULT_MIN_VIZ_HEIGHT = 16;
const DEFAULT_MAX_VIZ_HEIGHT = 300;

export default function BarGauge(props: IProps) {
  const { values, series, themeMode, isPreview } = props;
  const dataDependency = props.dataRevision ?? series;
  const { custom, options } = values;
  const stableCustom = useStableValue(custom);
  const stableOptions = useStableValue(options);
  // custom 为 JsonObject（宽类型），按 bar gauge 面板实际使用的结构收窄
  const {
    displayMode = 'basic',
    showMode = 'calculate',
    fields,
    limit,
    calc,
    sortOrder = 'desc',
    valueField = 'Value',
    topn,
    combine_other,
    otherPosition = 'none',
    nameField,
    orientation = 'horizontal',
    namePlacement = 'auto',
    sizing = 'auto',
    minVizWidth,
    minVizHeight,
    maxVizHeight,
    valueMode = 'color',
  } = custom as {
    displayMode?: 'basic' | 'gradient' | 'lcd';
    showMode?: 'calculate' | 'allValues';
    fields?: string[];
    limit?: number;
    calc?: string;
    sortOrder?: 'none' | 'asc' | 'desc';
    valueField?: string;
    topn?: number;
    combine_other?: boolean;
    otherPosition?: 'top' | 'bottom' | 'none';
    nameField?: string;
    orientation?: 'auto' | 'horizontal' | 'vertical';
    namePlacement?: 'auto' | 'top' | 'bottom' | 'left' | 'hidden';
    sizing?: 'auto' | 'manual';
    minVizWidth?: number;
    minVizHeight?: number;
    maxVizHeight?: number;
    valueMode?: 'color' | 'text' | 'hidden';
  };
  const containerRef = useRef(null);
  const containerSize = useSize(containerRef);
  const [statFields, setStatFields] = useGlobalState('statFields');
  let calculatedValues = useMemo(
    () =>
      getCalculatedValuesBySeries(
        series,
        showMode === 'allValues' ? 'origin' : (calc as string),
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
  if (showMode === 'allValues' && Array.isArray(fields) && fields.length > 0 && !_.includes(fields, 'Value')) {
    calculatedValues = _.filter(calculatedValues, (item) => _.includes(fields, item.name) || _.includes(fields, item.metric.__name__));
  }
  if (showMode === 'allValues' && limit) {
    calculatedValues = _.take(calculatedValues, limit);
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
        options?.thresholds,
      );
      const otherOption = {
        id: 'other',
        name: 'Other',
        metric: {},
        stat: sumValue,
        value: textObj?.value,
        unit: textObj?.unit,
        color: textObj?.color,
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
  const resolvedOrientation: 'horizontal' | 'vertical' =
    orientation === 'auto' ? (containerSize && containerSize.width > containerSize.height ? 'vertical' : 'horizontal') : orientation;
  const resolvedNamePlacement: 'top' | 'bottom' | 'left' | 'hidden' =
    resolvedOrientation === 'vertical' ? (namePlacement === 'hidden' ? 'hidden' : 'bottom') : namePlacement === 'auto' || namePlacement === 'bottom' ? 'left' : namePlacement;
  const itemSpacing = displayMode === 'lcd' ? 2 : 10;
  const itemCount = Math.max(calculatedValues.length, 1);
  const horizontalNameHeight = resolvedOrientation === 'horizontal' && (resolvedNamePlacement === 'top' || resolvedNamePlacement === 'bottom') ? 20 : 0;
  const automaticBarSize =
    resolvedOrientation === 'vertical'
      ? Math.max(DEFAULT_MIN_VIZ_WIDTH, Math.floor(((containerSize?.width ?? 0) - itemSpacing * (itemCount - 1)) / itemCount))
      : Math.min(
          DEFAULT_MAX_VIZ_HEIGHT,
          Math.max(DEFAULT_MIN_VIZ_HEIGHT, Math.floor(((containerSize?.height ?? 0) - itemSpacing * (itemCount - 1) - horizontalNameHeight * itemCount) / itemCount)),
        );
  const manualMinHeight = minVizHeight ?? DEFAULT_MIN_VIZ_HEIGHT;
  const barSize =
    sizing !== 'manual'
      ? automaticBarSize
      : resolvedOrientation === 'vertical'
      ? Math.max(automaticBarSize, minVizWidth ?? DEFAULT_MIN_VIZ_WIDTH)
      : Math.min(Math.max(automaticBarSize, manualMinHeight), Math.max(maxVizHeight ?? DEFAULT_MAX_VIZ_HEIGHT, manualMinHeight));
  const itemStyle: CSSProperties =
    resolvedOrientation === 'vertical'
      ? { width: `${barSize}px`, minWidth: `${barSize}px` }
      : { height: `${barSize + horizontalNameHeight}px`, minHeight: `${barSize + horizontalNameHeight}px` };
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
  const maxValueWidth = useMemo(() => {
    if (valueMode === 'hidden') return 0;
    return _.reduce(calculatedValues, (max, item) => Math.max(max, getTextWidth(`${item.value ?? ''}${item.unit ?? ''}`)), 0) + 4;
  }, [dataDependency, stableCustom, stableOptions, valueMode]);

  useEffect(() => {
    if (isPreview) {
      setStatFields(getColumnsKeys(calculatedValues as unknown as CalculatedSeries[]));
    }
  }, [isPreview, dataDependency, stableCustom, stableOptions]);

  return (
    <div className='renderer-bar-gauge-container-wrapper'>
      <div className='renderer-bar-gauge-container best-looking-scroll' ref={containerRef}>
        {displayMode === 'lcd' && resolvedOrientation === 'horizontal' && containerSize?.width ? (
          <LCDBars
            values={calculatedValues as BarGaugeValue[]}
            custom={custom as unknown as IBarGaugeStyles}
            options={options}
            themeMode={themeMode}
            minValue={_.floor(minValue as number)}
            maxValue={_.ceil(maxValue as number)}
            maxNameWidth={maxNameWidth}
            maxValueWidth={maxValueWidth}
            maxBarWidth={Math.max(1, containerSize.width - (resolvedNamePlacement === 'left' ? maxNameWidth + 4 : 0) - maxValueWidth - NAME_VALUE_SPACE * 2)}
            namePlacement={resolvedNamePlacement}
          />
        ) : (
          <div className={`renderer-bar-gauge renderer-bar-gauge-${resolvedOrientation} best-looking-scroll`} style={{ gap: `${itemSpacing}px` }}>
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
                  maxValueWidth={maxValueWidth}
                  itemWidth={barSize}
                  orientation={resolvedOrientation}
                  namePlacement={resolvedNamePlacement}
                  itemStyle={itemStyle}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
