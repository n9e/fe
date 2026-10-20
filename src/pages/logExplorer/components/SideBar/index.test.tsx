/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SideBar from './index';

jest.mock('../../constants', () => ({ NAME_SPACE: 'log_explorer' }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

beforeEach(() => localStorage.clear());

it('collapses to an inline button, retaining mounted controls and persisting the state', () => {
  const { container, unmount } = render(
    <div style={{ display: 'flex' }}>
      <SideBar ns='doris'>
        <input defaultValue='my-table' aria-label='table' />
      </SideBar>
      <div>query</div>
    </div>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'sidebar.collapse' }));
  expect(screen.getByRole('button', { name: 'sidebar.expand' })).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByText('sidebar.title')).not.toBeInTheDocument();
  expect(container.querySelector('.n9e-log-sidebar-body')).toHaveAttribute('hidden');
  expect(container.querySelector('.n9e-log-sidebar-body')).not.toHaveClass('flex');
  expect(screen.getByLabelText('table')).not.toBeVisible();
  expect(screen.getByLabelText('table')).toHaveValue('my-table');
  expect(container.querySelector('.n9e-log-sidebar')).toHaveStyle({ width: '0px', marginRight: '0px' });
  expect(localStorage.getItem('ng-doris-explorer-sidebar-collapse-retained-v2')).toBe('1');
  unmount();
  render(<SideBar ns='doris'>controls</SideBar>);
  expect(screen.getByRole('button', { name: 'sidebar.expand' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'sidebar.expand' }));
  expect(screen.getByRole('button', { name: 'sidebar.collapse' })).toBeInTheDocument();
});
