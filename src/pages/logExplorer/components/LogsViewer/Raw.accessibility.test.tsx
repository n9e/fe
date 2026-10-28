/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Raw from './Raw';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/utils/constant', () => ({ DatasourceCateEnum: { doris: 'doris' } }));
jest.mock('react-virtuoso', () => ({ Virtuoso: ({ itemContent }: any) => <div>{itemContent(0)}</div> }));
jest.mock('./index', () => ({ LogsViewerStateContext: require('react').createContext({}) }));
jest.mock('./components/LogViewer', () => () => <span>details content</span>);
jest.mock('./components/LogFieldValue', () => () => null);
jest.mock(
  '@/components/NavigableDrawer',
  () =>
    ({ visible, onClose, children }: any) =>
      visible ? (
        <div role='dialog'>
          <button onClick={onClose}>close drawer</button>
          {children}
        </div>
      ) : null,
);

it('opens raw row details from keyboard focus using Enter and Space', async () => {
  const user = userEvent.setup();
  render(
    <Raw data={[{ id: 'one', message: 'log' }]} id_key='id' raw_key='message' options={{ lines: 'false', time: 'false' }} onReverseChange={jest.fn()} filterFields={() => []} />,
  );
  const button = screen.getByRole('button', { name: 'log_viewer_drawer_trigger_tip' });
  await user.tab();
  expect(button).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('dialog')).toHaveTextContent('details content');
  await user.click(screen.getByRole('button', { name: 'close drawer' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await user.tab();
  expect(button).toHaveFocus();
  await user.keyboard(' ');
  expect(screen.getByRole('dialog')).toHaveTextContent('details content');
});
