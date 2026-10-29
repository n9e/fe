/** @jest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';

// jsdom 没有 canvas，StatGraph 的 uPlot 与文字测量都依赖 canvas；这里分别替换掉
jest.mock('uplot', () => {
  class MockUPlot {
    destroy = jest.fn();
    setData = jest.fn();
    constructor() {
      // 测试只关心 StatGraph 是否渲染，不关心 uPlot 内部行为
    }
  }
  return { __esModule: true, default: MockUPlot };
});
jest.mock('ahooks', () => {
  const state: { size?: { width: number; height: number } } = { size: { width: 300, height: 200 } };
  return { __esModule: true, useSize: () => state.size, __state: state };
});
jest.mock('../../utils/getTextWidth', () => ({ getMaxFontSize: () => 12 }));
jest.mock('@/utils/constant', () => ({ PRIMARY_COLOR: '#3274d9', FONT_FAMILY: 'sans-serif' }));

import { DashboardRuntimeProvider } from '../../../globalState';
import Stat from './index';
import type { CalculatedSeries } from '../../utils/getCalculatedValuesBySeries';
import type { IPanel } from '../../../types';

const series: CalculatedSeries[] = [
  {
    id: 'A',
    refId: 'A',
    metric: { __name__: 'cpu' },
    data: [
      [1000, 1],
      [2000, 2],
    ],
  },
  {
    id: 'B',
    refId: 'B',
    metric: { __name__: 'mem' },
    data: [
      [1000, 3],
      [2000, 4],
    ],
  },
];

/** 构造 stat 面板配置，默认按自适应网格排列。 */
function createPanel(custom: Record<string, unknown>): IPanel {
  return {
    id: 'stat-panel',
    name: 'Stat panel',
    description: '',
    layout: { h: 8, w: 12, x: 0, y: 0, i: 'stat-panel' },
    targets: [],
    type: 'stat',
    options: {},
    custom: { graphMode: 'area', calc: 'lastNotNull', valueField: 'Value', textMode: 'valueAndName', colorMode: 'value', colSpan: 0, orientation: 'auto', ...custom },
    overrides: [],
  };
}

/** 渲染 stat 面板并提供独立运行时，避免测试之间共享状态。 */
function renderStat(custom: Record<string, unknown>) {
  const bodyWrapRef = React.createRef<HTMLDivElement>();
  const view = render(
    <DashboardRuntimeProvider>
      <div ref={bodyWrapRef}>
        <Stat values={createPanel(custom)} series={series} bodyWrapRef={bodyWrapRef} />
      </div>
    </DashboardRuntimeProvider>,
  );
  return view;
}

describe('Stat arrangement', () => {
  it('renders absolutely positioned items with a sparkline in the auto grid', () => {
    const view = renderStat({});

    expect(view.container.querySelector('.renderer-stat-container-box-position')).toBeInTheDocument();
    const items = view.container.querySelectorAll('.renderer-stat-item');
    expect(items).toHaveLength(2);
    items.forEach((item) => expect(item).toHaveStyle({ position: 'absolute' }));
    expect(view.container.querySelectorAll('.renderer-stat-item-graph')).toHaveLength(2);
  });

  it('lays items out in a row for the horizontal orientation', () => {
    const view = renderStat({ orientation: 'horizontal' });

    expect(view.container.querySelector('.renderer-stat-container-box-flexRow')).toBeInTheDocument();
    const items = view.container.querySelectorAll('.renderer-stat-item');
    expect(items).toHaveLength(2);
    items.forEach((item) => expect(item).toHaveStyle({ width: '50%' }));
    expect(view.container.querySelectorAll('.renderer-stat-item-graph')).toHaveLength(2);
  });

  it('lays items out in a column for the vertical orientation', () => {
    const view = renderStat({ orientation: 'vertical' });

    expect(view.container.querySelector('.renderer-stat-container-box-flexColumn')).toBeInTheDocument();
    const items = view.container.querySelectorAll('.renderer-stat-item');
    expect(items).toHaveLength(2);
    items.forEach((item) => expect(item).toHaveStyle({ height: '50%' }));
  });

  it('wraps items by colSpan and renders the sparkline for each item', () => {
    const view = renderStat({ colSpan: 2 });

    expect(view.container.querySelector('.renderer-stat-container-box-flexwrap')).toBeInTheDocument();
    const items = view.container.querySelectorAll('.renderer-stat-item');
    expect(items).toHaveLength(2);
    items.forEach((item) => expect(item).toHaveStyle({ width: 'calc(50% - 2px)' }));
    expect(view.container.querySelectorAll('.renderer-stat-item-graph')).toHaveLength(2);
  });

  it('hides the sparkline when graphMode is not area', () => {
    const view = renderStat({ graphMode: 'none' });

    expect(view.container.querySelectorAll('.renderer-stat-item')).toHaveLength(2);
    expect(view.container.querySelectorAll('.renderer-stat-item-graph')).toHaveLength(0);
  });
});
