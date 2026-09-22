/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';

import { createPanelChartProps } from '@/pages/dashboard/test/fixtures/panelChartProps';

import PanelRenderer from './PanelRenderer';
import { getPanelTypeDefinition } from './index';
import type { IType } from '../../types';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key }),
}));
jest.mock('./index', () => ({ getPanelTypeDefinition: jest.fn() }));

const getPanelTypeDefinitionMock = getPanelTypeDefinition as jest.Mock;

describe('PanelRenderer', () => {
  beforeEach(() => {
    getPanelTypeDefinitionMock.mockReset();
    // React 会把被边界捕获的错误打到 console.error，这里静默以避免污染测试输出
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the registered chart for a known panel type', () => {
    getPanelTypeDefinitionMock.mockReturnValue({ chart: () => <div data-testid='pie-chart' /> });

    render(<PanelRenderer type='pie' {...createPanelChartProps()} />);

    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('keeps the unknown-type hint for unregistered types', () => {
    getPanelTypeDefinitionMock.mockReturnValue(undefined);

    render(<PanelRenderer type={'mystery' as IType} {...createPanelChartProps()} />);

    expect(screen.getByText('detail.invalidPanelType mystery')).toBeInTheDocument();
  });

  it('renders a local fallback when the chart throws', () => {
    getPanelTypeDefinitionMock.mockReturnValue({
      chart: () => {
        throw new Error('render failed');
      },
    });

    render(<PanelRenderer type='pie' {...createPanelChartProps()} />);

    expect(screen.getByTestId('panel-render-error')).toHaveTextContent('render failed');
  });
});
