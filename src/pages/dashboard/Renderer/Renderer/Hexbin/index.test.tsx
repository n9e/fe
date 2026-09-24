/** @jest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';

const mockRenderFn = jest.fn();

jest.mock('@/App', () => ({ CommonStateContext: React.createContext({}) }));
jest.mock('ahooks', () => ({ useSize: () => ({ width: 320, height: 160 }) }));
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
jest.mock('./render', () => ({ renderFn: mockRenderFn }));

import type { IPanel } from '../../../types';
import type { CalculatedSeries } from '../../utils/getCalculatedValuesBySeries';

import Hexbin from './index';

/**
 * 以下两个引用必须在多次渲染间保持稳定：
 * series 经 dataDependency、custom.colorRange 经解构默认值，都会进入重绘 effect 的依赖数组。
 * 若每次渲染新建引用，effect 会无条件重跑，测试就无法守住 themeMode 这一项依赖。
 */
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
    mockRenderFn.mockClear();
  });

  it('renders outside the dashboard tree instead of throwing', () => {
    // 指标视图会直接渲染 Hexbin（没有仪表盘运行时容器）；
    // 组件必须自己创建隔离实例，而不是让 useGlobalState 抛错
    expect(() => render(<Hexbin values={values} series={series} />)).not.toThrow();
  });

  it('redraws with the new theme when themeMode changes at runtime', () => {
    const utils = render(<Hexbin values={values} series={series} />);

    expect(mockRenderFn).toHaveBeenLastCalledWith(expect.any(Array), expect.not.objectContaining({ themeMode: 'dark' }), expect.any(Function));

    utils.rerender(<Hexbin values={values} series={series} themeMode='dark' />);

    expect(mockRenderFn).toHaveBeenLastCalledWith(expect.any(Array), expect.objectContaining({ themeMode: 'dark' }), expect.any(Function));
  });
});
