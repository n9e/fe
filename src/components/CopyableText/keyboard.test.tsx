/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Drawer } from 'antd';
import CopyableText from './index';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

test('lets the real Drawer handle Escape while the copy button has focus', () => {
  const onClose = jest.fn();
  render(
    <Drawer visible onClose={onClose}>
      <CopyableText value='drawer-keyboard' />
    </Drawer>,
  );
  const button = screen.getByRole('button', { name: 'copy: drawer-keyboard' });
  button.focus();
  fireEvent.keyDown(button, { key: 'Escape', code: 'Escape', keyCode: 27, which: 27 });
  expect(onClose).toHaveBeenCalledTimes(1);
});
