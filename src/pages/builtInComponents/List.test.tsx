/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import List from './List';
import { getComponents, putComponent } from './services';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/components/FiremapAccess', () => ({ useCanAccessFiremap: () => false }));
jest.mock('@/components/pageLayout', () => ({ __esModule: true, default: ({ children }) => <>{children}</> }));
jest.mock('@/components/AuthorizationWrapper', () => ({ __esModule: true, default: ({ children }) => <>{children}</> }));
jest.mock('@/utils/constant', () => ({ IS_PLUS: false, IS_ENT: false }));
jest.mock('./services', () => ({ getComponents: jest.fn(), putComponent: jest.fn() }));
jest.mock('./Instructions', () => ({
  __esModule: true,
  default: ({ value, onChange, editabled }) => (editabled ? <textarea aria-label='Instructions' value={value} onChange={(e) => onChange(e.target.value)} /> : <p>{value}</p>),
}));
jest.mock('./AlertRules', () => () => null);
jest.mock('./CollectTpls', () => () => null);
jest.mock('./Metrics', () => () => null);
jest.mock('./Dashboards', () => () => null);
jest.mock('./ComponentSteps', () => () => null);
jest.mock('./components/ComponentFormModal', () => () => null);

const components = [
  { id: 1, ident: 'SNMP', logo: '', disabled: 0 as const, readme: 'Original SNMP instructions' },
  { id: 2, ident: 'Linux', logo: '', disabled: 0 as const, readme: 'Original Linux instructions' },
];
const mockPutComponent = jest.mocked(putComponent);

beforeEach(() => {
  localStorage.clear();
  jest.mocked(getComponents).mockReset().mockResolvedValue(components);
  mockPutComponent.mockReset().mockResolvedValue(undefined);
});

async function renderEditor() {
  const history = createMemoryHistory({ initialEntries: ['/components?component=SNMP&tab=tab_instructions'] });
  const view = render(
    <Router history={history}>
      <List />
    </Router>,
  );
  fireEvent.click(await screen.findByRole('button', { name: 'common:btn.edit' }));
  return { ...view, history };
}

function edit(value: string) {
  fireEvent.change(screen.getByRole('textbox', { name: 'Instructions' }), { target: { value } });
}

function closeDrawer() {
  fireEvent.click(document.querySelector('.builtin-components-drawer .ant-drawer-extra .anticon-close')!);
}

it('waits for saving, blocks duplicate requests, and uses the saved version when cancelling or reopening', async () => {
  let resolve!: (value?: unknown) => void;
  mockPutComponent.mockReturnValue(new Promise((done) => (resolve = done)));
  await renderEditor();
  edit('Saved instructions');
  const save = screen.getByRole('button', { name: 'common:btn.ok' });
  fireEvent.click(save);
  fireEvent.click(save);
  expect(mockPutComponent).toHaveBeenCalledTimes(1);
  expect(mockPutComponent).toHaveBeenCalledWith({ ...components[0], readme: 'Saved instructions' });
  expect(screen.getByRole('textbox', { name: 'Instructions' })).toHaveValue('Saved instructions');
  expect(screen.getByRole('button', { name: 'common:btn.cancel' })).toBeDisabled();
  await act(async () => resolve());
  fireEvent.click(await screen.findByRole('button', { name: 'common:btn.edit' }));
  edit('Discard this change');
  fireEvent.click(screen.getByRole('button', { name: 'common:btn.cancel' }));
  expect(screen.getByText('Saved instructions')).toBeInTheDocument();
  closeDrawer();
  await waitFor(() => expect(screen.queryByText('Saved instructions')).not.toBeInTheDocument());
  fireEvent.click(screen.getByText('SNMP'));
  fireEvent.click(await screen.findByRole('button', { name: 'common:btn.edit' }));
  expect(screen.getByRole('textbox', { name: 'Instructions' })).toHaveValue('Saved instructions');
});

it('preserves a failed draft and allows retrying the same content', async () => {
  mockPutComponent.mockRejectedValueOnce(new Error('Save failed'));
  await renderEditor();
  edit('Retry this draft');
  fireEvent.click(screen.getByRole('button', { name: 'common:btn.ok' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'common:btn.cancel' })).toBeEnabled());
  expect(screen.getByRole('textbox', { name: 'Instructions' })).toHaveValue('Retry this draft');
  fireEvent.click(screen.getByRole('button', { name: 'common:btn.ok' }));
  await screen.findByRole('button', { name: 'common:btn.edit' });
  expect(mockPutComponent).toHaveBeenCalledTimes(2);
  expect(mockPutComponent).toHaveBeenLastCalledWith({ ...components[0], readme: 'Retry this draft' });
});

it('keeps changes typed during a save and cancels back to the successfully saved version', async () => {
  let resolve!: (value?: unknown) => void;
  mockPutComponent.mockReturnValueOnce(new Promise((done) => (resolve = done)));
  await renderEditor();
  edit('Submitted version');
  fireEvent.click(screen.getByRole('button', { name: 'common:btn.ok' }));
  edit('Newer unsaved version');
  await act(async () => resolve());
  expect(screen.getByRole('textbox', { name: 'Instructions' })).toHaveValue('Newer unsaved version');
  fireEvent.click(screen.getByRole('button', { name: 'common:btn.cancel' }));
  expect(screen.getByText('Submitted version')).toBeInTheDocument();
});

it('does not apply a late save to another component or exit its editing session', async () => {
  let resolve!: (value?: unknown) => void;
  mockPutComponent.mockReturnValueOnce(new Promise((done) => (resolve = done)));
  const { history } = await renderEditor();
  edit('Saved SNMP instructions');
  fireEvent.click(screen.getByRole('button', { name: 'common:btn.ok' }));
  closeDrawer();
  expect(history.location.search).not.toContain('component=');
  await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Instructions' })).not.toBeInTheDocument());
  fireEvent.click(screen.getByText('Linux'));
  fireEvent.click(await screen.findByRole('button', { name: 'common:btn.edit' }));
  edit('Unsaved Linux draft');
  await act(async () => resolve());
  expect(screen.getByRole('textbox', { name: 'Instructions' })).toHaveValue('Unsaved Linux draft');
  expect(screen.getByRole('button', { name: 'common:btn.cancel' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'common:btn.cancel' }));
  expect(screen.getByText('Original Linux instructions')).toBeInTheDocument();
});

it('resets a cancelled draft when another component opens', async () => {
  await renderEditor();
  edit('Discard on close');
  closeDrawer();
  await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Instructions' })).not.toBeInTheDocument());
  fireEvent.click(screen.getByText('Linux'));
  fireEvent.click(await screen.findByRole('button', { name: 'common:btn.edit' }));
  expect(screen.getByRole('textbox', { name: 'Instructions' })).toHaveValue('Original Linux instructions');
});
