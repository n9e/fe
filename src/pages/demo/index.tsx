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
import React, { useContext, useRef } from 'react';
import uPlot, { Options } from 'uplot';
import UPlotChart, { tooltipPlugin, axisBuilder, seriesBuider, cursorBuider, scalesBuilder, getStackedDataAndBands } from '@/components/UPlotChart';
import _ from 'lodash';
import Color from 'color';
import { getDataFrameAndBaseSeries } from '@/pages/dashboard/Renderer/Renderer/TimeSeriesNG';
import { hexPalette } from '@/pages/dashboard/config';
import { CommonStateContext } from '@/App';
import { data01, data02 } from './data';
import './style.less';

export default function Demo() {
  const { darkMode } = useContext(CommonStateContext);
  const xScaleRange = useRef<[number, number]>();
  let { frames: data, baseSeries } = getDataFrameAndBaseSeries(data01.dat as any);

  let options: Options = {
    // title: 'Derived Scale',
    width: 600,
    height: 400,
    padding: [10, 10, 10, 10],
    legend: { show: false },
    plugins: [tooltipPlugin({})],
    cursor: cursorBuider({}),
    scales: scalesBuilder({}),
    series: seriesBuider({
      baseSeries,
      colors: hexPalette,
      pathsType: 'bars',
      fillOpacity: 1,
      points: { show: false },
    }),
    axes: [
      axisBuilder({
        isTime: true,
        theme: darkMode ? 'dark' : 'light',
      }),
      axisBuilder({
        theme: darkMode ? 'dark' : 'light',
      }),
    ],
    hooks: {
      setScale: [
        (u, scaleKey) => {
          if (scaleKey === 'x') {
            const min = u.scales.x.min;
            const max = u.scales.x.max;
            if (u.status === 0 && _.isNumber(min) && _.isNumber(max)) {
              xScaleRange.current = [min, max];
            } else if (u.status === 1 && !_.isEqual(xScaleRange.current, [min, max])) {
              console.log(`X-axis zoomed to range: [${min}, ${max}]`);
            }
          }
        },
      ],
    },
  };
  let { data: stackedData, bands } = getStackedDataAndBands(data);
  options.bands = bands;

  return (
    <div
      style={{
        padding: 100,
      }}
    >
      <div
        style={{
          width: 'max-content',
          border: '1px solid #ddd',
        }}
      >
        <UPlotChart options={options} data={[data[0], ...stackedData]} />
      </div>
    </div>
  );
}
