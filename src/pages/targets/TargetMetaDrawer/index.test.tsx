/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TargetMetaDrawer from './index';
import { getTargetInformationByIdent } from '../services';

jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({ darkMode: false }) }));
jest.mock('@/utils', () => ({ copyToClipBoard: jest.fn() }));
jest.mock('../services', () => ({ getTargetInformationByIdent: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

test('renders network metadata and copies the complete interface value without closing the drawer', async () => {
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  (getTargetInformationByIdent as jest.Mock).mockResolvedValue({ network: { interfaces: [{ name: 'eth0', address: '10.98.1.106' }] } });
  const onDrawerOpenChange = jest.fn();
  render(<TargetMetaDrawer drawerOnly drawerOpen ident='host-with-network' onDrawerOpenChange={onDrawerOpenChange} />);
  fireEvent.click(await screen.findByText('meta_expand'));
  fireEvent.click(screen.getByRole('button', { name: 'copy: 10.98.1.106' }));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith('10.98.1.106'));
  expect(screen.getByText('eth0')).toBeVisible();
  expect(onDrawerOpenChange).not.toHaveBeenCalled();
});
