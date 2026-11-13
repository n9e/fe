/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import BarGauge from './index';
import { DashboardRuntimeProvider } from '../../../globalState';
import type { IPanel } from '../../../types';
import type { BarGaugeValue } from './utils';

jest.mock('ahooks', () => ({ useSize: () => ({ width: 600, height: 300 }) }));
jest.mock('@/utils/getTextWidth', () => ({ __esModule: true, default: () => 30, defaultFont: '' }));
jest.mock('./BasicDisplayMode', () => ({
  __esModule: true,
  default: ({ item }: { item: BarGaugeValue }) => (
    <div data-testid={item.id} style={{ color: item.color }}>
      {item.value}
    </div>
  ),
}));
jest.mock('./LCDBars', () => () => null);

const series = [10, 60, 90, 100, 160].map((value) => ({ id: String(value), refId: String(value), name: String(value), metric: {}, data: [[1000, value] as [number, number]] }));
const panel = (mode: 'percentage' | 'absolute', min = 0, max = 200): IPanel => ({
  id: 'bar',
  name: 'bar',
  type: 'barGauge',
  description: '',
  layout: { i: 'bar', x: 0, y: 0, w: 24, h: 8 },
  targets: [],
  overrides: [],
  custom: { calc: 'lastNotNull', displayMode: 'basic' },
  options: {
    standardOptions: { min, max, unit: 'none' },
    thresholds: {
      mode,
      steps: [
        { type: 'base', value: null, color: 'green' },
        { value: mode === 'percentage' ? 50 : 100, color: 'yellow' },
        { value: mode === 'percentage' ? 80 : 160, color: 'red' },
      ],
    },
  },
});

it.each(['percentage', 'absolute'] as const)('%s thresholds use the displayed 0–200 range', (mode) => {
  render(
    <DashboardRuntimeProvider>
      <BarGauge values={panel(mode)} series={series} />
    </DashboardRuntimeProvider>,
  );
  for (const [value, color] of [
    [10, 'green'],
    [60, 'green'],
    [90, 'green'],
    [100, 'yellow'],
    [160, 'red'],
  ] as const) {
    expect(screen.getByTestId(String(value))).toHaveStyle({ color });
  }
});

it('uses the configured range for all-values mode and keeps mapping colors ahead of thresholds', () => {
  const values = panel('percentage', -100, 100);
  values.custom.showMode = 'allValues';
  values.options.valueMappings = [{ type: 'special', match: { special: 60 }, result: { text: 'SIXTY', color: 'blue' } }];
  render(
    <DashboardRuntimeProvider>
      <BarGauge values={values} series={series} />
    </DashboardRuntimeProvider>,
  );
  expect(screen.getByTestId('10_1000')).toHaveStyle({ color: 'yellow' });
  expect(screen.getByTestId('60_1000')).toHaveStyle({ color: 'blue' });
  expect(screen.getByTestId('60_1000')).toHaveTextContent('SIXTY');
  expect(screen.getByTestId('90_1000')).toHaveStyle({ color: 'red' });
});
