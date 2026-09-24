/** @jest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';

// jsdom 没有 canvas，uPlot 无法真正构造；这里用 mock 暴露构造参数和实例方法。
jest.mock('uplot', () => {
  const charts: unknown[] = [];
  class MockUPlot {
    options: unknown;
    data: unknown;
    destroy = jest.fn();
    setData = jest.fn();
    constructor(options: unknown, data: unknown) {
      this.options = options;
      this.data = data;
      charts.push(this);
    }
  }
  return { __esModule: true, default: MockUPlot, __charts: charts };
});
// 容器尺寸由测试控制，用于验证尺寸变化时重建图表
jest.mock('ahooks', () => {
  const state: { size?: { width: number; height: number } } = { size: { width: 200, height: 40 } };
  return { __esModule: true, useSize: () => state.size, __state: state };
});
jest.mock('@/utils/constant', () => ({ PRIMARY_COLOR: '#3274d9' }));

import StatGraph from './StatGraph';

interface MockUplotSeries {
  stroke?: string;
  fill?: string;
  width?: number;
  spanGaps?: boolean;
  points?: { show: boolean };
}

interface MockUplotChart {
  options: {
    width: number;
    height: number;
    padding: number[];
    cursor: { show: boolean };
    legend: { show: boolean };
    scales: { x: { time: boolean } };
    axes: { show: boolean }[];
    series: MockUplotSeries[];
  };
  data: [number[], (number | null)[]];
  destroy: jest.Mock;
  setData: jest.Mock;
}

const mockAhooks = jest.requireMock<{ __state: { size?: { width: number; height: number } } }>('ahooks');
const mockUplot = jest.requireMock<{ __charts: MockUplotChart[] }>('uplot');

/** 取最近一次构造的图表实例。 */
function getLatestChart() {
  return mockUplot.__charts[mockUplot.__charts.length - 1];
}

describe('StatGraph', () => {
  beforeEach(() => {
    mockUplot.__charts.length = 0;
    mockAhooks.__state.size = { width: 200, height: 40 };
  });

  it('renders nothing unless the graph mode is area', () => {
    const view = render(<StatGraph serie={{ data: [[1000, 1]] }} color='#FF656B' colorMode='value' graphMode='none' />);

    expect(view.container.querySelector('.renderer-stat-item-graph')).toBeNull();
    expect(mockUplot.__charts).toHaveLength(0);
  });

  it('draws a gap-preserving sparkline with the value color and the container size', () => {
    const view = render(
      <StatGraph
        serie={{
          data: [
            [1000, 1],
            [2000, null],
            [3000, 3],
          ],
        }}
        color='#FF656B'
        colorMode='value'
        graphMode='area'
      />,
    );

    const chart = getLatestChart();
    expect(view.container.querySelector('.renderer-stat-item-graph')).toBeInTheDocument();
    expect(chart.options.width).toBe(200);
    expect(chart.options.height).toBe(40);
    expect(chart.options.padding).toEqual([0, 0, 0, 0]);
    expect(chart.options.axes).toEqual([{ show: false }, { show: false }]);
    expect(chart.options.cursor).toEqual({ show: false });
    expect(chart.options.legend).toEqual({ show: false });
    expect(chart.options.scales.x.time).toBe(false);
    expect(chart.options.series[1]).toMatchObject({
      stroke: '#FF656B',
      fill: 'rgba(255, 101, 107, 0.2)',
      width: 1,
      spanGaps: false,
      points: { show: false },
    });
    expect(chart.data[1]).toEqual([1, null, 3]);
  });

  it('uses the panel palette when no threshold color is resolved', () => {
    render(<StatGraph serie={{ data: [[1000, 1]] }} colorMode='value' graphMode='area' />);

    expect(getLatestChart().options.series[1]).toMatchObject({ stroke: '#3274d9', fill: 'rgba(50, 116, 217, 0.2)' });
  });

  it('uses a translucent white line in background color mode', () => {
    render(<StatGraph serie={{ data: [[1000, 1]] }} color='#FF656B' colorMode='background' graphMode='area' />);

    expect(getLatestChart().options.series[1]).toMatchObject({
      stroke: 'rgba(255, 255, 255, 0.5)',
      fill: 'rgba(255, 255, 255, 0.2)',
    });
  });

  it('skips chart creation when every value is empty', () => {
    render(
      <StatGraph
        serie={{
          data: [
            [1000, null],
            [2000, ''],
          ],
        }}
        color='#FF656B'
        colorMode='value'
        graphMode='area'
      />,
    );

    expect(mockUplot.__charts).toHaveLength(0);
  });

  it('updates the existing chart when only the data changes', () => {
    const view = render(<StatGraph serie={{ data: [[1000, 1]] }} color='#FF656B' colorMode='value' graphMode='area' />);
    const chart = getLatestChart();

    view.rerender(
      <StatGraph
        serie={{
          data: [
            [1000, 2],
            [2000, 3],
          ],
        }}
        color='#FF656B'
        colorMode='value'
        graphMode='area'
      />,
    );

    expect(mockUplot.__charts).toHaveLength(1);
    expect(chart.setData).toHaveBeenCalledWith([
      [1000, 2000],
      [2, 3],
    ]);
    expect(chart.destroy).not.toHaveBeenCalled();
  });

  it('rebuilds the chart with the new size when the container resizes', () => {
    const view = render(<StatGraph serie={{ data: [[1000, 1]] }} color='#FF656B' colorMode='value' graphMode='area' />);
    const firstChart = getLatestChart();

    mockAhooks.__state.size = { width: 400, height: 80 };
    view.rerender(<StatGraph serie={{ data: [[1000, 1]] }} color='#FF656B' colorMode='value' graphMode='area' />);

    expect(firstChart.destroy).toHaveBeenCalled();
    expect(mockUplot.__charts).toHaveLength(2);
    expect(getLatestChart().options).toMatchObject({ width: 400, height: 80 });
  });
});
