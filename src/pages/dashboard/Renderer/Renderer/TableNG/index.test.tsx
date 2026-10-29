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
// 同样使用 import.meta，node 测试环境无法解析
jest.mock('@/utils/getFontFamily', () => ({ __esModule: true, default: () => 'sans-serif' }));
jest.mock('@/utils', () => ({ copy2ClipBoard: jest.fn() }));
// 断言的是运行时容器兜底，不需要真实渲染 ag-grid
jest.mock('ag-grid-community', () => ({
  ModuleRegistry: { registerModules: jest.fn() },
  AllCommunityModule: {},
  themeBalham: { withParams: () => ({}) },
}));
jest.mock('ag-grid-react', () => ({ AgGridReact: () => null }));
jest.mock('@ag-grid-community/locale', () => ({ AG_GRID_LOCALE_CN: {}, AG_GRID_LOCALE_HK: {}, AG_GRID_LOCALE_EN: {}, AG_GRID_LOCALE_JP: {} }));

import type { IPanel } from '../../../types';

import TableNG from './index';

/** 最小表格面板配置：只覆盖渲染入口需要读取的字段。 */
function createPanel(): IPanel {
  return {
    id: 'asset_view_table',
    name: 'Asset view',
    description: '',
    layout: { h: 8, w: 12, x: 0, y: 0, i: 'asset_view_table' },
    targets: [],
    type: 'tableNG',
    options: {},
    custom: { showHeader: true, filterable: false, cellOptions: { type: 'none' } },
    overrides: [],
  };
}

describe('TableNG without a dashboard runtime', () => {
  it('renders outside the dashboard tree instead of throwing', () => {
    // 资产视图直接渲染 TableNG（没有仪表盘运行时容器）；
    // 组件必须自己创建隔离实例，而不是让 useGlobalState 抛错
    expect(() => render(<TableNG values={createPanel()} series={[]} />)).not.toThrow();
  });
});
