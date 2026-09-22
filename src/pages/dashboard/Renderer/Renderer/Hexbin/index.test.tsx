/** @jest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';

jest.mock('@/App', () => ({ CommonStateContext: React.createContext({}) }));
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

import type { IPanel } from '../../../types';

import Hexbin from './index';

/** 最小 hexbin 面板配置：只覆盖渲染入口需要读取的字段。 */
function createPanel(): IPanel {
  return {
    id: 'hexbin-panel',
    name: 'Hexbin',
    description: '',
    layout: { h: 8, w: 12, x: 0, y: 0, i: 'hexbin-panel' },
    targets: [],
    type: 'hexbin',
    options: {},
    custom: { calc: 'lastNotNull', valueField: 'Value', textMode: 'valueAndName' },
    overrides: [],
  };
}

describe('Hexbin without a dashboard runtime', () => {
  it('renders outside the dashboard tree instead of throwing', () => {
    // 指标视图会直接渲染 Hexbin（没有仪表盘运行时容器）；
    // 组件必须自己创建隔离实例，而不是让 useGlobalState 抛错
    expect(() => render(<Hexbin values={createPanel()} series={[]} />)).not.toThrow();
  });
});
