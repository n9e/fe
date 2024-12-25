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
import React, { useContext } from 'react';
import _ from 'lodash';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { CommonStateContext } from '@/App';

interface IProps {
  series: any[];
  xThresholds?: number[];
  onClick?: (event: any, datetime: Date, value: number) => void;
}

export default function Graph(props: IProps) {
  const { darkMode } = useContext(CommonStateContext);
  const { series, xThresholds } = props;
  const graphProps = {
    custom: {
      drawStyle: 'lines',
      fillOpacity: 0,
      stack: 'hidden',
      lineInterpolation: 'smooth',
    },
    options: {
      legend: {
        displayMode: 'hidden',
      },
      tooltip: {
        mode: 'all',
      },
      xThresholds: {
        steps: _.map(xThresholds, (threshold) => {
          return {
            value: threshold,
            color: 'red',
          };
        }),
      },
    },
  };

  return (
    <div style={{ height: 200 }}>
      <Timeseries values={graphProps as any} series={series} onClick={props.onClick} themeMode={darkMode ? 'dark' : undefined} />
    </div>
  );
}
