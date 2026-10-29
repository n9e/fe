/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import LogOrderContext from './index';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('../../constants', () => ({ NAME_SPACE: 'log_explorer' }));

const log = { __log_stream_id__: 's1', __log_seq__: '100', timestamp: 1793164672156, message: '> Could not find gaussdbjdbc' };
const page = {
  logs: [
    { __index_number__: -1, __log_stream_id__: 's1', __log_seq__: '50', timestamp: 1793164672156, message: '  > Could not resolve all files' },
    { __index_number__: 0, ...log, message: '     Searched in the following locations:' },
  ],
  back_cursor: { seq: '50', time: '1793164672156', index: -1 },
  forward_cursor: { seq: '100', time: '1793164672156', index: 0 },
  has_back: false,
  has_forward: false,
};

it('raw layout drops the time and field name and keeps leading spaces', async () => {
  render(<LogOrderContext log={log} timeField='timestamp' fetchPage={() => Promise.resolve(page as any)} />);
  fireEvent.click(screen.getByRole('button', { name: 'log_order_context.title' }));
  const row = () => document.querySelector('tr[data-row-key="0"] td:last-child > div') as HTMLElement;
  await waitFor(() => expect(row()).not.toBeNull());
  expect(row().textContent).toBe('[1793164672156]message:      Searched in the following locations:');

  fireEvent.click(screen.getByRole('switch'));
  expect(row().textContent).toBe('     Searched in the following locations:');
  expect(row().className).toContain('font-mono');
});
