/** @jest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';

jest.mock('ahooks', () => ({ useSize: () => ({ width: 320, height: 160 }) }));
jest.mock('@/pages/dashboard/Renderer/Renderer/Hexbin/utils', () => ({ getTextWidth: (value: string) => value.length * 8 }));
jest.mock('@/pages/dashboard/Variables/utils/replaceTemplateVariables', () => ({ useReplaceTemplateVariables: () => (value: string) => value }));

import { DashboardRuntimeProvider } from '../../../globalState';
import type { IPanel } from '../../../types';
import type { CalculatedSeries } from '../../utils/getCalculatedValuesBySeries';
import BarGauge from './index';
import { getGradientBackground } from './utils';

const series: CalculatedSeries[] = [
  {
    id: 'A',
    refId: 'A',
    name: 'cpu',
    metric: { __name__: 'cpu' },
    data: [
      [1, 20],
      [2, 40],
    ],
  },
  {
    id: 'B',
    refId: 'B',
    name: 'mem',
    metric: { __name__: 'mem' },
    data: [
      [1, 10],
      [2, 80],
    ],
  },
];

function renderGauge(custom: Record<string, unknown>) {
  const values: IPanel = {
    id: 'bar-gauge',
    name: 'bar gauge',
    description: '',
    layout: { h: 8, w: 12, x: 0, y: 0, i: 'bar-gauge' },
    targets: [],
    type: 'barGauge',
    options: {
      thresholds: {
        mode: 'absolute',
        steps: [
          { type: 'base', value: null, color: '#00ff00' },
          { value: 50, color: '#ff0000' },
        ],
      },
    },
    custom: { calc: 'lastNotNull', valueField: 'Value', ...custom },
    overrides: [],
  };
  return render(
    <DashboardRuntimeProvider>
      <BarGauge values={values} series={series} />
    </DashboardRuntimeProvider>,
  );
}

describe('BarGauge display options', () => {
  it('uses a vertical layout with value above the bar and name below it', () => {
    const view = renderGauge({ orientation: 'vertical', namePlacement: 'top' });

    expect(view.container.querySelector('.renderer-bar-gauge-vertical')).toBeInTheDocument();
    expect(view.container.querySelectorAll('.renderer-bar-gauge-item-vertical')).toHaveLength(2);
    expect(view.container.querySelectorAll('.renderer-bar-gauge-item-name-bottom')).toHaveLength(2);
    expect(view.container.querySelector('.renderer-bar-gauge-item')).toHaveStyle({ width: '155px' });
    expect(view.container.querySelector('.renderer-bar-gauge-item-value-text')).toHaveStyle({ fontSize: '18px' });
  });

  it('renders gradient mode and hides names when configured', () => {
    const view = renderGauge({ displayMode: 'gradient', namePlacement: 'hidden', valueMode: 'text' });

    expect(view.container.querySelectorAll('.renderer-bar-gauge-item-name')).toHaveLength(0);
    expect(view.container.querySelector('.renderer-bar-gauge-item-value-color-bg')).toBeInTheDocument();
    expect(
      getGradientBackground(
        {
          mode: 'absolute',
          steps: [
            { type: 'base', value: null, color: '#00ff00' },
            { value: 50, color: '#ff0000' },
          ],
        },
        0,
        100,
        '#00ff00',
      ),
    ).toContain('linear-gradient');
    expect(view.container.querySelector('.renderer-bar-gauge-item-content > .renderer-bar-gauge-item-value-text')).toBeInTheDocument();
  });

  it('uses origin values and applies the all-values limit', () => {
    const view = renderGauge({ showMode: 'allValues', limit: 2 });

    expect(view.container.querySelectorAll('.renderer-bar-gauge-item')).toHaveLength(2);
  });

  it('formats and colors the combined other item in LCD mode', () => {
    const view = renderGauge({ displayMode: 'lcd', topn: 1, combine_other: true });
    const items = view.container.querySelectorAll('.renderer-bar-gauge-lcd-item');

    expect(items).toHaveLength(2);
    expect(items[1]).toHaveTextContent('Other');
    expect(items[1].querySelector('.renderer-bar-gauge-lcd-item-value')).toHaveStyle({ color: '#00ff00' });
  });

  it('uses the larger of automatic size and manual minimum width in vertical mode', () => {
    const view = renderGauge({ orientation: 'vertical', sizing: 'manual', minVizWidth: 170 });

    expect(view.container.querySelector('.renderer-bar-gauge-item')).toHaveStyle({ width: '170px' });
  });

  it('keeps the automatic width when it exceeds the manual minimum width in vertical mode', () => {
    const view = renderGauge({ orientation: 'vertical', sizing: 'manual', minVizWidth: 40 });

    expect(view.container.querySelector('.renderer-bar-gauge-item')).toHaveStyle({ width: '155px' });
  });

  it('clamps manual horizontal rows between their minimum and maximum heights', () => {
    const view = renderGauge({ orientation: 'horizontal', sizing: 'manual', minVizHeight: 18, maxVizHeight: 18 });

    expect(view.container.querySelector('.renderer-bar-gauge-item')).toHaveStyle({ height: '18px' });
  });

  it('uses panel height to size automatic horizontal rows', () => {
    const view = renderGauge({ orientation: 'horizontal' });

    expect(view.container.querySelector('.renderer-bar-gauge-item')).toHaveStyle({ height: '75px' });
  });

  it('reserves name-row height for horizontal top placement', () => {
    const view = renderGauge({ orientation: 'horizontal', namePlacement: 'top' });

    expect(view.container.querySelector('.renderer-bar-gauge-item')).toHaveStyle({ height: '75px' });
  });

  it('reserves the same value column width for every horizontal bar', () => {
    const view = renderGauge({ orientation: 'horizontal' });
    const widths = Array.from(view.container.querySelectorAll<HTMLElement>('.renderer-bar-gauge-item-value-text')).map((element) => element.style.width);

    expect(widths).toEqual(['20px', '20px']);
  });

  it('uses auto orientation for a wide panel', () => {
    const view = renderGauge({ orientation: 'auto' });

    expect(view.container.querySelector('.renderer-bar-gauge-vertical')).toBeInTheDocument();
  });

  it('uses horizontal layout when orientation is absent', () => {
    const view = renderGauge({});

    expect(view.container.querySelector('.renderer-bar-gauge-horizontal')).toBeInTheDocument();
  });

  it('uses the shared scrollbar style for bar lists', () => {
    const view = renderGauge({});

    expect(view.container.querySelector('.renderer-bar-gauge')).toHaveClass('best-looking-scroll');
  });
});
