/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/App', () => ({ CommonStateContext: React.createContext({ darkMode: false }) }));
jest.mock('../dashboard/Renderer/Renderer', () => ({
  __esModule: true,
  default: () => {
    const store = require('../dashboard/globalState').useDashboardRuntimeStoreIfAvailable();
    return require('react').createElement('div', { 'data-testid': 'renderer' }, store ? 'has-runtime' : 'missing-runtime');
  },
}));

import Main from './Main';

describe('temporary chart page', () => {
  it('renders the panel inside an isolated dashboard runtime', () => {
    render(<Main width={800} range={{ start: 'now-1h', end: 'now' }} item={{ dataProps: { id: 'chart_1', type: 'timeseries' } }} />);

    // /chart/:ids 不在仪表盘页面内，Renderer 需要的运行时容器必须由本页提供
    expect(screen.getByTestId('renderer')).toHaveTextContent('has-runtime');
  });
});
