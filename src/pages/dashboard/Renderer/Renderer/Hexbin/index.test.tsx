/** @jest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';

const mockHoneycombChart = jest.fn();

jest.mock('@/App', () => ({ CommonStateContext: React.createContext({}), basePrefix: '/n9e' }));
jest.mock('ahooks', () => ({ useSize: () => ({ width: 320, height: 160 }) }));
jest.mock('@/components/HoneycombChart', () => ({
  __esModule: true,
  default: (props: unknown) => {
    mockHoneycombChart(props);
    return null;
  },
}));
// 插值工具只用到 parseRange；真实 TimeRangePicker 会引入 rc-picker 的 ESM 产物
jest.mock('@/components/TimeRangePicker', () => ({ parseRange: (range: unknown) => range }));
// @/utils/constant 在源码里使用 import.meta，node 测试环境无法解析
jest.mock('@/utils/constant', () => ({
  IS_PLUS: false,
  IS_ENT: false,
  N9E_PATHNAME: 'n9e',
  SIZE: 8,
  FONT_FAMILY: '',
  DatasourceCateEnum: { prometheus: 'prometheus', elasticsearch: 'elasticsearch' },
}));
jest.mock('../../utils/getCalculatedValuesBySeries', () => ({
  __esModule: true,
  default: () => [{ name: 'value', stat: 1, text: '1', metric: {} }],
}));
import type { IPanel } from '../../../types';
import type { CalculatedSeries } from '../../utils/getCalculatedValuesBySeries';

import Hexbin from './index';

/** Hexbin panel fixture with a stable color range, matching the persisted panel shape. */
const colorRange = ['#3399CC'];
/** 最小 hexbin 面板配置：只覆盖渲染入口需要读取的字段。 */
const values: IPanel = {
  id: 'hexbin-panel',
  name: 'Hexbin',
  description: '',
  layout: { h: 8, w: 12, x: 0, y: 0, i: 'hexbin-panel' },
  targets: [],
  type: 'hexbin',
  options: {},
  custom: { calc: 'lastNotNull', valueField: 'Value', textMode: 'valueAndName', colorRange },
  overrides: [],
};
const series: CalculatedSeries[] = [];

describe('Hexbin without a dashboard runtime', () => {
  beforeEach(() => {
    mockHoneycombChart.mockClear();
  });

  it('renders outside the dashboard tree instead of throwing', () => {
    // 指标视图会直接渲染 Hexbin（没有仪表盘运行时容器）；
    // 组件必须自己创建隔离实例，而不是让 useGlobalState 抛错
    expect(() => render(<Hexbin values={values} series={series} />)).not.toThrow();
  });

  it('passes the updated theme and measured dimensions to the chart component', () => {
    const utils = render(<Hexbin values={values} series={series} />);

    expect(mockHoneycombChart).toHaveBeenLastCalledWith(expect.objectContaining({ themeMode: undefined, width: 320, height: 160 }));

    utils.rerender(<Hexbin values={values} series={series} themeMode='dark' />);

    expect(mockHoneycombChart).toHaveBeenLastCalledWith(expect.objectContaining({ themeMode: 'dark', width: 320, height: 160 }));
  });
});
