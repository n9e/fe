/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import PromptEditor from './index';

test('Nightingale AI prompt editor treats @ and / as ordinary text', () => {
  const onChange = jest.fn();
  render(<PromptEditor value='' onChange={onChange} variableNames={['host']} />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: '@skill /resource' } });
  expect(onChange).toHaveBeenCalledWith('@skill /resource');
  expect(screen.queryByRole('listbox')).toBeNull();
});
