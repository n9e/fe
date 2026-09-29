/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';

import { createPanelChartProps } from '@/pages/dashboard/test/fixtures/panelChartProps';

import { TablePanel, TablePanelNG, TextPanel, TimeseriesPanel } from './panelCharts';
import type { PanelChartProps } from './types';

// 记录各适配器最终传给真实图表组件的 props 与 ref，用于断言特殊 props 和导出 ref 的透传
const mockChartProps: Record<string, Record<string, unknown>> = {};
const mockForwardedRefs: Record<string, unknown> = {};

jest.mock('../Renderer/TimeSeriesNG', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockChartProps.timeseries = props;
    return require('react').createElement('div', { 'data-testid': 'timeseries-chart' });
  },
}));
jest.mock('../Renderer/Stat', () => ({ __esModule: true, default: () => null }));
jest.mock('../Renderer/Table', () => ({
  __esModule: true,
  default: require('react').forwardRef((props: Record<string, unknown>, ref: unknown) => {
    mockChartProps.table = props;
    mockForwardedRefs.table = ref;
    return require('react').createElement('div', { 'data-testid': 'table-chart' });
  }),
}));
jest.mock('../Renderer/TableNG', () => ({
  __esModule: true,
  default: require('react').forwardRef((props: Record<string, unknown>, ref: unknown) => {
    mockChartProps.tableNG = props;
    mockForwardedRefs.tableNG = ref;
    return require('react').createElement('div', { 'data-testid': 'table-ng-chart' });
  }),
}));
jest.mock('../Renderer/Text', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockChartProps.text = props;
    return require('react').createElement('div', { 'data-testid': 'text-chart' });
  },
}));
jest.mock('../Renderer/Iframe', () => ({ __esModule: true, default: () => null }));

describe('panel chart adapters', () => {
  it('passes annotations, time range and theme props to the timeseries renderer', () => {
    const time = { start: 'now-1h', end: 'now' };
    const setRange = jest.fn();
    const setAnnotationsRefreshFlag = jest.fn();
    const annotations = [{ id: 1 }] as unknown as PanelChartProps['annotations'];

    render(
      <TimeseriesPanel
        {...createPanelChartProps({
          time,
          setRange,
          annotations,
          setAnnotationsRefreshFlag,
          themeMode: 'dark',
          isPreview: true,
        })}
      />,
    );

    expect(screen.getByTestId('timeseries-chart')).toBeInTheDocument();
    expect(mockChartProps.timeseries).toMatchObject({ time, setRange, annotations, setAnnotationsRefreshFlag, themeMode: 'dark', isPreview: true });
  });

  it('forwards the export refs and the raw series to the table renderers', () => {
    const tableRef = { current: null };
    const tableNGRef = { current: null };
    const onOverridesChange = jest.fn();
    const rawSeries = [{ id: 'A', refId: 'A', metric: {}, data: [] }] as unknown as PanelChartProps['rawSeries'];

    render(
      <>
        <TablePanel {...createPanelChartProps({ tableRef })} />
        <TablePanelNG {...createPanelChartProps({ tableNGRef, rawSeries, onOverridesChange })} />
      </>,
    );

    expect(screen.getByTestId('table-chart')).toBeInTheDocument();
    expect(screen.getByTestId('table-ng-chart')).toBeInTheDocument();
    expect(mockForwardedRefs.table).toBe(tableRef);
    expect(mockForwardedRefs.tableNG).toBe(tableNGRef);
    // TableNG 消费原始 DashboardSeries，而不是计算后的序列
    expect(mockChartProps.tableNG).toMatchObject({ series: rawSeries });
    // 列宽调整需要 onOverridesChange 才能写回配置，适配层不得漏传
    expect(mockChartProps.tableNG?.onOverridesChange).toBe(onOverridesChange);
  });

  it('renders the text panel without query series', () => {
    const props = createPanelChartProps({ themeMode: 'dark' });

    render(<TextPanel {...props} />);

    expect(screen.getByTestId('text-chart')).toBeInTheDocument();
    expect(mockChartProps.text).toMatchObject({ values: props.values, series: [], themeMode: 'dark' });
  });
});
