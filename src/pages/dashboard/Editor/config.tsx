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
import _ from 'lodash';
import { PRIMARY_COLOR } from '@/utils/constant';
import { colors } from '../Components/ColorRangeMenu/config';

export const visualizations = [
  {
    type: 'timeseries',
  },
  {
    type: 'barchart',
  },
  {
    type: 'stat',
  },
  {
    type: 'table',
  },
  {
    type: 'pie',
  },
  {
    type: 'hexbin',
  },
  {
    type: 'barGauge',
  },
  {
    type: 'text',
  },
  {
    type: 'gauge',
  },
  {
    type: 'heatmap',
  },
  {
    type: 'iframe',
  },
];

export const IRefreshMap = {
  off: 'off',
  '5s': 5,
  '10s': 10,
  '30s': 30,
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  '1h': 3600,
  '2h': 7200,
  '1d': 86400,
};

export const calcsOptions = {
  lastNotNull: {},
  last: {},
  firstNotNull: {},
  first: {},
  min: {},
  max: {},
  avg: {},
  sum: {},
  count: {},
};

export const defaultThreshold = {
  color: PRIMARY_COLOR,
  value: null,
  type: 'base',
};

export const gaugeDefaultThresholds = [
  {
    color: '#3FC453',
    value: null,
    type: 'base',
  },
  {
    color: '#FF9919',
    value: 60,
  },
  {
    color: '#FF656B',
    value: 80,
  },
];

export const defaultOptionsValues = {
  tooltip: {
    mode: 'all',
    sort: 'none',
  },
  legend: {
    displayMode: 'hidden',
  },
  thresholds: {
    steps: [defaultThreshold],
  },
};

export const defaultValues = {
  version: '1.0.0',
  type: 'timeseries',
  options: defaultOptionsValues,
  custom: {},
  overrides: [{}],
};

export const defaultCustomValuesMap = {
  timeseries: {
    drawStyle: 'lines',
    lineInterpolation: 'smooth',
    lineWidth: 2,
    fillOpacity: 0.01,
    gradientMode: 'none',
    stack: 'off',
    scaleDistribution: {
      type: 'linear',
    },
    showPoints: 'none',
    pointSize: 5,
  },
  stat: {
    textMode: 'valueAndName',
    colorMode: 'value',
    calc: 'lastNotNull',
    valueField: 'Value',
    colSpan: 0, // 2024-06-06 v7.0.0-beta.10 版本新增 0 选项，表示自适应，colSpan 是一个即将废弃的属性
    orientation: 'auto', // 2024-06-06 v7.0.0-beta.10 版本新增属性
    textSize: {},
  },
  pie: {
    textMode: 'valueAndName',
    colorMode: 'value',
    calc: 'lastNotNull',
    valueField: 'Value',
    textSize: {},
    legengPosition: 'right',
    detailName: '详情',
  },
  table: {
    showHeader: true,
    colorMode: 'value',
    calc: 'lastNotNull',
    displayMode: 'seriesToRows',
    tableLayout: 'auto',
    nowrap: true,
  },
  hexbin: {
    textMode: 'valueAndName',
    calc: 'lastNotNull',
    valueField: 'Value',
    colorRange: _.join(colors[0].value, ','),
    colorDomainAuto: true,
    colorDomain: [],
    reverseColorOrder: false,
  },
  barGauge: {
    calc: 'lastNotNull',
    baseColor: '#9470FF',
    displayMode: 'basic',
    serieWidth: 20,
    sortOrder: 'desc',
  },
  text: {
    textSize: 12,
    textColor: '#000000',
    textDarkColor: '#FFFFFF',
    bgColor: 'rgba(0, 0, 0, 0)',
    justifyContent: 'center',
    alignItems: 'center',
    content: '',
  },
  gauge: {
    textMode: 'valueAndName',
    calc: 'lastNotNull',
    valueField: 'Value',
  },
  heatmap: {
    calc: 'lastNotNull',
    valueField: 'Value',
    scheme: 'Blues',
  },
  barchart: {
    calc: 'lastNotNull',
    valueField: 'Value',
  },
};

export const defaultOptionsValuesMap = {
  timeseries: defaultOptionsValues,
  stat: defaultOptionsValues,
  pie: defaultOptionsValues,
  table: defaultOptionsValues,
  hexbin: defaultOptionsValues,
  barGauge: defaultOptionsValues,
  text: defaultOptionsValues,
  gauge: {
    ...defaultOptionsValues,
    thresholds: {
      steps: gaugeDefaultThresholds,
    },
  },
};

export const legendPostion = ['hidden', 'top', 'left', 'right', 'bottom'];
