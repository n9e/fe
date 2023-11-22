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
import React, { useEffect, useRef } from 'react';
import _ from 'lodash';
import { useSize } from 'ahooks';
import { corelib, extend, Runtime } from '@antv/g2';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { IPanel } from '../../../types';
import getCalculatedValuesBySeries from '../../utils/getCalculatedValuesBySeries';
import { useGlobalState } from '../../../globalState';
import './style.less';

const Chart = extend(Runtime, corelib());

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

export default function Heatmap(props: IProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useSize(containerRef);
  const chartRef = useRef<any>();
  const { values, series, themeMode, isPreview } = props;
  const { custom, options } = values;
  const { calc, xAxisField, yAxisField, valueField, scheme } = custom;
  const calculatedValues = getCalculatedValuesBySeries(
    series,
    calc,
    {
      unit: options?.standardOptions?.util,
      decimals: options?.standardOptions?.decimals,
      dateFormat: options?.standardOptions?.dateFormat,
    },
    options?.valueMappings,
  );
  const [statFields, setStatFields] = useGlobalState('statFields');
  const render = () => {
    if (!chartRef.current) return;
    let data: any[] = [];
    if (valueField !== 'Value') {
      data = _.map(calculatedValues, 'metric');
    } else {
      data = _.map(calculatedValues, (item) => {
        return {
          ...item.metric,
          Value: item.stat,
        };
      });
    }
    chartRef.current
      .theme({
        type: themeMode === 'dark' ? 'dark' : 'light',
        view: {
          viewFill: 'transparent',
        },
      })
      .cell()
      .data(data)
      .transform({ type: 'group', color: 'max' })
      .encode('x', xAxisField)
      .encode('y', yAxisField)
      .encode('color', valueField)
      .scale('color', { palette: scheme || 'Blues' })
      .label({
        text: valueField,
        position: 'inside',
        transform: [
          {
            type: 'contrastReverse',
          },
        ],
      })
      .axis('x', {
        title: false,
      })
      .axis('y', {
        title: false,
      })
      .style('inset', 0.5)
      .legend('color', {
        title: false,
        layout: {
          justifyContent: 'flex-end',
        },
      })
      .animate('enter', { type: 'fadeIn' });

    chartRef.current.render();
  };

  useEffect(() => {
    if (isPreview) {
      setStatFields(getColumnsKeys(calculatedValues));
    }
  }, [isPreview, JSON.stringify(calculatedValues)]);

  useEffect(() => {
    if (!containerRef.current || !containerSize || !containerSize?.height) return;
    if (chartRef.current) {
      chartRef.current.width = containerSize.width;
      chartRef.current.height = containerSize.height;
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
  }, [themeMode, JSON.stringify(custom), JSON.stringify(_.map(calculatedValues, 'metric'))]);

  return <div className='renderer-heatmap-container' style={{ height: '100%' }} ref={containerRef} />;
}
