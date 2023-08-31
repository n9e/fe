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
// @ts-ignore
import { AdvancedDatasourceCateEnum } from 'plus:/types';
export const PAGE_SIZE = 15;
export const PAGE_SIZE_MAX = 100000;
export const PAGE_SIZE_OPTION = 20;
export const PAGE_SIZE_OPTION_LARGE = 150;

export const randomColor = ['pink', 'red', 'yellow', 'orange', 'cyan', 'green', 'blue', 'purple', 'geekblue', 'magenta', 'volcano', 'gold', 'lime'];

export const priorityColor = ['red', 'orange', 'blue'];
// 主题色
export const chartColor = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];
export const METRICS = {
  TOTAL: 'total',
  ERROR: 'error',
  LATENCY: 'latency',
};

export const chartDefaultOptions = {
  color: chartColor,
  xAxis: { data: [] },
  yAxis: {},
  series: [],
  tooltip: {
    show: true,
    trigger: 'axis',
    textStyle: {
      fontSize: 12,
      lineHeight: 12,
    },
  },
  grid: {
    left: '2%',
    right: '1%',
    top: '20',
    bottom: '20',
  },
  legend: {
    lineStyle: {
      width: 1,
    },
  },
  animation: false,
};

enum BaseDatasourceCateEnum {
  prometheus = 'prometheus',
  elasticsearch = 'elasticsearch',
  tdengine = 'tdengine',
}

export const DatasourceCateEnum = { ...BaseDatasourceCateEnum, ...AdvancedDatasourceCateEnum };
export type DatasourceCateEnum = BaseDatasourceCateEnum | AdvancedDatasourceCateEnum;
