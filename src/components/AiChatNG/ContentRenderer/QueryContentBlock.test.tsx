/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { copy2ClipBoard } from '@/utils';
import QueryContentBlock from './QueryContentBlock';

jest.mock('@/components/PromQLInput', () => ({ __esModule: true, default: ({ value }: { value: string }) => <pre>{value}</pre> }));
jest.mock('@/utils', () => ({ copy2ClipBoard: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

it('shows a query for copying without an Execute button', () => {
  render(<QueryContentBlock query='up' />);

  expect(screen.getByText('up')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'query.execute' })).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: /query\.copy/ }));
  expect(copy2ClipBoard).toHaveBeenCalledWith('up');
});
