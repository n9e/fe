/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { createPanelChartProps } from '@/pages/dashboard/test/fixtures/panelChartProps';

import { lazyPanelChart } from './lazyPanelChart';
import type { PanelChartProps } from './types';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key }),
}));

type LoadedChart = React.ComponentType<PanelChartProps>;

/** 构造一个永远 pending 的加载器，用于断言加载占位。 */
function createPendingLoader() {
  return jest.fn(
    () =>
      new Promise<{ default: LoadedChart }>(() => {
        // 永不 resolve：只关心加载中的展示
      }),
  );
}

describe('lazyPanelChart', () => {
  it('shows a local placeholder until the chart module resolves', async () => {
    const load = createPendingLoader();
    const Chart = lazyPanelChart(load);

    render(<Chart {...createPanelChartProps()} />);

    expect(screen.getByTestId('panel-chart-loading')).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('renders the loaded chart with the original panel props', async () => {
    const load = jest.fn().mockResolvedValue({
      default: (props: PanelChartProps) => <div data-testid='loaded-chart'>{`${props.id}:${props.values.type}`}</div>,
    });
    const Chart = lazyPanelChart(load);

    render(<Chart {...createPanelChartProps()} />);

    expect(await screen.findByTestId('loaded-chart')).toHaveTextContent('panel-1:pie');
  });

  it('shows a load error and recovers after retry', async () => {
    const load = jest
      .fn()
      .mockRejectedValueOnce(new Error('Failed to fetch dynamically imported module'))
      .mockResolvedValue({ default: () => <div data-testid='loaded-chart' /> });
    const Chart = lazyPanelChart(load);

    render(<Chart {...createPanelChartProps()} />);

    const errorPlaceholder = await screen.findByTestId('panel-chart-load-error');
    expect(errorPlaceholder).toHaveTextContent('Failed to fetch dynamically imported module');

    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByTestId('loaded-chart')).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('loads the module once and reuses it across prop updates', async () => {
    const load = jest.fn().mockResolvedValue({ default: () => <div data-testid='loaded-chart' /> });
    const Chart = lazyPanelChart(load);
    const view = render(<Chart {...createPanelChartProps()} />);
    await screen.findByTestId('loaded-chart');

    view.rerender(<Chart {...createPanelChartProps({ id: 'panel-2' })} />);

    expect(screen.getByTestId('loaded-chart')).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(1);
  });
});
