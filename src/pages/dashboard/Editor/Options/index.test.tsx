/** @jest-environment jsdom */
import React from 'react';
import { Form } from 'antd';
import { render, screen } from '@testing-library/react';

import { DashboardRuntimeProvider } from '../../globalState';
import type { IType } from '../../types';
import Options from './index';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }), Trans: () => null }));
jest.mock('@/App', () => ({ CommonStateContext: React.createContext({ darkMode: false }) }));
jest.mock('@/utils/constant', () => ({ PRIMARY_COLOR: '#3274d9', SIZE: 8 }));
jest.mock('@/components/AiChat/images/ai-chat/ai_chat_icon.svg', () => ({ __esModule: true, default: 'ai-chat.svg' }));

function OptionsForm({ type }: { type: IType }) {
  return (
    <DashboardRuntimeProvider>
      <Form key={type}>
        <Options type={type} targets={[{ refId: 'A' }]} />
      </Form>
    </DashboardRuntimeProvider>
  );
}

describe('editor options panel', () => {
  it('renders the options immediately when opening and switching chart types', () => {
    const { rerender } = render(<OptionsForm type='timeseries' />);

    expect(screen.getByText('panel.custom.timeseries.drawStyle')).toBeInTheDocument();

    rerender(<OptionsForm type='text' />);

    expect(screen.getByPlaceholderText('panel.custom.text.content_placeholder')).toBeInTheDocument();
    expect(screen.queryByText('panel.custom.timeseries.drawStyle')).not.toBeInTheDocument();
  });

  it('keeps the unknown-type hint for unregistered types', () => {
    render(<OptionsForm type={'not-a-chart' as IType} />);

    expect(screen.getByText('detail.invalidPanelType not-a-chart')).toBeInTheDocument();
  });
});
