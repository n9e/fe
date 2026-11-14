/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import RetainedSidebar from './';
import { readControlSummary } from './summary';

beforeAll(async () => {
  await i18next
    .use(initReactI18next)
    .init({ lng: 'en_US', resources: { en_US: { retainedSidebar: { collapse: 'Collapse {{title}}', expand: 'Expand {{title}}', empty: 'No selection', view: 'View' } } } });
});
beforeEach(() => localStorage.clear());

test('keeps both sidebar headings in document order, with selections and mounted contents', () => {
  render(
    <div>
      <RetainedSidebar title='Views' summary='Production' collapseLocalStorageKey='views' widthLocalStorageKey='views-width'>
        <input defaultValue='kept' aria-label='draft' />
      </RetainedSidebar>
      <RetainedSidebar title='Filters' summary='cluster=prod' collapseLocalStorageKey='filters' widthLocalStorageKey='filters-width'>
        <span>Filter contents</span>
      </RetainedSidebar>
      <main>Charts</main>
    </div>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Collapse Views' }));
  fireEvent.click(screen.getByRole('button', { name: 'Collapse Filters' }));
  expect(Array.from(document.querySelectorAll('.fc-retained-sidebar__selection')).map((item) => item.textContent)).toEqual(['Production', 'cluster=prod']);
  expect(document.querySelectorAll('.fc-retained-sidebar--collapsed')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Expand Views' }));
  expect(screen.getByRole('textbox', { name: 'draft' })).toHaveValue('kept');
  expect(screen.getByRole('button', { name: 'Expand Filters' })).toBeInTheDocument();
});

test('summarizes display labels of view, database, table, and index autocomplete', () => {
  const root = document.createElement('div');
  root.innerHTML =
    '<div class="ant-select n9e-view-select"><span class="ant-select-selection-item" title="Saved view">901</span></div><div class="outlined-select-wrapper"><label>Database</label><div class="ant-select"><span class="ant-select-selection-item">logs</span></div></div><div class="outlined-select-wrapper"><label>Table</label><div class="ant-select"><span class="ant-select-selection-item">access</span></div></div><div class="outlined-autocomplete-wrapper"><label>Index</label><div class="ant-select ant-select-auto-complete"><input value="app-*" /></div></div>';
  expect(readControlSummary(root, 'View')).toBe('View: Saved view / Database: logs / Table: access / Index: app-*');
  root.querySelectorAll('.ant-select-selection-item')[1].textContent = 'new_logs';
  expect(readControlSummary(root, 'View')).toContain('Database: new_logs');
});

test('updates the collapsed summary when a saved filter changes while hidden', async () => {
  const { rerender } = render(
    <RetainedSidebar title='Logs' autoSummary collapseLocalStorageKey='logs' widthLocalStorageKey='logs-width'>
      <div className='ant-select'>
        <span className='ant-select-selection-item'>before</span>
      </div>
    </RetainedSidebar>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Collapse Logs' }));
  await waitFor(() => expect(document.querySelector('.fc-retained-sidebar__selection')).toHaveTextContent('before'));
  rerender(
    <RetainedSidebar title='Logs' autoSummary collapseLocalStorageKey='logs' widthLocalStorageKey='logs-width'>
      <div className='ant-select'>
        <span className='ant-select-selection-item'>after</span>
      </div>
    </RetainedSidebar>,
  );
  await waitFor(() => expect(document.querySelector('.fc-retained-sidebar__selection')).toHaveTextContent('after'));
});
