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

it('fills the actual page viewport and preserves its height when the sticky sidebar is scrolled', () => {
  let viewportHeight = 800;
  const rectSpy = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const page = this.closest<HTMLElement>('[data-testid="page"]');
    return { top: this.dataset.testid === 'page' ? 80 : 112 - (page?.scrollTop ?? 0) } as DOMRect;
  });
  const clientRectsSpy = jest.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);
  const heightSpy = jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return this.dataset.testid === 'page' ? viewportHeight : 0;
  });
  try {
    const { container } = render(
      <div data-testid='page' style={{ overflowY: 'auto', padding: 16 }}>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'flex' }}>
            <SideBar ns='doris'>fields</SideBar>
            <div>results</div>
          </div>
        </div>
      </div>,
    );
    const sidebar = container.querySelector<HTMLElement>('.n9e-log-sidebar')!;
    const height = () => sidebar.style.getPropertyValue('--log-sidebar-height');
    // Scroll viewport bottom (864) - row top (112) - card bottom padding (16).
    expect(height()).toBe('736px');
    expect(sidebar.style.getPropertyValue('--log-sidebar-top')).toBe('16px');
    viewportHeight = 1000;
    fireEvent.resize(window);
    expect(height()).toBe('936px');
    screen.getByTestId('page').scrollTop = 350;
    fireEvent.resize(window);
    expect(height()).toBe('936px');
    expect(sidebar.style.getPropertyValue('--log-sidebar-top')).toBe('16px');
    fireEvent.click(screen.getByRole('button', { name: 'sidebar.collapse' }));
    viewportHeight = 900;
    fireEvent.resize(window);
    // Collapsed buttons keep their own compact size; no height updates apply.
    expect(height()).toBe('936px');
    fireEvent.click(screen.getByRole('button', { name: 'sidebar.expand' }));
    expect(height()).toBe('836px');
  } finally {
    rectSpy.mockRestore();
    clientRectsSpy.mockRestore();
    heightSpy.mockRestore();
  }
});
