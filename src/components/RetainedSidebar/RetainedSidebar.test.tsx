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
afterEach(() => jest.restoreAllMocks());

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

test.each(['', 'Explicit summary'])('does not listen for control changes with explicit summary %p', (summary) => {
  localStorage.setItem('logs-retained-v2', '1');
  const observe = jest.spyOn(MutationObserver.prototype, 'observe');
  const addEventListener = jest.spyOn(EventTarget.prototype, 'addEventListener');
  const { container } = render(
    <RetainedSidebar title='Logs' summary={summary} autoSummary collapseLocalStorageKey='logs' widthLocalStorageKey='logs-width'>
      <div className='ant-select'>
        <span className='ant-select-selection-item'>Automatic summary</span>
      </div>
    </RetainedSidebar>,
  );
  const body = container.querySelector('.fc-retained-sidebar__body');

  expect(container.querySelector('.fc-retained-sidebar__selection')).toHaveTextContent(summary || 'No selection');
  expect(observe.mock.calls.filter(([target]) => target === body)).toHaveLength(0);
  expect(addEventListener.mock.calls.filter(([type], index) => addEventListener.mock.contexts[index] === body && (type === 'input' || type === 'change'))).toHaveLength(0);
});

test.each(['', 'Explicit summary'])('resumes automatic summaries and cleans up subscriptions when switching from %p', (summary) => {
  localStorage.setItem('logs-retained-v2', '1');
  const sidebar = (value: string | undefined) => (
    <RetainedSidebar title='Logs' summary={value} autoSummary collapseLocalStorageKey='logs' widthLocalStorageKey='logs-width'>
      <div className='ant-select ant-select-auto-complete'>
        <input aria-label='index' defaultValue='initial-*' />
      </div>
    </RetainedSidebar>
  );
  const { container, rerender, unmount } = render(sidebar(summary));
  const body = container.querySelector<HTMLDivElement>('.fc-retained-sidebar__body')!;
  const input = body.querySelector('input')!;
  const selection = container.querySelector('.fc-retained-sidebar__selection');
  const observe = jest.spyOn(MutationObserver.prototype, 'observe');
  const disconnect = jest.spyOn(MutationObserver.prototype, 'disconnect');
  const addEventListener = jest.spyOn(body, 'addEventListener');
  const removeEventListener = jest.spyOn(body, 'removeEventListener');

  rerender(sidebar(undefined));
  expect(selection).toHaveTextContent('initial-*');
  expect(observe).toHaveBeenCalledTimes(1);
  expect(observe).toHaveBeenLastCalledWith(body, expect.objectContaining({ subtree: true }));
  expect(addEventListener).toHaveBeenCalledTimes(2);
  const firstUpdate = addEventListener.mock.calls[0][1];
  expect(addEventListener).toHaveBeenNthCalledWith(1, 'input', firstUpdate);
  expect(addEventListener).toHaveBeenNthCalledWith(2, 'change', firstUpdate);

  fireEvent.input(input, { target: { value: 'input-*' } });
  expect(selection).toHaveTextContent('input-*');
  fireEvent.change(input, { target: { value: 'change-*' } });
  expect(selection).toHaveTextContent('change-*');

  rerender(sidebar(summary));
  expect(selection).toHaveTextContent(summary || 'No selection');
  expect(disconnect.mock.contexts).toEqual([observe.mock.contexts[0]]);
  expect(removeEventListener).toHaveBeenCalledTimes(2);
  expect(removeEventListener).toHaveBeenNthCalledWith(1, 'input', firstUpdate);
  expect(removeEventListener).toHaveBeenNthCalledWith(2, 'change', firstUpdate);
  fireEvent.input(input, { target: { value: 'while-disabled-*' } });
  expect(selection).toHaveTextContent(summary || 'No selection');

  rerender(sidebar(undefined));
  expect(selection).toHaveTextContent('while-disabled-*');
  expect(observe).toHaveBeenCalledTimes(2);
  expect(observe).toHaveBeenLastCalledWith(body, expect.objectContaining({ subtree: true }));
  expect(observe.mock.contexts[1]).not.toBe(observe.mock.contexts[0]);
  expect(addEventListener).toHaveBeenCalledTimes(4);
  const secondUpdate = addEventListener.mock.calls[2][1];
  expect(addEventListener).toHaveBeenNthCalledWith(3, 'input', secondUpdate);
  expect(addEventListener).toHaveBeenNthCalledWith(4, 'change', secondUpdate);
  fireEvent.change(input, { target: { value: 'resumed-*' } });
  expect(selection).toHaveTextContent('resumed-*');

  unmount();
  expect(disconnect.mock.contexts).toEqual(observe.mock.contexts);
  expect(removeEventListener).toHaveBeenCalledTimes(4);
  expect(removeEventListener).toHaveBeenNthCalledWith(3, 'input', secondUpdate);
  expect(removeEventListener).toHaveBeenNthCalledWith(4, 'change', secondUpdate);
});
