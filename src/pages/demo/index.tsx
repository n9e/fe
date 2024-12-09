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
import React from 'react';
import uPlot, { AlignedData, Options } from 'uplot';
import UPlotChart from '@/components/UPlotChart';

const options: Options = {
  title: 'Derived Scale',
  width: 600,
  height: 400,
  scales: {
    x: {
      time: false,
    },
    z: {
      from: 'y',
      range: (u, min, max) => [((min - 32) * 5) / 9, ((max - 32) * 5) / 9],
    },
  },
  series: [
    {},
    {
      label: 'blah',
      stroke: 'green',
    },
  ],
  axes: [
    {},
    {
      values: (u, vals, space) => vals.map((v) => v + '° F'),
    },
    {
      scale: 'z',
      range: (u, min, max) => [Math.ceil(min), Math.ceil(max)],
      values: (u, vals, space) => vals.map((v) => v + '° C'),
      side: 1,
      grid: { show: false },
      space: 20,
    },
  ],
};

const data: AlignedData = [
  [1, 2, 3, 4, 5, 6, 7],
  [40, 43, 60, 65, 71, 73, 80],
];

export default function Demo() {
  return (
    <div
      style={{
        padding: 100,
      }}
    >
      <UPlotChart options={options} data={data} />
    </div>
  );
}
