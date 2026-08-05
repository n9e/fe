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
import React, { useEffect, useMemo, useRef } from 'react';
import _ from 'lodash';
import { useSize } from 'ahooks';
import { corelib, extend, Runtime } from '@antv/g2';

import { IPanel } from '../../../types';
import getCalculatedValuesBySeries from '../../utils/getCalculatedValuesBySeries';
import type { CalculatedSeries } from '../../utils/getCalculatedValuesBySeries';
import valueFormatter from '../../utils/valueFormatter';
import { useGlobalState } from '../../../globalState';
import useStableValue from '../../../hooks/useStableValue';
import './style.less';

const Chart = extend(Runtime, corelib());

interface IProps {
  values: IPanel;
  series: CalculatedSeries[];
  themeMode?: 'dark';
  isPreview?: boolean;
  dataRevision?: number;
}

type ChartRow = Record<string, string | number | undefined>;

const getColumnsKeys = (data: Array<{ metric: Record<string, string> }>) => {
  const keys = _.reduce(
    data,
    (result, item) => {
      return _.union(result, _.keys(item.metric));
    },
    [],
  );
  return _.uniq(keys);
};

export default function Bar(props: IProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useSize(containerRef);
  const chartRef = useRef<InstanceType<typeof Chart>>();
  const { values, series, themeMode, isPreview } = props;
  const dataDependency = props.dataRevision ?? series;
  const { custom, options } = values;
  const stableCustom = useStableValue(custom);
  const stableOptions = useStableValue(options);
  // custom 为 JsonObject（宽类型），按 bar chart 面板实际使用的结构收窄
  const { calc, xAxisField, yAxisField, colorField, barMaxWidth } = custom as {
    calc?: string;
    xAxisField?: string;
    yAxisField?: string;
    colorField?: string;
    barMaxWidth?: number;
  };
  const calculatedValues = useMemo(
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
      ),
    [dataDependency, stableCustom, stableOptions],
  );
  const [statFields, setStatFields] = useGlobalState('statFields');
  const render = () => {
    if (!chartRef.current) return;
    let data: ChartRow[] = [];
    data = _.map(calculatedValues, (item) => {
      return {
        ...item.metric,
        Value: item.stat,
        Name: item.name,
      } as ChartRow;
    });
    data = _.map(
      _.groupBy(data, (item) => {
        return (item[xAxisField as string] as string) + (item[colorField as string] as string);
      }),
      (items) => {
        if (items.length === 1) {
          return items[0];
        } else {
          const yAxisFieldValues = _.map(items, (item) => {
            const val = item[yAxisField as string];
            if (_.isString(val) && !_.isNaN(_.toNumber(val))) {
              return _.toNumber(val);
            }
            return item[yAxisField as string];
          });
          const yAxisFieldValue = _.sum(yAxisFieldValues);
          return {
            ...(items[0] || {}),
            [yAxisField as string]: yAxisFieldValue,
          };
        }
      },
    );
    chartRef.current
      .theme({
        type: themeMode === 'dark' ? 'dark' : 'light',
        view: {
          viewFill: 'transparent',
        },
      })
      .interval()
      .data(data)
      .transform({ type: 'dodgeX' })
      .transform({ type: 'sortX' })
      .encode('x', xAxisField)
      .encode('y', yAxisField)
      .encode('color', colorField)
      .axis('x', {
        title: false,
      })
      .axis('y', {
        title: false,
        labelFormatter: (d: number | string) => {
          const valueObj = valueFormatter(
            {
              unit: options?.standardOptions?.unit,
              decimals: options?.standardOptions?.decimals,
              dateFormat: options?.standardOptions?.dateFormat,
            },
            d,
          );
          return valueObj.text;
        },
      })
      .tooltip({
        title: 'Name',
        items: [
          {
            channel: 'x',
          },
          {
            channel: 'y',
            valueFormatter: (d: number | string) => {
              const valueObj = valueFormatter(
                {
                  unit: options?.standardOptions?.unit,
                  decimals: options?.standardOptions?.decimals,
                  dateFormat: options?.standardOptions?.dateFormat,
                },
                d,
              );
              return valueObj.text;
            },
          },
        ],
      })
      .style('maxWidth', barMaxWidth || undefined);

    chartRef.current.render();
  };

  useEffect(() => {
    if (isPreview) {
      setStatFields(getColumnsKeys(calculatedValues as unknown as Array<{ metric: Record<string, string> }>));
    }
  }, [isPreview, dataDependency, stableCustom, stableOptions]);

  useEffect(() => {
    if (!containerRef.current || !containerSize || !containerSize?.height) return;
    if (chartRef.current) {
      chartRef.current.changeSize(containerSize.width, containerSize.height);
      chartRef.current.render();
      return;
    }
    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
    });
    chartRef.current = chart;

    render();
  }, [containerSize]);

  useEffect(() => {
    if (!containerRef.current || !chartRef.current) return;
    chartRef.current.destroy();
    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
    });
    chartRef.current = chart;
    render();
  }, [themeMode, dataDependency, stableOptions, stableCustom]);

  // 组件卸载时销毁图表实例，避免 G2 内部事件监听残留导致内存泄漏
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = undefined;
      }
    };
  }, []);

  return <div className='renderer-heatmap-container' style={{ height: '100%' }} ref={containerRef} />;
}
