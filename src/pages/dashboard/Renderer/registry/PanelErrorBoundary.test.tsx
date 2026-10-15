/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';

import PanelErrorBoundary from './PanelErrorBoundary';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key }),
}));

let shouldThrow = true;

/** 可切换是否抛错的子组件，用于验证错误边界的重试与重置。 */
function FlakyChart() {
  if (shouldThrow) {
    throw new Error('chart exploded');
  }
  return <div data-testid='healthy-chart' />;
}

describe('PanelErrorBoundary', () => {
  beforeEach(() => {
    shouldThrow = true;
    // React 会把被边界捕获的错误打到 console.error，这里静默以避免污染测试输出
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reports a render error to the panel header without rendering a fallback', () => {
    const onError = jest.fn();

    render(
      <PanelErrorBoundary resetKey='panel-1' onError={onError}>
        <FlakyChart />
      </PanelErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'chart exploded' }));
    expect(screen.queryByTestId('panel-render-error')).not.toBeInTheDocument();
    expect(screen.queryByTestId('healthy-chart')).not.toBeInTheDocument();
  });

  it('clears the captured error when the reset key changes', () => {
    const onError = jest.fn();
    const view = render(
      <PanelErrorBoundary resetKey='panel-1' onError={onError}>
        <FlakyChart />
      </PanelErrorBoundary>,
    );

    shouldThrow = false;
    view.rerender(
      <PanelErrorBoundary resetKey='panel-2' onError={onError}>
        <FlakyChart />
      </PanelErrorBoundary>,
    );

    expect(onError).toHaveBeenLastCalledWith(undefined);
    expect(screen.getByTestId('healthy-chart')).toBeInTheDocument();
  });
});
