/** @jest-environment jsdom */

import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigProvider, message } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Provider as MotionProvider } from 'rc-motion';

import { getDashboard } from '@/services/dashboardV2';
import { getComponents, postPayloads } from '@/pages/builtInComponents/services';
import type { Component } from '@/pages/builtInComponents/types';
import en_US from '../locale/en_US';
import SaveToBuiltinModal from './SaveToBuiltinModal';
import { getValidImportData } from './utils';
import request from '@/utils/request';
import { useIsAuthorized } from '@/components/AuthorizationWrapper';
import { RequestMethod } from '@/store/common';

jest.mock('@/services/dashboardV2', () => ({ getDashboard: jest.fn() }));
jest.mock('@/pages/builtInComponents/services', () => ({ getComponents: jest.fn(), postPayloads: jest.fn() }));
jest.mock('@/utils/request', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/components/AuthorizationWrapper', () => ({ useIsAuthorized: jest.fn() }));
// Keep the real export serializer and JSON parser without loading unrelated renderers and import converters.
jest.mock('../../help/migrate/utils', () => ({}));
jest.mock('../utils/grafanaImport', () => ({}));
jest.mock('@/components/TimeRangePicker', () => ({}));

const mockGetComponents = jest.mocked(getComponents);
const mockGetDashboard = jest.mocked(getDashboard);
const mockPostPayloads = jest.mocked(postPayloads);
const mockRequest = jest.mocked(request);
const mockIsAuthorized = jest.mocked(useIsAuthorized);
const component: Component = { id: 7, ident: 'Linux', logo: '', readme: '', disabled: 0 };
const snmpComponent: Component = { ...component, id: 9, ident: 'SNMP' };
const collectTemplates = [
  { id: 1, name: 'ArubaOS-AC', device_type: 'wireless', brand: 'Aruba', models: ['9240'] },
  { id: 2, name: '华为 CE 设备', device_type: 'switch', brand: 'Huawei', models: ['S5735', 'CE6865'] },
];
const configs = {
  version: '4.0.0',
  var: [{ name: 'host', type: 'query', query: 'label_values(up, instance)', value: ['server-a'] }],
  panels: [{ id: 'cpu', type: 'timeseries', targets: [{ expr: 'rate(cpu_total{instance="$host"}[5m])' }], layout: { x: 0, y: 0, w: 12, h: 6 } }],
  links: [{ title: 'Detail', url: '/dashboards/detail' }],
};
const detail = { id: 42, name: 'CPU overview', tags: 'host linux', note: 'Keep this note', uuid: 123456, configs: JSON.stringify(configs), group_id: 3, public: 1 };

beforeAll(async () => {
  await i18next.use(initReactI18next).init({
    lng: 'en_US',
    fallbackLng: 'en_US',
    resources: {
      en_US: {
        dashboard: en_US,
        common: { btn: { save: 'Save', reload: 'Retry' }, table: { note: 'Note' } },
        'collect-tpls': { device_type: 'Device type', brand: 'Brand', models: 'Model' },
      },
    },
    interpolation: { escapeValue: false },
  });
});

beforeEach(() => {
  mockGetComponents.mockReset().mockResolvedValue([component, { ...component, id: 8, ident: 'PostgreSQL', disabled: 1 }, snmpComponent]);
  mockGetDashboard.mockReset().mockResolvedValue(detail);
  mockPostPayloads.mockReset().mockResolvedValue({});
  mockRequest.mockReset().mockResolvedValue({ dat: collectTemplates });
  mockIsAuthorized.mockReset().mockReturnValue(true);
  jest.spyOn(message, 'success').mockImplementation(jest.fn());
  // rc-align skips zero-sized triggers; jsdom needs a visible rectangle to finish opening the dropdown.
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, top: 0, left: 0, bottom: 32, right: 320, width: 320, height: 32, toJSON: () => ({}) });
});

afterEach(() => {
  jest.restoreAllMocks();
});

function renderModal(dashboard: React.ComponentProps<typeof SaveToBuiltinModal>['dashboard'] = { id: 42, name: 'CPU overview', tags: detail.tags, note: detail.note }) {
  const onClose = jest.fn();
  const view = render(
    <MotionProvider motion={false}>
      <ConfigProvider locale={enUS} virtual={false}>
        <SaveToBuiltinModal dashboard={dashboard} onClose={onClose} />
      </ConfigProvider>
    </MotionProvider>,
  );
  return { ...view, onClose };
}

async function selectComponent(name = 'Linux') {
  await waitFor(() => expect(screen.getByRole('combobox', { name: 'Target component' })).toBeEnabled());
  const user = userEvent.setup();
  await user.click(screen.getByRole('combobox', { name: 'Target component' }));
  await user.click(await screen.findByText(name, { selector: '.ant-select-item-option-content' }));
  return user;
}

function collectTemplateSelect() {
  return screen.getByRole('combobox', { name: 'Bind collect template' }).closest('.ant-select') as HTMLElement;
}

test('requires a component and a nonblank name, and searches disabled components with their status', async () => {
  renderModal();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled());
  expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(detail.name);
  expect(screen.getByRole('combobox', { name: 'Target component' })).toHaveValue('');
  const user = userEvent.setup();
  await user.clear(screen.getByRole('textbox', { name: 'Name' }));
  await user.type(screen.getByRole('textbox', { name: 'Name' }), '   ');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Enter a dashboard name')).toBeVisible();
  expect(await screen.findByText('Select a target component', { selector: '.ant-form-item-explain-error' })).toBeVisible();
  expect(mockGetDashboard).not.toHaveBeenCalled();
  await user.click(screen.getByRole('combobox', { name: 'Target component' }));
  await user.type(screen.getByRole('combobox', { name: 'Target component' }), 'postgres', { skipClick: true });
  await waitFor(() => {
    expect(screen.getByText('PostgreSQL (disabled)', { selector: '.ant-select-item-option-content' })).toBeVisible();
    expect(screen.queryByText('Linux', { selector: '.ant-select-item-option-content' })).not.toBeInTheDocument();
  });
});

test('saves a complete snapshot with the edited name and a fresh UUID without source ownership or public settings', async () => {
  const { onClose } = renderModal();
  const user = await selectComponent();
  expect(screen.getByText('host', { selector: '.ant-select-selection-item-content' })).toBeVisible();
  expect(screen.getByText('linux', { selector: '.ant-select-selection-item-content' })).toBeVisible();
  expect(screen.getByRole('textbox', { name: 'Note' })).toHaveValue(detail.note);
  await user.clear(screen.getByRole('textbox', { name: 'Name' }));
  await user.type(screen.getByRole('textbox', { name: 'Name' }), '  Reusable CPU  ');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  expect(mockGetDashboard).toHaveBeenCalledWith(42);
  expect(mockPostPayloads).toHaveBeenCalledTimes(1);
  const [payload] = mockPostPayloads.mock.calls[0][0];
  expect(payload).toMatchObject({ component_id: 7, type: 'dashboard', cate: '', name: 'Reusable CPU' });
  expect(payload.uuid).not.toBe(detail.uuid);
  expect(Number.isSafeInteger(payload.uuid)).toBe(true);
  expect(JSON.parse(payload.content)).toEqual({ name: 'Reusable CPU', tags: detail.tags, note: detail.note, uuid: payload.uuid, configs });
  expect(getValidImportData(payload.content)).toMatchObject({ name: 'Reusable CPU', tags: detail.tags, note: detail.note, configs: detail.configs });
  expect(detail.name).toBe('CPU overview');
  expect(message.success).toHaveBeenCalledWith('Saved as a built-in dashboard');
});

test('saves edited tags and note instead of overwriting them with the fetched dashboard metadata', async () => {
  const { onClose } = renderModal();
  const user = await selectComponent();
  await user.type(screen.getByRole('combobox', { name: 'Tags' }), 'production{Enter}');
  await user.clear(screen.getByRole('textbox', { name: 'Note' }));
  await user.type(screen.getByRole('textbox', { name: 'Note' }), 'Reusable template\nFor production hosts');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  const [payload] = mockPostPayloads.mock.calls[0][0];
  expect(payload.tags).toBe('host linux production');
  expect(JSON.parse(payload.content)).toMatchObject({ tags: 'host linux production', note: 'Reusable template\nFor production hosts', configs });
  expect(getValidImportData(payload.content)).toMatchObject({ tags: 'host linux production', note: 'Reusable template\nFor production hosts' });
  expect(detail.tags).toBe('host linux');
  expect(detail.note).toBe('Keep this note');
});

test('preserves explicitly cleared tags and note when saving', async () => {
  const { onClose } = renderModal();
  const user = await selectComponent();
  await user.click(screen.getByLabelText('close-circle'));
  await user.clear(screen.getByRole('textbox', { name: 'Note' }));
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  const [payload] = mockPostPayloads.mock.calls[0][0];
  expect(payload.tags).toBe('');
  expect(JSON.parse(payload.content)).toMatchObject({ tags: '', note: '' });
});

test('keeps input on a business error returned with HTTP success and allows renaming before retry', async () => {
  mockPostPayloads.mockResolvedValueOnce({ 'CPU overview': 'builtin payload already exists' });
  const { onClose } = renderModal();
  const user = await selectComponent();
  await user.type(screen.getByRole('combobox', { name: 'Tags' }), 'retry{Enter}');
  await user.clear(screen.getByRole('textbox', { name: 'Note' }));
  await user.type(screen.getByRole('textbox', { name: 'Note' }), 'Keep edits for retry');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('builtin payload already exists')).toBeVisible();
  expect(onClose).not.toHaveBeenCalled();
  expect(message.success).not.toHaveBeenCalled();
  expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(detail.name);
  expect(screen.getByText('retry', { selector: '.ant-select-selection-item-content' })).toBeVisible();
  expect(screen.getByRole('textbox', { name: 'Note' })).toHaveValue('Keep edits for retry');
  await user.clear(screen.getByRole('textbox', { name: 'Name' }));
  await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Another CPU');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  expect(mockPostPayloads).toHaveBeenCalledTimes(2);
  expect(mockPostPayloads.mock.calls[1][0][0].name).toBe('Another CPU');
});

test('keeps input and allows retry after a failed dashboard fetch', async () => {
  mockGetDashboard.mockRejectedValueOnce(new Error('fetch failed'));
  const { onClose } = renderModal();
  const user = await selectComponent();
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Failed to load dashboard')).toBeVisible();
  expect(mockPostPayloads).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
});

test('keeps input and allows retry after a failed save request', async () => {
  mockPostPayloads.mockRejectedValueOnce(new Error('network failed'));
  const { onClose } = renderModal();
  const user = await selectComponent();
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Failed to save. Please try again.')).toBeVisible();
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(detail.name);
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
});

test.each(['{broken', 'null', '[]', '42'])('does not save invalid configuration: %s', async (invalidConfigs) => {
  mockGetDashboard.mockResolvedValueOnce({ ...detail, configs: invalidConfigs });
  const { onClose } = renderModal();
  const user = await selectComponent();
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Failed to parse the dashboard configuration. Cannot save.')).toBeVisible();
  expect(mockPostPayloads).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
});

test.each([{ components: [] }, { components: null }])('disables saving when the components response is empty: $components', async ({ components }) => {
  mockGetComponents.mockResolvedValueOnce(components as Component[]);
  renderModal();
  expect(await screen.findByText('No components available. Create one in the template center first.')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
});

test('disables saving on component fetch failure and reopens with fresh inputs for another dashboard', async () => {
  mockGetComponents.mockRejectedValueOnce(new Error('fetch failed'));
  const view = renderModal();
  expect(await screen.findByText('Failed to load components. Close this dialog and try again.')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  view.unmount();
  renderModal({ id: 43, name: 'Disk overview' });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled());
  expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Disk overview');
  expect(screen.getByRole('combobox', { name: 'Target component' })).toHaveValue('');
  expect(screen.getByRole('textbox', { name: 'Note' })).toHaveValue('');
  expect(screen.queryByText('host', { selector: '.ant-select-selection-item-content' })).not.toBeInTheDocument();
  expect(screen.queryByText('Failed to load components. Close this dialog and try again.')).not.toBeInTheDocument();
});

test('prevents duplicate submissions while the full dashboard is loading', async () => {
  let resolveDetail!: (value: typeof detail) => void;
  mockGetDashboard.mockReturnValueOnce(new Promise((resolve) => (resolveDetail = resolve)));
  const { onClose } = renderModal();
  await selectComponent();
  const saveButton = screen.getByRole('button', { name: 'Save' });
  fireEvent.click(saveButton);
  fireEvent.click(saveButton);
  await waitFor(() => expect(mockGetDashboard).toHaveBeenCalledTimes(1));
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await act(async () => resolveDetail(detail));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  expect(mockPostPayloads).toHaveBeenCalledTimes(1);
});

test('does not start saving if the dialog unmounts before the dashboard fetch completes', async () => {
  let resolveDetail!: (value: typeof detail) => void;
  mockGetDashboard.mockReturnValueOnce(new Promise((resolve) => (resolveDetail = resolve)));
  const { unmount, onClose } = renderModal();
  const user = await selectComponent();
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mockGetDashboard).toHaveBeenCalledTimes(1));
  unmount();
  await act(async () => resolveDetail(detail));
  expect(mockPostPayloads).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
});

test('restores the first collection binding and saves only that binding when legacy tags contain multiple templates', async () => {
  const encodedName = encodeURIComponent('华为 CE 设备');
  const { onClose } = renderModal({ ...detail, tags: `host __collect__:${encodedName} __collect__:ArubaOS-AC __collect__:${encodedName}` });
  const user = userEvent.setup();
  const binding = await screen.findByRole('combobox', { name: 'Bind collect template' });
  expect(screen.getByRole('combobox', { name: 'Target component' }).closest('.ant-select')).toHaveTextContent('SNMP');
  const tags = screen.getByRole('combobox', { name: 'Tags' });
  expect(binding.compareDocumentPosition(tags) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(collectTemplateSelect()).toHaveTextContent('华为 CE 设备');
  expect(collectTemplateSelect()).not.toHaveTextContent('ArubaOS-AC');
  expect(screen.getByText('host', { selector: '.ant-select-selection-item-content' })).toBeVisible();
  expect(screen.queryByText('__collect__:ArubaOS-AC', { selector: '.ant-select-selection-item-content' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  const [payload] = mockPostPayloads.mock.calls[0][0];
  expect(payload.component_id).toBe(snmpComponent.id);
  expect(payload.tags).toBe(`host __collect__:${encodedName}`);
  expect(JSON.parse(payload.content).tags).toBe(payload.tags);
});

test('selects a lowercase SNMP component after the component list loads without overriding a later manual choice', async () => {
  let resolveComponents!: (value: Component[]) => void;
  mockGetComponents.mockReturnValueOnce(new Promise((resolve) => (resolveComponents = resolve)));
  renderModal({ ...detail, tags: 'host __collect__:ArubaOS-AC' });
  expect(screen.getByRole('combobox', { name: 'Target component' })).toBeDisabled();
  await act(async () => resolveComponents([component, { ...snmpComponent, ident: 'snmp' }]));
  await screen.findByRole('combobox', { name: 'Bind collect template' });
  expect(screen.getByRole('combobox', { name: 'Target component' }).closest('.ant-select')).toHaveTextContent('snmp');
  const user = await selectComponent('Linux');
  await user.type(screen.getByRole('combobox', { name: 'Tags' }), 'production{Enter}');
  expect(screen.getByRole('combobox', { name: 'Target component' }).closest('.ant-select')).toHaveTextContent('Linux');
  expect(screen.queryByRole('combobox', { name: 'Bind collect template' })).not.toBeInTheDocument();
});

test('leaves the target unselected when collection tags exist but the component list has no SNMP component', async () => {
  mockGetComponents.mockResolvedValueOnce([component]);
  renderModal({ ...detail, tags: 'host __collect__:ArubaOS-AC' });
  await waitFor(() => expect(screen.getByRole('combobox', { name: 'Target component' })).toBeEnabled());
  expect(screen.getByRole('combobox', { name: 'Target component' })).toHaveValue('');
  expect(screen.queryByRole('combobox', { name: 'Bind collect template' })).not.toBeInTheDocument();
  expect(screen.getByText('__collect__:ArubaOS-AC', { selector: '.ant-select-selection-item-content' })).toBeVisible();
  expect(mockRequest).not.toHaveBeenCalled();
});

test('searches collect templates by model and replaces the previous binding when selecting another template', async () => {
  const deviceType = 'Network switch with a full device type description';
  const brand = 'Huawei enterprise networking hardware manufacturer';
  mockRequest.mockResolvedValueOnce({ dat: [collectTemplates[0], { ...collectTemplates[1], device_type: deviceType, brand }] });
  const { onClose } = renderModal({ ...detail, tags: 'host __collect__:ArubaOS-AC' });
  const user = await selectComponent('SNMP');
  await waitFor(() => expect(mockRequest).toHaveBeenCalledWith('/api/n9e-plus/collect-tpls', { method: RequestMethod.Get }));
  const binding = screen.getByRole('combobox', { name: 'Bind collect template' });
  await user.click(binding);
  await user.type(binding, 'S5735', { skipClick: true });
  await waitFor(() => expect(screen.getByText('华为 CE 设备', { selector: '.ant-select-item-option-content span' })).toBeVisible());
  expect(screen.getByText(`Device type: ${deviceType}`)).toBeVisible();
  expect(screen.getByText(`Brand: ${brand}`)).toBeVisible();
  expect(screen.getByText('Model: S5735, CE6865')).toBeVisible();
  expect(screen.queryByText('ArubaOS-AC', { selector: '.ant-select-item-option-content span' })).not.toBeInTheDocument();
  await user.click(screen.getByText('华为 CE 设备', { selector: '.ant-select-item-option-content span' }));
  expect(collectTemplateSelect()).toHaveTextContent('华为 CE 设备');
  expect(collectTemplateSelect()).not.toHaveTextContent('ArubaOS-AC');
  await user.type(screen.getByRole('combobox', { name: 'Tags' }), 'production{Enter}');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  const [payload] = mockPostPayloads.mock.calls[0][0];
  expect(payload.tags).toBe(`host production __collect__:${encodeURIComponent('华为 CE 设备')}`);
  expect(JSON.parse(payload.content)).toMatchObject({ tags: payload.tags, configs });
});

test('clearing SNMP bindings removes reserved tags while preserving ordinary tags', async () => {
  const { onClose } = renderModal({ ...detail, tags: 'host __collect__:ArubaOS-AC' });
  const user = await selectComponent('SNMP');
  const bindingSelect = screen.getByRole('combobox', { name: 'Bind collect template' }).closest('.ant-select') as HTMLElement;
  await user.click(within(bindingSelect).getByLabelText('close-circle'));
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  expect(mockPostPayloads.mock.calls[0][0][0].tags).toBe('host');
  expect(JSON.parse(mockPostPayloads.mock.calls[0][0][0].content).tags).toBe('host');
});

test('switching between SNMP and other components preserves template bindings and ordinary tags', async () => {
  renderModal({ ...detail, tags: 'host __collect__:ArubaOS-AC' });
  await selectComponent('SNMP');
  expect(collectTemplateSelect()).toHaveTextContent('ArubaOS-AC');
  await selectComponent('Linux');
  expect(screen.queryByRole('combobox', { name: 'Bind collect template' })).not.toBeInTheDocument();
  expect(screen.getByText('__collect__:ArubaOS-AC', { selector: '.ant-select-selection-item-content' })).toBeVisible();
  await selectComponent('SNMP');
  expect(collectTemplateSelect()).toHaveTextContent('ArubaOS-AC');
  expect(screen.getByText('host', { selector: '.ant-select-selection-item-content' })).toBeVisible();
  expect(screen.queryByText('__collect__:ArubaOS-AC', { selector: '.ant-select-selection-item-content' })).not.toBeInTheDocument();
});

test('keeps existing bindings without requesting the catalog when the user cannot view collect templates', async () => {
  mockIsAuthorized.mockReturnValue(false);
  const { onClose } = renderModal({ ...detail, tags: 'host __collect__:ArubaOS-AC' });
  const user = await selectComponent('SNMP');
  expect(screen.getByRole('combobox', { name: 'Bind collect template' })).toBeDisabled();
  expect(mockRequest).not.toHaveBeenCalled();
  expect(collectTemplateSelect()).toHaveTextContent('ArubaOS-AC');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  expect(mockPostPayloads.mock.calls[0][0][0].tags).toBe('host __collect__:ArubaOS-AC');
});

test('retains missing legacy template names across a catalog load failure and retry', async () => {
  mockRequest.mockRejectedValueOnce(new Error('catalog failed'));
  const { onClose } = renderModal({ ...detail, tags: 'host __collect__:Legacy%20Template' });
  const user = await selectComponent('SNMP');
  expect(await screen.findByText('Failed to load collect templates')).toBeVisible();
  expect(collectTemplateSelect()).toHaveTextContent('Legacy Template');
  await user.click(screen.getByRole('button', { name: 'Retry' }));
  await waitFor(() => expect(screen.queryByText('Failed to load collect templates')).not.toBeInTheDocument());
  expect(collectTemplateSelect()).toHaveTextContent('Legacy Template');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  expect(mockPostPayloads.mock.calls[0][0][0].tags).toBe('host __collect__:Legacy%20Template');
});

test('a delayed collect template response does not restore a binding the user cleared', async () => {
  let resolveTemplates!: (value: { dat: typeof collectTemplates }) => void;
  mockRequest.mockReturnValueOnce(new Promise((resolve) => (resolveTemplates = resolve)));
  const { onClose } = renderModal({ ...detail, tags: 'host __collect__:ArubaOS-AC' });
  const user = await selectComponent('SNMP');
  const bindingSelect = screen.getByRole('combobox', { name: 'Bind collect template' }).closest('.ant-select') as HTMLElement;
  await user.click(within(bindingSelect).getByLabelText('close-circle'));
  await act(async () => resolveTemplates({ dat: collectTemplates }));
  expect(collectTemplateSelect()).not.toHaveTextContent('ArubaOS-AC');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  expect(mockPostPayloads.mock.calls[0][0][0].tags).toBe('host');
});
