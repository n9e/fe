/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import List from './index';
import { getBusiGroupsAlertRules } from '@/services/warning';

jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({ businessGroup: {} }) }));
jest.mock('@/services/warning', () => ({ getBusiGroupsAlertRules: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('react-router-dom', () => ({ useHistory: () => ({ push: jest.fn() }) }));
jest.mock('@/components/EmptyGuide', () => () => null);
jest.mock('@/pages/datasource/components/GuideLandingBanner', () => () => null);
jest.mock('./MoreOperations', () => () => null);
jest.mock('./Import', () => () => null);
jest.mock(
  './ListNG',
  () => (props: { data: { id: number; disabled: number }[]; loading: boolean; setRefreshFlag: (flag: string) => void; onStatusChange: (ids: number[], disabled: 0 | 1) => void }) =>
    (
      <>
        <button onClick={() => props.setRefreshFlag(String(Math.random()))}>Refresh</button>
        <button onClick={() => props.onStatusChange([1], 1)}>Confirm disable</button>
        <output>{JSON.stringify(props.data)}</output>
        <span>{props.loading ? 'Loading' : 'Ready'}</span>
      </>
    ),
);

const getRules = jest.mocked(getBusiGroupsAlertRules);
const enabled = { id: 1, disabled: 0 } as const;

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

it('keeps a confirmed status when a refresh started earlier finishes later', async () => {
  getRules.mockResolvedValueOnce({ dat: [enabled] });
  render(<List gids='1' />);
  await screen.findByText('Ready');
  const request = deferred<{ dat: (typeof enabled)[] }>();
  getRules.mockReturnValueOnce(request.promise);
  fireEvent.click(screen.getByText('Refresh'));
  getRules.mockResolvedValueOnce({ dat: [{ ...enabled, disabled: 1 }] });
  fireEvent.click(screen.getByText('Confirm disable'));
  await act(async () => {
    request.resolve({ dat: [enabled] });
  });
  expect(screen.getByRole('status')).toHaveTextContent('"disabled":1');
  expect(screen.getByText('Ready')).toBeInTheDocument();
});

it('does not restore the previous group when its response arrives last', async () => {
  const old = deferred<{ dat: { id: number; disabled: number }[] }>();
  getRules.mockReturnValueOnce(old.promise);
  const { rerender } = render(<List gids='1' />);
  getRules.mockResolvedValueOnce({ dat: [{ id: 2, disabled: 0 }] });
  rerender(<List gids='2' />);
  await screen.findByText('Ready');
  await act(async () => {
    old.resolve({ dat: [enabled] });
  });
  expect(screen.getByRole('status')).toHaveTextContent('"id":2');
  expect(screen.getByRole('status')).not.toHaveTextContent('"id":1');
});

it('does not reload a settled list after an ordinary status update', async () => {
  getRules.mockResolvedValueOnce({ dat: [enabled] });
  render(<List gids='1' />);
  await screen.findByText('Ready');
  fireEvent.click(screen.getByText('Confirm disable'));
  expect(screen.getByRole('status')).toHaveTextContent('"disabled":1');
  expect(getRules).toHaveBeenCalledTimes(1);
});

it('restarts a pending group query after a status update without restoring the old group', async () => {
  getRules.mockResolvedValueOnce({ dat: [enabled] });
  const { rerender } = render(<List gids='1' />);
  await screen.findByText('Ready');
  const old = deferred<{ dat: { id: number; disabled: number }[] }>();
  getRules.mockReturnValueOnce(old.promise);
  rerender(<List gids='2' />);
  getRules.mockResolvedValueOnce({ dat: [{ id: 2, disabled: 0 }] });
  fireEvent.click(screen.getByText('Confirm disable'));
  await screen.findByText('Ready');
  await act(async () => {
    old.resolve({ dat: [enabled] });
  });
  expect(getRules).toHaveBeenLastCalledWith('2');
  expect(screen.getByRole('status')).toHaveTextContent('"id":2');
});
