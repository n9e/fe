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
import UPlotChart, { tooltipPlugin, axisBuilder, seriesBuider, getStackedDataAndBands } from '@/components/UPlotChart';
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
    cursor: {
      // x: false, // 十字线
      // y: false,
      points: {
        size: (u, seriesIdx) => {
          const size = u.series[seriesIdx].points?.size;
          if (size) {
            return size * 2;
          }
          return 6;
        },
        width: (u, seriesIdx, size) => size / 4,
        stroke: (u, seriesIdx) => {
          const stroke = u.series[seriesIdx].points?.stroke;
          if (typeof stroke === 'function') {
            const color = stroke(u, seriesIdx);
            return Color(color).alpha(0.4).rgb().string();
          }
          return 'blue';
        },
        fill: (u, seriesIdx) => {
          const stroke = u.series[seriesIdx].points?.stroke;
          if (typeof stroke === 'function') {
            const color = stroke(u, seriesIdx);
            return color;
          }
          return 'blue';
        },
      },
      sync: {
        key: 'a',
      },
    },
    // scales: {
    //   x: {
    //     range: (self, min, max) => {
    //       return [1733817600, 1733818000]; // 设置 X 轴的最小值和最大值
    //     },
    //   },
    //   y: {
    //     distr: 3, // 1: linear, 3: log
    //     log: 10, // 对数底
    //     range: (self, min, max) => {
    //       return [min, max]; // 设置 Y 轴的最小值和最大值
    //     },
    //   },
    // },
    series: seriesBuider({
      baseSeries,
      colors: hexPalette,
      pathsType: 'bars',
      fillOpacity: 1,
      points: { show: false },
    }),
    // series: [
    //   {},
    //   {
    //     // paths: uPlot.paths.bars && uPlot.paths.bars(), // 柱状图
    //     paths: uPlot.paths.spline && uPlot.paths.spline(), // 曲线图
    //     label: 'context_switches',
    //     stroke: 'green',
    //     fill: (self, seriesIdx) => {
    //       const seriesStroke = self.series[seriesIdx].stroke;
    //       if (typeof seriesStroke === 'function') {
    //         const color = seriesStroke(self, seriesIdx);
    //         const gradient = self.ctx.createLinearGradient(0, 0, 0, self.bbox.height);
    //         gradient.addColorStop(0, Color(color).alpha(0.6).rgb().string());
    //         gradient.addColorStop(1, Color(color).alpha(0.01).rgb().string());
    //         return gradient;
    //       }
    //       return '';
    //     },
    //   },
    //   {
    //     label: 'kernel_interrupts',
    //     stroke: 'blue',
    //     width: 2,
    //     points: { show: true, width: 5 },
    //   },
    // ],
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
