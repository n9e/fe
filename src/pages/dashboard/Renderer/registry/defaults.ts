import _ from 'lodash';

import { colors } from '../../Components/ColorRangeMenu/config';
import type { IThresholds } from '../../types';
import type { PanelDefaultOptions, PanelVisualizationType } from './types';

/**
 * 面板与编辑器共用的默认配置。
 *
 * 这里只放纯数据，不能引用编辑器组件：查看态渲染面板时需要读取默认值，
 * 引入编辑器会把编辑代码带入查看链路。
 */

export const defaultThreshold: IThresholds['steps'][number] = {
  color: 'rgb(44, 157, 61)',
  value: null,
  type: 'base',
};

export const gaugeDefaultThresholds: IThresholds['steps'] = [
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
    mode: 'single',
    sort: 'none',
  },
  legend: {
    displayMode: 'hidden',
    sortBy: '',
    sortDir: 'asc',
  },
  thresholds: {
    steps: [defaultThreshold],
    mode: 'absolute',
  },
  thresholdsStyle: {
    mode: 'dashed',
  },
} satisfies PanelDefaultOptions;

/** 各可视化类型的 custom 默认值，供新建面板与类型切换使用。 */
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
    barAlignment: 0,
    barWidthFactor: 0.6,
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
    detailName: '',
  },
  table: {
    showHeader: true,
    colorMode: 'value',
    calc: 'lastNotNull',
    displayMode: 'seriesToRows',
    tableLayout: 'auto',
    nowrap: true,
  },
  tableNG: {
    showHeader: true,
    filterable: false,
    cellOptions: {
      type: 'none',
    },
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
    valueField: 'Value',
    baseColor: '#9470FF',
    displayMode: 'basic',
    sortOrder: 'desc',
    otherPosition: 'none',
    valueMode: 'color', // 'color' | 'hidden'
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
  iframe: {},
  barchart: {
    calc: 'lastNotNull',
    valueField: 'Value',
  },
};

/** 各可视化类型的 options 默认值；gauge 需要独立的阈值默认值。 */
export const defaultOptionsValuesMap: Record<PanelVisualizationType, PanelDefaultOptions> = {
  timeseries: defaultOptionsValues,
  stat: defaultOptionsValues,
  pie: defaultOptionsValues,
  table: defaultOptionsValues,
  tableNG: defaultOptionsValues,
  hexbin: defaultOptionsValues,
  barGauge: defaultOptionsValues,
  text: defaultOptionsValues,
  heatmap: defaultOptionsValues,
  iframe: defaultOptionsValues,
  barchart: defaultOptionsValues,
  gauge: {
    ...defaultOptionsValues,
    thresholds: {
      steps: gaugeDefaultThresholds,
    },
  },
};
