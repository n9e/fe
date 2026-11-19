/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import TimeSeries from './index';
import type { PlotSeries, PromSeries } from './data';
import * as dataHelpers from './data';
import * as tooltipModule from './NameWithTooltip';

let plotWidth = 800;
jest.mock('ahooks', () => ({ useSize: () => ({ width: plotWidth, height: 200 }) }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en_US' } }) }));
jest.mock('@/pages/dashboard/config', () => ({ hexPalette: ['#123456'] }));
jest.mock('./Chart', () => ({
  __esModule: true,
  default: (props: { height: number; width: number; series: PlotSeries[] }) => (
    <div data-testid='chart' data-height={props.height} data-width={props.width} data-visible={props.series.filter((item) => item.show).length} />
  ),
}));
const series: PromSeries[] = Array.from({ length: 80 }, (_, index) => ({ id: String(index), name: `series-${index}`, metric: {}, data: [[1, index]] }));
const props = {
  id: 'test',
  series,
  time: { start: 'now-1h', end: 'now' },
  values: { custom: {}, options: { legend: { displayMode: 'table', columns: ['max', 'last'] }, tooltip: { mode: 'single', sort: 'desc' } } },
};

beforeEach(() => {
  plotWidth = 800;
  HTMLElement.prototype.scrollTo = jest.fn();
});

it('renders independently of dashboard state, keeping plot height while resizing and loading results', () => {
  const view = render(<TimeSeries {...props} series={[]} />);
  expect(screen.getByTestId('chart')).toHaveAttribute('data-height', '200');
  plotWidth = 600;
  view.rerender(<TimeSeries {...props} />);
  expect(screen.getByTestId('chart')).toHaveAttribute('data-height', '200');
  expect(screen.getByTestId('chart')).toHaveAttribute('data-width', '600');
  expect(view.container.querySelectorAll('th.ant-table-cell-fix-right')).toHaveLength(2);
});

it('confirms legend filters, returns to visible rows, and keeps the plotted series intact', () => {
  const onFilter = jest.fn();
  const view = render(<TimeSeries {...props} seriesFilterText='' onSeriesFilterTextChange={onFilter} />);
  fireEvent.click(screen.getByTitle('panel.options.legend.seriesFilter'));
  fireEvent.change(screen.getByPlaceholderText('panel.options.legend.seriesFilter'), { target: { value: 'series-79' } });
  expect(onFilter).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('common:btn.ok'));
  expect(onFilter).toHaveBeenCalledWith('series-79');
  fireEvent.scroll(view.container.querySelector('.ant-table-body')!, { target: { scrollTop: 1200 } });
  view.rerender(<TimeSeries {...props} seriesFilterText='series-79' onSeriesFilterTextChange={onFilter} />);
  expect(screen.getByText('series-79')).toBeInTheDocument();
  expect(screen.queryByText('series-0')).not.toBeInTheDocument();
  expect(screen.getByTestId('chart')).toHaveAttribute('data-visible', '80');
});

it('scrolls and virtualizes only the table body, keeping the header outside the scroll area', () => {
  const view = render(<TimeSeries {...props} legendTableMaxHeight={200} />);
  const body = view.container.querySelector('.ant-table-body')!;
  expect(body).toHaveStyle({ maxHeight: '200px', overflowY: 'scroll' });
  expect(body.querySelector('thead')).toBeNull();
  expect(view.container.querySelector('.ant-table-header thead')).toBeInTheDocument();

  fireEvent.scroll(body, { target: { scrollTop: 1200 } });
  expect(screen.queryByText('series-0')).not.toBeInTheDocument();
  expect(screen.getByText('series-55')).toBeInTheDocument();

  fireEvent.click(screen.getByText('panel.options.legend.max'));
  expect(screen.getByText('series-0')).toBeInTheDocument();
});

it('toggles selected series and clears the selection when query results change', () => {
  const view = render(<TimeSeries {...props} />);
  fireEvent.click(screen.getByText('series-0'));
  expect(screen.getByTestId('chart')).toHaveAttribute('data-visible', '1');
  fireEvent.click(screen.getByText('series-0'));
  expect(screen.getByTestId('chart')).toHaveAttribute('data-visible', '80');
  fireEvent.click(screen.getByText('series-0'));
  view.rerender(<TimeSeries {...props} series={[...series]} />);
  expect(screen.getByTestId('chart')).toHaveAttribute('data-visible', '80');
});

it.each([0, 3, 40])('keeps the visible range valid when scrolled results shrink to %i rows', (count) => {
  const view = render(<TimeSeries {...props} />);
  fireEvent.scroll(view.container.querySelector('.ant-table-body')!, { target: { scrollTop: 1200 } });
  expect(screen.queryByText('series-0')).not.toBeInTheDocument();

  view.rerender(<TimeSeries {...props} series={series.slice(0, count)} />);
  if (count) {
    expect(screen.getByText(`series-${count - 1}`)).toBeInTheDocument();
  } else {
    expect(view.container.querySelector('.ant-table-empty')).toBeInTheDocument();
  }
  const padding = view.container.querySelector<HTMLElement>('.prom-timeseries-legend-table-spacer td');
  expect(Number.parseFloat(padding?.style.height || '0')).toBeLessThan(count * 24 || 1);
});

it('reuses statistics and legend rows for equal options, and invalidates changed formatting', () => {
  const statistics = jest.spyOn(dataHelpers, 'getLegendData');
  const rows = jest.spyOn(tooltipModule, 'default');
  const makeValues = (unit = 'none', decimals = 2, dateFormat = 'YYYY-MM-DD') => ({
    ...props.values,
    options: {
      ...props.values.options,
      legend: { ...props.values.options.legend, columns: [...props.values.options.legend.columns] },
      standardOptions: { unit, decimals, dateFormat },
    },
  });
  try {
    const view = render(<TimeSeries {...props} values={makeValues()} />);
    const calculations = statistics.mock.calls.length;
    const renderedRows = rows.mock.calls.length;
    plotWidth = 600;
    view.rerender(<TimeSeries {...props} values={makeValues()} />);
    expect(statistics).toHaveBeenCalledTimes(calculations);
    expect(rows).toHaveBeenCalledTimes(renderedRows);

    view.rerender(<TimeSeries {...props} values={makeValues('percent')} />);
    expect(statistics).toHaveBeenCalledTimes(calculations + 1);
    view.rerender(<TimeSeries {...props} values={makeValues('percent', 1)} />);
    expect(statistics).toHaveBeenCalledTimes(calculations + 2);
    view.rerender(<TimeSeries {...props} values={makeValues('percent', 1, 'HH:mm')} />);
    expect(statistics).toHaveBeenCalledTimes(calculations + 3);
  } finally {
    statistics.mockRestore();
    rows.mockRestore();
  }
});
