/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import request from '@/utils/request';
import { buildSql } from '../services';
import BuilderModal from './BuilderModal';

jest.mock('@/utils/request', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/utils/constant', () => ({ SIZE: 8, DatasourceCateEnum: { doris: 'doris' } }));
jest.mock('react-i18next', () => {
  const i18n = require('i18next').createInstance();
  i18n.init({ lng: 'en_US', initImmediate: false, resources: { en_US: { translation: require('../locale/en_US').default } } });
  return { useTranslation: () => ({ t: i18n.t.bind(i18n), i18n }) };
});
jest.mock('../services', () => ({
  buildSql: jest.fn(),
  getDorisIndex: () => Promise.resolve([{ field: 'ts', type: 'datetime', indexable: true }]),
  getDorisDatabases: () => Promise.resolve(['db']),
  getDorisTables: () => Promise.resolve(['logs']),
}));
jest.mock('../ExplorerNG/components/QueryBuilder/utils/getMaxLabelWidth', () => ({ __esModule: true, default: () => 100 }));
jest.mock('../ExplorerNG/components/QueryBuilder/Filters', () => ({ __esModule: true, default: () => null }));
jest.mock('../ExplorerNG/components/QueryBuilder/Aggregates', () => ({ __esModule: true, default: () => null }));
jest.mock('../ExplorerNG/components/QueryBuilder/OrderBy', () => ({ __esModule: true, default: () => null }));

const builderConfig = { database: 'db', table: 'logs', time_field: 'ts', limit: 31 };

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(request).mockImplementation((_, options) => Promise.resolve({ data: { settings: { 'doris.max_query_rows': options?.data?.id === 7 ? 30 : 10 } } }));
  (buildSql as jest.Mock).mockResolvedValue({ sql: 'SELECT * FROM logs LIMIT 30', mode: 'table', value_key: [], label_key: [] });
});

it('validates the shared dashboard, alert and recording-rule modal before building SQL', async () => {
  const onConfirm = jest.fn();
  render(<BuilderModal visible datasourceId={7} builderConfig={builderConfig} onCancel={() => {}} onConfirm={onConfirm} />);
  await waitFor(() => expect(screen.getByRole('spinbutton')).toHaveValue('31'));
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '32' } });
  await waitFor(() => expect(screen.getByText('Limit must be maximum 30')).toBeVisible());
  expect(buildSql).not.toHaveBeenCalled();
  expect(onConfirm).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '30' } });
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  await waitFor(() => expect(onConfirm).toHaveBeenCalled());
  expect(buildSql).toHaveBeenCalledWith(expect.objectContaining({ datasource_id: 7, query: [expect.objectContaining({ limit: 30 })] }));
  expect(request).toHaveBeenCalledTimes(1);
});

it('clears old validation and loads the new datasource limit when the modal reopens', async () => {
  const props = { datasourceId: 7, builderConfig, onCancel: () => {}, onConfirm: () => {} };
  const view = render(<BuilderModal {...props} visible />);
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '32' } });
  await waitFor(() => expect(screen.getByText('Limit must be maximum 30')).toBeVisible());
  view.rerender(<BuilderModal {...props} visible={false} />);
  view.rerender(<BuilderModal {...props} visible datasourceId={8} builderConfig={{ ...builderConfig, limit: 11 }} />);
  await waitFor(() => expect(screen.getByRole('spinbutton')).toHaveValue('11'));
  expect(screen.queryByText('Limit must be maximum 30')).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '12' } });
  await waitFor(() => expect(screen.getByText('Limit must be maximum 10')).toBeVisible());
  expect(buildSql).not.toHaveBeenCalled();
  expect(request).toHaveBeenCalledWith('/api/v1/datasource/desc', { method: 'POST', data: { id: 8 }, silence: true });
});
