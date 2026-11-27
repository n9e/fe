/** @jest-environment jsdom */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';

import { getEdgeQueryStatus, getServerClusters } from '../../services';
import Cluster from './Cluster';
import EdgeQuerySwitch, { EdgeClusterStatusBadge } from './EdgeQuerySwitch';

let mockIsPro = true;

jest.mock('@/utils/constant', () => ({
  get IS_PRO() {
    return mockIsPro;
  },
}));
jest.mock('../../services', () => ({ getEdgeQueryStatus: jest.fn(), getServerClusters: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const statusMock = jest.mocked(getEdgeQueryStatus);
const clustersMock = jest.mocked(getServerClusters);

function TestForm({
  initialUseEdge = false,
  showCluster = false,
  onFinish,
  onFinishFailed,
}: {
  initialUseEdge?: boolean;
  showCluster?: boolean;
  onFinish?: () => void;
  onFinishFailed?: () => void;
}) {
  const [form] = Form.useForm();
  const useEdge = Form.useWatch(['settings', 'use_edge'], form) === true;

  return (
    <Form form={form} initialValues={{ settings: { use_edge: initialUseEdge } }} onFinish={onFinish} onFinishFailed={onFinishFailed}>
      <EdgeQuerySwitch form={form} />
      {showCluster && <Cluster form={form} requireValidCluster={useEdge} />}
      <button type='submit'>Save</button>
    </Form>
  );
}

beforeEach(() => {
  mockIsPro = true;
  statusMock.mockReset();
  clustersMock.mockReset();
});

it('hides Edge controls and skips status requests outside PRO', () => {
  mockIsPro = false;
  render(
    <>
      <TestForm />
      <EdgeClusterStatusBadge clusterName='edge' />
    </>,
  );

  expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  expect(statusMock).not.toHaveBeenCalled();
});

it('blocks enabling Edge query until the center confirms support', async () => {
  statusMock.mockRejectedValueOnce(new Error('network failure')).mockResolvedValueOnce({ featureEnabled: true, clusters: {} });
  const user = userEvent.setup();
  render(<TestForm />);

  const toggle = screen.getByRole('switch');
  expect(toggle).toBeDisabled();
  await user.click(await screen.findByRole('button', { name: 'form.edge_query_retry' }));
  await waitFor(() => expect(toggle).toBeEnabled());
});

it('blocks enabling Edge query when the center disables it', async () => {
  statusMock.mockResolvedValue({ featureEnabled: false, clusters: {} });
  render(<TestForm />);

  await screen.findByText('form.edge_status_disabled');
  expect(screen.getByRole('switch')).toBeDisabled();
});

it('allows an existing Edge setting to be turned off when capability verification fails', async () => {
  statusMock.mockRejectedValue(new Error('network failure'));
  const user = userEvent.setup();
  const onFinish = jest.fn();
  const onFinishFailed = jest.fn();
  const { container } = render(<TestForm initialUseEdge onFinish={onFinish} onFinishFailed={onFinishFailed} />);

  await screen.findByText('form.edge_query_unavailable_tip');
  const save = screen.getByRole('button', { name: 'Save' });
  await user.click(save);
  await waitFor(() => expect(onFinishFailed).toHaveBeenCalledTimes(1));
  expect(onFinish).not.toHaveBeenCalled();
  await waitFor(() => expect(container.querySelector('.ant-form-item-has-error')).toBeInTheDocument());
  expect(container.querySelector('.ant-form-item-explain-error')).toHaveTextContent('form.edge_query_unavailable_tip');
  expect(screen.getAllByText('form.edge_query_unavailable_tip')).toHaveLength(1);

  const toggle = screen.getByRole('switch');
  expect(toggle).toBeEnabled();
  await user.click(toggle);
  await waitFor(() => expect(container.querySelector('.ant-form-item-has-error')).not.toBeInTheDocument());
  expect(screen.getAllByText('form.edge_query_unavailable_tip')).toHaveLength(1);
  await user.click(save);
  await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
});

it('shows an error without duplicating warning text when center disables Edge query for an enabled datasource', async () => {
  statusMock.mockResolvedValue({ featureEnabled: false, clusters: {} });
  const user = userEvent.setup();
  const onFinish = jest.fn();
  const onFinishFailed = jest.fn();
  const { container } = render(<TestForm initialUseEdge onFinish={onFinish} onFinishFailed={onFinishFailed} />);

  await screen.findByText('form.edge_status_disabled');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(onFinishFailed).toHaveBeenCalledTimes(1));
  expect(onFinish).not.toHaveBeenCalled();
  await waitFor(() => expect(container.querySelector('.ant-form-item-has-error')).toBeInTheDocument());
  expect(container.querySelector('.ant-form-item-explain-error')).toHaveTextContent('form.edge_query_disabled_tip');
  expect(screen.getAllByText('form.edge_query_disabled_tip')).toHaveLength(1);
});

it('shows loading validation error on submit while checking status and clears it once confirmed enabled', async () => {
  let resolveStatus!: (value: { featureEnabled: boolean; clusters: Record<string, never> }) => void;
  statusMock.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveStatus = resolve;
      }),
  );
  const user = userEvent.setup();
  const onFinish = jest.fn();
  const onFinishFailed = jest.fn();
  const { container } = render(<TestForm initialUseEdge onFinish={onFinish} onFinishFailed={onFinishFailed} />);

  const save = screen.getByRole('button', { name: 'Save' });
  await user.click(save);
  await waitFor(() => expect(onFinishFailed).toHaveBeenCalledTimes(1));
  expect(onFinish).not.toHaveBeenCalled();
  await waitFor(() => expect(container.querySelector('.ant-form-item-has-error')).toBeInTheDocument());
  expect(container.querySelector('.ant-form-item-explain-error')).toHaveTextContent('form.edge_query_loading_tip');

  resolveStatus({ featureEnabled: true, clusters: {} });
  await waitFor(() => expect(container.querySelector('.ant-form-item-has-error')).not.toBeInTheDocument());
  await user.click(save);
  await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
});

it('updates loading validation error to disabled message when center turns out to be disabled', async () => {
  let resolveStatus!: (value: { featureEnabled: boolean; clusters: Record<string, never> }) => void;
  statusMock.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveStatus = resolve;
      }),
  );
  const user = userEvent.setup();
  const onFinish = jest.fn();
  const onFinishFailed = jest.fn();
  const { container } = render(<TestForm initialUseEdge onFinish={onFinish} onFinishFailed={onFinishFailed} />);

  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(container.querySelector('.ant-form-item-explain-error')).toHaveTextContent('form.edge_query_loading_tip'));

  resolveStatus({ featureEnabled: false, clusters: {} });
  await waitFor(() => expect(container.querySelector('.ant-form-item-explain-error')).toHaveTextContent('form.edge_query_disabled_tip'));
  expect(screen.getAllByText('form.edge_query_disabled_tip')).toHaveLength(1);
});

it.each([false, true])('keeps the default cluster on entering Edge mode only if explicitly selected (%s)', async (explicitSelection) => {
  statusMock.mockResolvedValue({ featureEnabled: true, clusters: {} });
  clustersMock.mockResolvedValue(['default', 'edge']);
  const user = userEvent.setup();
  render(<TestForm showCluster />);

  const selectedCluster = { selector: '.ant-select-selection-item' };
  await screen.findByText('default', selectedCluster);
  const toggle = screen.getByRole('switch');
  await waitFor(() => expect(toggle).toBeEnabled());
  if (explicitSelection) {
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('default', { selector: '.ant-select-item-option-content' }));
  }

  await user.click(toggle);
  if (explicitSelection) {
    expect(screen.getByText('default', selectedCluster)).toBeInTheDocument();
  } else {
    expect(screen.queryByText('default', selectedCluster)).not.toBeInTheDocument();
    expect(await screen.findByText('form.edge_cluster_required')).toBeInTheDocument();
  }

  await user.click(toggle);
  expect(screen.getByText('default', selectedCluster)).toBeInTheDocument();
});
