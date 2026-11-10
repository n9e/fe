/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';

import Timeseries from './index';
import { createPanelChartProps } from '../../../test/fixtures/panelChartProps';
import type { IPanel } from '../../../types';
import type { DataItem } from './utils/getLegendData';

jest.mock('@/App', () => ({ CommonStateContext: React.createContext({}) }));
jest.mock('@/pages/dashboard/config', () => ({ hexPalette: ['#7EB26D'] }));
jest.mock('ahooks', () => ({ useSize: () => ({ width: 640, height: 240 }) }));
jest.mock('./Main', () => () => <div data-testid='timeseries-chart' />);
jest.mock('./components/Legend', () => ({
  LegendTable: ({ data, legendColumns }: { data: DataItem[]; legendColumns: string[] }) => (
    <div data-testid='legend-table'>
      {legendColumns.join(',')}
      {data.map((item) => (
        <span key={item.id}>{item.name}</span>
      ))}
    </div>
  ),
  LegendList: () => <div data-testid='legend-list' />,
}));

function renderTimeseries(options?: IPanel['options']) {
  const props = createPanelChartProps({
    series: [{ id: 'series-a', refId: 'A', name: 'CPU usage', metric: {}, data: [[1000, 10]] }],
  });
  const { options: _options, ...panel } = props.values;
  const values = { ...panel, type: 'timeseries', ...(options === undefined ? {} : { options }) } as IPanel;
  return render(<Timeseries {...props} values={values} />);
}

describe('timeseries legend configuration compatibility', () => {
  it.each([undefined, {}])('renders the chart and default table legend when options are %p', (options) => {
    renderTimeseries(options);

    expect(screen.getByTestId('timeseries-chart')).toBeInTheDocument();
    expect(screen.getByTestId('legend-table')).toHaveTextContent('CPU usage');
    expect(screen.getByTestId('legend-table')).toHaveTextContent('max,min,avg,sum,last');
    expect(screen.queryByTestId('legend-list')).not.toBeInTheDocument();
  });

  it('preserves an explicitly hidden legend', () => {
    renderTimeseries({ legend: { displayMode: 'hidden' } } as IPanel['options']);

    expect(screen.getByTestId('timeseries-chart')).toBeInTheDocument();
    expect(screen.queryByTestId('legend-table')).not.toBeInTheDocument();
    expect(screen.queryByTestId('legend-list')).not.toBeInTheDocument();
  });

  it('preserves list legends', () => {
    renderTimeseries({ legend: { displayMode: 'list' } } as IPanel['options']);

    expect(screen.getByTestId('timeseries-chart')).toBeInTheDocument();
    expect(screen.getByTestId('legend-list')).toBeInTheDocument();
    expect(screen.queryByTestId('legend-table')).not.toBeInTheDocument();
  });
});
