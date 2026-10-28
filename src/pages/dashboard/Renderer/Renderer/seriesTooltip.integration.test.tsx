/** @jest-environment jsdom */
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

// 保留真实面板、数值计算、HoneycombChart 和 Ant Design Tooltip，仅替换尺寸与 canvas 测量等浏览器边界。
jest.mock('@/App', () => ({ CommonStateContext: React.createContext({}), basePrefix: '/n9e' }));
jest.mock('ahooks', () => ({ useSize: () => ({ width: 320, height: 160 }) }));
jest.mock('@/utils/getTextWidth', () => ({
  __esModule: true,
  defaultFont: { fontWeight: 'normal', fontSize: '12px', fontFamily: 'sans-serif' },
  default: (value: string) => value.length * 8,
  createTextWidthMeasurer: () => null,
  getTextWidthInEm: (value: string) => value.length * 0.65,
}));
jest.mock('@/pages/dashboard/Variables/utils/replaceTemplateVariables', () => ({ useReplaceTemplateVariables: () => (value: string) => value }));

import { DashboardRuntimeProvider } from '../../globalState';
import type { IPanel } from '../../types';
import type { CalculatedSeries } from '../utils/getCalculatedValuesBySeries';
import BarGauge from './BarGauge';
import Gauge from './Gauge';
import Hexbin from './Hexbin';

interface ChartCase {
  name: string;
  type: IPanel['type'];
  Component: typeof BarGauge | typeof Gauge | typeof Hexbin;
  selector: string;
  custom?: Record<string, string>;
}

const charts: ChartCase[] = [
  { name: 'basic BarGauge', type: 'barGauge', Component: BarGauge, selector: '.n9e-renderer-bar-gauge-item', custom: { displayMode: 'basic' } },
  { name: 'gradient BarGauge', type: 'barGauge', Component: BarGauge, selector: '.n9e-renderer-bar-gauge-item', custom: { displayMode: 'gradient' } },
  { name: 'LCD BarGauge', type: 'barGauge', Component: BarGauge, selector: '.n9e-renderer-bar-gauge-lcd-item', custom: { displayMode: 'lcd' } },
  { name: 'Gauge', type: 'gauge', Component: Gauge, selector: '.n9e-renderer-gauge-item' },
  { name: 'Hexbin', type: 'hexbin', Component: Hexbin, selector: '.hexagon-group path' },
];

const series: CalculatedSeries[] = [{ id: 'A', refId: 'A', metric: { __name__: 'cpu_usage', ident: 'host-1', zone: 'east' }, data: [[1000, 12.34]] }];

function createPanel(chart: ChartCase, custom: Record<string, unknown> = {}): IPanel {
  return {
    id: 'tooltip-panel',
    name: chart.name,
    description: '',
    layout: { h: 8, w: 12, x: 0, y: 0, i: 'tooltip-panel' },
    targets: [],
    type: chart.type,
    options: {
      standardOptions: { min: 0, max: 100, unit: 'percent', decimals: 1 },
      thresholds: { mode: 'absolute', steps: [{ type: 'base', value: null, color: '#00ff00' }] },
    },
    custom: { calc: 'lastNotNull', valueField: 'Value', textMode: 'valueAndName', sortOrder: 'none', colorRange: ['#3399CC'], ...chart.custom, ...custom },
    overrides: [],
  };
}

function renderChart(chart: ChartCase, chartSeries = series, custom: Record<string, unknown> = {}) {
  const { Component } = chart;
  const values = createPanel(chart, custom);
  const view = render(<Component values={values} series={chartSeries} />, { wrapper: DashboardRuntimeProvider });
  return { ...view, values };
}

async function hoverChart(container: HTMLElement, chart: ChartCase, index = 0) {
  const trigger = container.querySelectorAll(chart.selector)[index];
  expect(trigger).toBeInTheDocument();
  fireEvent.mouseEnter(trigger, { clientX: 30, clientY: 40 });
  await act(async () => jest.advanceTimersByTime(500));

  const tooltip = screen.getByRole('tooltip');
  await waitFor(() => expect(tooltip).toBeVisible());
  return tooltip as HTMLElement;
}

beforeEach(() => {
  jest.useFakeTimers();
  // rc-align 会跳过零尺寸触发器；jsdom 没有布局计算，需要提供可见元素的矩形。
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    width: 320,
    height: 160,
    top: 0,
    right: 320,
    bottom: 160,
    left: 0,
    toJSON: () => ({}),
  });
});
afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe.each(charts)('$name series tooltip', (chart) => {
  it('shows the metric title, all labels, and the formatted value with its unit on hover', async () => {
    const view = renderChart(chart);
    const tooltip = await hoverChart(view.container, chart);

    expect(tooltip.querySelector('.n9e-series-tooltip-title')).toHaveTextContent('cpu_usage');
    expect(tooltip.querySelector('.n9e-series-tooltip-value')?.textContent?.replace(/\s/g, '')).toBe('12.3%');
    expect(Array.from(tooltip.querySelectorAll('li'), (node) => node.textContent)).toEqual(['ident: host-1', 'zone: east']);
    expect(view.container).not.toContainElement(tooltip);
  });

  it('uses the interpolated custom legend instead of the metric title and labels', async () => {
    const chartSeries = [{ ...series[0], target: { refId: 'A', legend: '{{ident}} CPU' } }];
    const view = renderChart(chart, chartSeries, { nameField: 'zone' });
    const tooltip = await hoverChart(view.container, chart);

    expect(tooltip.querySelector('.n9e-series-tooltip-title')).toHaveTextContent('host-1 CPU');
    expect(tooltip.querySelector('.n9e-series-tooltip-value')?.textContent?.replace(/\s/g, '')).toBe('12.3%');
    expect(tooltip.querySelector('.n9e-series-tooltip-labels')).toBeNull();
    expect(tooltip).not.toHaveTextContent('cpu_usage');
    expect(tooltip).not.toHaveTextContent('{{ident}}');
  });

  it('still exposes a zero value when the series has no metric labels', async () => {
    const view = renderChart(chart, [{ id: 'A', refId: 'A', metric: {}, data: [[1000, 0]] }]);
    const tooltip = await hoverChart(view.container, chart);

    expect(tooltip.querySelector('.n9e-series-tooltip-value')?.textContent?.replace(/\s/g, '')).toBe('0%');
    expect(tooltip.querySelector('.n9e-series-tooltip-labels')).toBeNull();
  });

  it('uses the selected metric field as the tooltip value', async () => {
    const view = renderChart(chart, [{ ...series[0], metric: { ...series[0].metric, load: '25.67' } }], { valueField: 'load' });
    const tooltip = await hoverChart(view.container, chart);

    // Hexbin 展示选中字段的原始文本，其余面板使用单位格式化后的值。
    const expected = chart.type === 'hexbin' ? '25.67' : '25.7%';
    expect(tooltip.querySelector('.n9e-series-tooltip-value')?.textContent?.replace(/\s/g, '')).toBe(expected);
    expect(tooltip).toHaveTextContent('load: 25.67');
  });
});

describe.each(charts.filter((chart) => chart.type === 'barGauge'))('$name combined Other tooltip', (chart) => {
  it('shows the Other name and formatted sum even with panel text hidden', async () => {
    const view = renderChart(
      chart,
      [
        ...series,
        { id: 'B', refId: 'B', metric: { __name__: 'mem_usage', ident: 'host-2' }, data: [[1000, 8.4]] },
        { id: 'C', refId: 'C', metric: { __name__: 'mem_usage', ident: 'host-3' }, data: [[1000, 1.23]] },
      ],
      { topn: 1, combine_other: true, otherPosition: 'bottom', namePlacement: 'hidden', valueMode: 'hidden' },
    );
    const tooltip = await hoverChart(view.container, chart, 1);

    expect(tooltip.querySelector('.n9e-series-tooltip-title')).toHaveTextContent('Other');
    expect(tooltip.querySelector('.n9e-series-tooltip-value')).toHaveTextContent('9.6%');
    expect(tooltip.querySelector('.n9e-series-tooltip-labels')).toBeNull();
  });
});

describe('Hexbin tooltip lifecycle', () => {
  const chart = charts[4];

  it('tracks the pointer, switches cells, and removes the tooltip on mouse leave', async () => {
    const view = renderChart(chart, [...series, { id: 'B', refId: 'B', metric: { __name__: 'mem_usage', ident: 'host-2' }, data: [[1000, 8]] }]);
    const tooltip = await hoverChart(view.container, chart);
    expect(tooltip).toHaveStyle({ left: '40px', top: '50px' });

    const cells = view.container.querySelectorAll(chart.selector);
    fireEvent.mouseMove(cells[0], { clientX: 80, clientY: 90 });
    expect(tooltip).toHaveStyle({ left: '90px', top: '100px' });
    fireEvent.mouseLeave(cells[0]);
    expect(screen.queryByRole('tooltip')).toBeNull();

    const secondTooltip = await hoverChart(view.container, chart, 1);
    expect(secondTooltip.querySelector('.n9e-series-tooltip-title')).toHaveTextContent('mem_usage');
    expect(secondTooltip).toHaveTextContent('ident: host-2');
    expect(secondTooltip).not.toHaveTextContent('host-1');
    view.unmount();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('clears an open tooltip on data refresh and displays the updated value on the next hover', async () => {
    const view = renderChart(chart);
    await hoverChart(view.container, chart);

    view.rerender(<Hexbin values={view.values} series={[{ ...series[0], metric: { __name__: 'new_cpu', ident: 'host-2' }, data: [[2000, 60.78]] }]} />);
    expect(screen.queryByRole('tooltip')).toBeNull();

    const tooltip = await hoverChart(view.container, chart);
    expect(tooltip.querySelector('.n9e-series-tooltip-title')).toHaveTextContent('new_cpu');
    expect(tooltip.querySelector('.n9e-series-tooltip-value')).toHaveTextContent('60.8 %');
    expect(tooltip).toHaveTextContent('ident: host-2');
    expect(tooltip).not.toHaveTextContent('host-1');
  });
});

describe('Gauge pointer tooltip', () => {
  const chart = charts[3];

  it('appears at the pointer, follows mouse movement, and disappears on mouse leave', () => {
    const view = renderChart(chart);
    const trigger = view.container.querySelector(`${chart.selector} svg path`)!;
    fireEvent.mouseEnter(trigger, { clientX: 30, clientY: 40 });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveStyle({ left: '40px', top: '50px' });
    expect(tooltip).toHaveTextContent('cpu_usage');
    expect(view.container).not.toContainElement(tooltip);

    fireEvent.mouseMove(trigger, { clientX: 80, clientY: 90 });
    expect(tooltip).toHaveStyle({ left: '90px', top: '100px' });

    fireEvent.mouseLeave(trigger);
    expect(screen.queryByRole('tooltip')).toBeNull();
    fireEvent.mouseMove(trigger, { clientX: 90, clientY: 100 });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('switches series without retaining the previous tooltip and removes the portal on unmount', () => {
    const view = renderChart(chart, [...series, { id: 'B', refId: 'B', metric: { __name__: 'mem_usage', ident: 'host-2' }, data: [[1000, 8]] }]);
    const triggers = view.container.querySelectorAll(chart.selector);

    fireEvent.mouseEnter(triggers[0], { clientX: 30, clientY: 40 });
    expect(screen.getByRole('tooltip')).toHaveTextContent('ident: host-1');
    fireEvent.mouseLeave(triggers[0]);
    fireEvent.mouseEnter(triggers[1], { clientX: 80, clientY: 90 });

    expect(screen.getAllByRole('tooltip')).toHaveLength(1);
    expect(screen.getByRole('tooltip')).toHaveTextContent('mem_usage');
    expect(screen.getByRole('tooltip')).toHaveTextContent('ident: host-2');
    expect(screen.getByRole('tooltip')).not.toHaveTextContent('host-1');

    view.unmount();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('clears an open tooltip when series data refreshes', () => {
    const view = renderChart(chart);
    fireEvent.mouseEnter(view.container.querySelector(chart.selector)!, { clientX: 30, clientY: 40 });
    expect(screen.getByRole('tooltip')).toHaveTextContent('ident: host-1');

    view.rerender(<Gauge values={view.values} series={[{ ...series[0], metric: { __name__: 'new_cpu', ident: 'host-2' }, data: [[2000, 60.78]] }]} />);
    expect(screen.queryByRole('tooltip')).toBeNull();

    fireEvent.mouseEnter(view.container.querySelector(chart.selector)!, { clientX: 80, clientY: 90 });
    expect(screen.getByRole('tooltip')).toHaveTextContent('ident: host-2');
    expect(screen.getByRole('tooltip').querySelector('.n9e-series-tooltip-value')).toHaveTextContent('60.8%');
  });
});

describe.each(charts.filter((chart) => chart.type === 'gauge' || chart.type === 'hexbin'))('$name tooltip boundary', (chart) => {
  function mockViewport(width = 800, height = 600) {
    const widthSpy = jest.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(width);
    const heightSpy = jest.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(height);
    jest.mocked(HTMLElement.prototype.getBoundingClientRect).mockReturnValue({
      x: 0,
      y: 0,
      width: 240,
      height: 100,
      top: 0,
      right: 240,
      bottom: 100,
      left: 0,
      toJSON: () => ({}),
    });
    return { widthSpy, heightSpy };
  }

  it('flips to the left and above the pointer on the first hover near the bottom right corner', () => {
    mockViewport();
    const view = renderChart(chart);
    const cell = view.container.querySelector(chart.selector)!;

    fireEvent.mouseEnter(cell, { clientX: 790, clientY: 590 });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveStyle({ left: '540px', top: '480px' });
    expect(tooltip).toHaveTextContent('cpu_usage');
    expect(tooltip).toHaveTextContent('ident: host-1');

    fireEvent.mouseMove(cell, { clientX: 100, clientY: 100 });
    expect(tooltip).toHaveStyle({ left: '110px', top: '110px' });
  });

  it('repositions an open tooltip on window resize and removes the resize listener on unmount', () => {
    const { widthSpy, heightSpy } = mockViewport();
    const removeListener = jest.spyOn(window, 'removeEventListener');
    const view = renderChart(chart);
    fireEvent.mouseEnter(view.container.querySelector(chart.selector)!, { clientX: 790, clientY: 590 });

    widthSpy.mockReturnValue(600);
    heightSpy.mockReturnValue(400);
    fireEvent(window, new Event('resize'));

    expect(screen.getByRole('tooltip')).toHaveStyle({ left: '348px', top: '288px' });

    view.unmount();
    expect(removeListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
