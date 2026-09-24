/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import Options from './index';
import { getPanelTypeDefinition } from '../../Renderer/registry';
import type { ITarget, IType } from '../../types';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key }),
}));
jest.mock('../../Renderer/registry', () => ({ getPanelTypeDefinition: jest.fn() }));

const getPanelTypeDefinitionMock = getPanelTypeDefinition as jest.Mock;

/** 每个用例使用不同的图表类型，避免命中模块级的组件缓存。 */
function mockOptionsLoader(type: IType, loadOptions: jest.Mock) {
  getPanelTypeDefinitionMock.mockReturnValue({ type, loadOptions });
}

describe('editor options panel loading', () => {
  beforeEach(() => {
    getPanelTypeDefinitionMock.mockReset();
  });

  it('renders the loaded options panel with the panel targets', async () => {
    const loadOptions = jest.fn().mockResolvedValue({
      default: ({ targets }: { targets: ITarget[] }) => <div data-testid='loaded-options'>{targets.length}</div>,
    });
    mockOptionsLoader('text', loadOptions);

    render(<Options type='text' targets={[{ refId: 'A' }]} />);

    expect(screen.getByTestId('panel-options-loading')).toBeInTheDocument();
    expect(await screen.findByTestId('loaded-options')).toHaveTextContent('1');
  });

  it('shows a retryable error inside the form when the options chunk fails', async () => {
    const loadOptions = jest
      .fn()
      .mockRejectedValueOnce(new Error('Failed to fetch dynamically imported module'))
      .mockResolvedValue({ default: () => <div data-testid='loaded-options' /> });
    mockOptionsLoader('gauge', loadOptions);

    render(<Options type='gauge' targets={[]} />);

    expect(await screen.findByTestId('panel-options-load-error')).toHaveTextContent('Failed to fetch dynamically imported module');

    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByTestId('loaded-options')).toBeInTheDocument();
    expect(loadOptions).toHaveBeenCalledTimes(2);
  });

  it('keeps the unknown-type hint for unregistered types', () => {
    getPanelTypeDefinitionMock.mockReturnValue(undefined);

    render(<Options type={'not-a-chart' as IType} targets={[]} />);

    expect(screen.getByText('detail.invalidPanelType not-a-chart')).toBeInTheDocument();
  });
});
