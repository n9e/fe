/** @jest-environment jsdom */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Title from './Title';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (value: string) => value, i18n: { language: 'zh-CN' } }) }));
jest.mock('@/App', () => {
  const React = require('react');
  return {
    CommonStateContext: React.createContext({ siteInfo: {}, dashboardSaveMode: 'auto' }),
  };
});
jest.mock('@/components/TimeRangePicker', () => ({
  TimeRangePickerWithRefresh: () => <div data-testid='time-range-picker' />,
  timeRangeUnix: jest.fn(),
}));
jest.mock('@/services/dashboardV2', () => ({ getBusiGroupsDashboards: jest.fn(), updateDashboard: jest.fn(), updateDashboardConfigs: jest.fn() }));
jest.mock('@/components/AiChatNG/FlashAiButton', () => ({ AiButton: () => null }));
jest.mock('@/components/AiChatNG/recommend', () => ({ getDashboardDetailPrompts: () => [] }));
jest.mock('../globalState', () => ({ useGlobalState: () => [[]] }));
jest.mock('../DashboardLinks', () => () => null);
jest.mock('../config', () => ({ AddPanelIcon: () => null }));
jest.mock('../Editor/config', () => ({ visualizations: [] }));
jest.mock('../List/FormModal', () => () => null);
jest.mock('../List/ImportGrafanaURLFormModal', () => () => null);
jest.mock('../List/SharingLinkModal', () => () => null);
jest.mock('./utils', () => ({ goBack: jest.fn(), dashboardTimeCacheKey: 'dashboard-timeRangePicker-value' }));
jest.mock('../Panels/utils', () => ({ isValidPanelConfig: jest.fn() }));

test('fullscreen header only renders the dashboard title and time range picker', () => {
  render(
    <MemoryRouter initialEntries={['/dashboards/1?viewMode=fullscreen&__show_header=true']}>
      <Title
        fullscreenHeaderOnly
        dashboard={{ id: 1, name: 'CPU Overview', configs: {} } as never}
        setDashboardLinks={jest.fn()}
        handleUpdateDashboardConfigs={jest.fn()}
        range={{ start: 'now-1h', end: 'now' }}
        setRange={jest.fn()}
        timezone='Asia/Shanghai'
        setTimezone={jest.fn()}
        setIntervalSeconds={jest.fn()}
        onAddPanel={jest.fn()}
        onImportPanel={jest.fn()}
        isPreview={false}
        isBuiltin={false}
        isAuthorized
        onToggleFullscreen={jest.fn()}
        editable
        updateAtRef={{ current: undefined }}
        allowedLeave
        hasUnsavedChanges={false}
        setAllowedLeave={jest.fn()}
        setHasUnsavedChanges={jest.fn()}
        routerPromptRef={{ current: { showPrompt: jest.fn() } } as never}
      />
    </MemoryRouter>,
  );

  expect(screen.getByText('CPU Overview')).toBeInTheDocument();
  expect(screen.getByTestId('time-range-picker')).toBeInTheDocument();
  expect(screen.queryByText('add_panel')).not.toBeInTheDocument();
  expect(screen.queryByText('common:btn.edit')).not.toBeInTheDocument();
});
