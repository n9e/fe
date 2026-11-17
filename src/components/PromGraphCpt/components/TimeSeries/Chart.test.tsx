/** @jest-environment jsdom */
import React from 'react';
import moment from 'moment';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type uPlot from 'uplot';
import type { Options } from 'uplot';
import Chart from './Chart';
import { getPlotData } from './data';
import { parseRange } from '@/components/TimeRangePicker';

jest.mock('@/utils/constant', () => ({ FONT_FAMILY: '', THEME: { light: {}, dark: {} } }));
jest.mock('@/components/TimeRangePicker', () => ({ parseRange: jest.fn(() => ({ start: new Date(100000), end: new Date(200000) })) }));
const capturedOptions: Options[] = [];
const mockChart = { scales: { x: { min: 100, max: 200 }, y: { min: 0, max: 1 } }, setScale: jest.fn(), status: 1 };
jest.mock('@/components/UPlotChart', () => ({
  ...jest.requireActual('@/components/UPlotChart'),
  __esModule: true,
  default: ({ options, onCreate }: { options: Options; onCreate: (id: string, chart: uPlot) => void }) => {
    capturedOptions.push(options);
    React.useEffect(() => onCreate('chart', mockChart as unknown as uPlot), []);
    return <div data-testid='uplot' />;
  },
}));

const plot = getPlotData([
  {
    id: 'a',
    name: 'a',
    metric: {},
    data: [
      [100, 1],
      [200, 2],
    ],
  },
]);
const props = {
  id: 'chart',
  width: 600,
  height: 200,
  frames: plot.frames,
  series: plot.baseSeries,
  colors: ['red'],
  custom: { lineInterpolation: 'smooth' },
  tooltip: { mode: 'all', sort: 'desc' },
  time: { start: 'now-1h', end: 'now' },
  darkMode: false,
};

beforeEach(() => {
  capturedOptions.length = 0;
  mockChart.setScale.mockClear();
  (parseRange as jest.Mock).mockReturnValue({ start: new Date(100000), end: new Date(200000) });
});

it.each(['sparse', 'empty', 'single'] as const)('keeps the full query hour for a %s result', (kind) => {
  (parseRange as jest.Mock).mockReturnValue({ start: new Date(0), end: new Date(3600000) });
  const frames =
    kind === 'sparse'
      ? [
          [2700, 3600],
          [1, 2],
        ]
      : kind === 'single'
      ? [[3000], [1]]
      : [[]];
  render(<Chart {...props} frames={frames as typeof props.frames} />);
  const scale = capturedOptions[capturedOptions.length - 1].scales?.x;
  expect(scale).toMatchObject({ min: 0, max: 3600, auto: false });
  expect(typeof scale?.range).toBe('function');
  if (typeof scale?.range === 'function') {
    expect(scale.range(mockChart as unknown as uPlot, null!, null!, 'x')).toEqual([0, 3600]);
    expect(scale.range(mockChart as unknown as uPlot, 2800, 3000, 'x')).toEqual([2800, 3000]);
  }
});

it('moves the axis to the next request snapshot and resets zoom to that snapshot', () => {
  const view = render(<Chart {...props} />);
  (parseRange as jest.Mock).mockReturnValue({ start: new Date(300000), end: new Date(400000) });
  view.rerender(<Chart {...props} time={{ start: moment.unix(300), end: moment.unix(400) }} />);
  const options = capturedOptions[capturedOptions.length - 1];
  expect(options.scales?.x).toMatchObject({ min: 300, max: 400, auto: false });
  const zoomed = { ...mockChart, scales: { x: { min: 320, max: 350 } } } as unknown as uPlot;
  act(() => options.hooks?.setScale?.forEach((hook) => hook?.(zoomed, 'x')));
  fireEvent.click(screen.getByText('Reset zoom'));
  expect(mockChart.setScale).toHaveBeenCalledWith('x', { min: 300, max: 400 });
});

it('reports drag ranges and resets an externally queried zoom', () => {
  const onZoomRangeChange = jest.fn();
  render(<Chart {...props} zoomed onZoomRangeChange={onZoomRangeChange} />);
  const options = capturedOptions[capturedOptions.length - 1];
  expect(options.cursor?.drag).toEqual({ x: true, y: false, setScale: false });
  const chart = { select: { left: 10, width: 30 }, posToVal: (position: number) => position + 100 } as unknown as uPlot;
  options.hooks?.setSelect?.forEach((hook) => hook?.(chart));
  expect(onZoomRangeChange).toHaveBeenCalledWith([new Date(110000), new Date(140000)]);
  fireEvent.click(screen.getByText('Reset zoom'));
  expect(onZoomRangeChange).toHaveBeenLastCalledWith();
});

it('restores the initial scales for a local zoom', () => {
  render(<Chart {...props} />);
  const options = capturedOptions[capturedOptions.length - 1];
  const zoomed = { ...mockChart, scales: { x: { min: 120, max: 150 } } } as unknown as uPlot;
  act(() => options.hooks?.setScale?.forEach((hook) => hook?.(zoomed, 'x')));
  fireEvent.click(screen.getByText('Reset zoom'));
  expect(mockChart.setScale).toHaveBeenCalledWith('x', { min: 100, max: 200 });
  expect(mockChart.setScale).toHaveBeenCalledWith('y', { min: 0, max: 1 });
});

it('handles empty stacked results without calling the stack builder with no series', () => {
  render(<Chart {...props} frames={[[]]} series={[]} custom={{ stack: 'normal' }} />);
  expect(screen.getByTestId('uplot')).toBeInTheDocument();
});
