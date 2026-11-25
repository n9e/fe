/** @jest-environment jsdom */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';

import { getEdgeQueryStatus, getServerClusters } from '../../services';
import Cluster from './Cluster';
import EdgeQuerySwitch from './EdgeQuerySwitch';

jest.mock('@/App', () => ({
  CommonStateContext: require('react').createContext({ isPlus: true }),
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
  statusMock.mockReset();
  clustersMock.mockReset();
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
  render(<TestForm initialUseEdge onFinish={onFinish} onFinishFailed={onFinishFailed} />);

  await screen.findByText('form.edge_query_unavailable_tip');
  const save = screen.getByRole('button', { name: 'Save' });
  await user.click(save);
  await waitFor(() => expect(onFinishFailed).toHaveBeenCalledTimes(1));
  expect(onFinish).not.toHaveBeenCalled();

  const toggle = screen.getByRole('switch');
  expect(toggle).toBeEnabled();
  await user.click(toggle);
  await user.click(save);
  await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
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
