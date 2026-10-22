/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CellExpanderFormatter from './CellExpanderFormatter';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/utils/constant', () => ({ DatasourceCateEnum: { doris: 'doris' } }));

it('opens details with Enter and Space without invoking grid keyboard navigation', async () => {
  const user = userEvent.setup();
  const onExpand = jest.fn();
  const onGridKeyDown = jest.fn();
  render(
    <div onKeyDown={onGridKeyDown}>
      <CellExpanderFormatter expanded={false} onCellExpand={onExpand} />
    </div>,
  );
  const button = screen.getByRole('button', { name: 'log_viewer_drawer_trigger_tip' });
  await user.tab();
  expect(button).toHaveFocus();
  onGridKeyDown.mockClear();
  await user.keyboard('{Enter}');
  await user.keyboard(' ');
  expect(onExpand).toHaveBeenCalledTimes(2);
  expect(onGridKeyDown).not.toHaveBeenCalled();
});
