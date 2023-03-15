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
import { colors } from '../Components/ColorRangeMenu/config';

export const visualizations = [
  {
    type: 'timeseries',
    name: '时间序列图',
  },
  {
    type: 'stat',
    name: '指标值',
  },
  {
    type: 'table',
    name: '表格',
  },
  {
    type: 'pie',
    name: '饼图',
  },
  {
    type: 'hexbin',
    name: '蜂窝图',
  },
  {
    type: 'barGauge',
    name: '排行榜',
  },
  {
    type: 'text',
    name: '文字卡片',
  },
  {
    type: 'gauge',
    name: '仪表盘',
  },
  {
    type: 'iframe',
    name: '内嵌文档(iframe)',
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
  lastNotNull: {
    name: '最后一个非空值',
  },
  last: {
    name: '最后一个值',
  },
  firstNotNull: {
    name: '第一个非空值',
  },
  first: {
    name: '第一个值',
  },
  min: {
    name: '最小值',
  },
  max: {
    name: '最大值',
  },
  avg: {
    name: '平均值',
  },
  sum: {
    name: '总和',
  },
  count: {
    name: '数量',
  },
};

export const defaultThreshold = {
  color: '#634CD9',
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
    lineWidth: 1,
    fillOpacity: 0.5,
    gradientMode: 'none',
    stack: 'off',
    scaleDistribution: {
      type: 'linear',
    },
  },
  stat: {
    textMode: 'valueAndName',
    colorMode: 'value',
    calc: 'lastNotNull',
    valueField: 'Value',
    colSpan: 1,
    textSize: {},
  },
  pie: {
    textMode: 'valueAndName',
    colorMode: 'value',
    calc: 'lastNotNull',
    textSize: {},
    legengPosition: 'right',
  },
  table: {
    showHeader: true,
    colorMode: 'value',
    calc: 'lastNotNull',
    displayMode: 'seriesToRows',
  },
  hexbin: {
    textMode: 'valueAndName',
    calc: 'lastNotNull',
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
    bgColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    content: '',
  },
  gauge: {
    textMode: 'valueAndName',
    calc: 'lastNotNull',
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
