/** @jest-environment jsdom */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { CommonStateContext } from '@/App';
import ColorPicker from './index';

jest.mock('react-color', () => ({
  SketchPicker: ({ color, onChange }: { color: string; onChange: (value: { rgb: { r: number; g: number; b: number; a: number } }) => void }) => {
    const React = require('react');
    return React.createElement(
      'button',
      {
        type: 'button',
        'data-testid': 'sketch-picker',
        'data-color': color,
        onClick: () => onChange({ rgb: { r: 12, g: 34, b: 56, a: 0.5 } }),
      },
      'SketchPicker',
    );
  },
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        'colorPicker.colors': 'Colors',
        'colorPicker.custom': 'Custom',
        'colorPicker.transparent': 'Transparent',
        'colorPicker.text_color': 'Text color',
        'colorPicker.red': 'Red',
        'colorPicker.orange': 'Orange',
        'colorPicker.yellow': 'Yellow',
        'colorPicker.green': 'Green',
        'colorPicker.blue': 'Blue',
        'colorPicker.purple': 'Purple',
      }[key] || key),
  }),
}));
jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({ darkMode: false }) }));
jest.mock('@/utils/constant', () => ({ PRIMARY_COLOR: '#6c53b1' }));

describe('dashboard ColorPicker built-in colors', () => {
  it('opens the Custom tab for an existing color value', () => {
    const onChange = jest.fn();
    render(<ColorPicker builtin value='#ff0000' onChange={onChange} />);

    fireEvent.click(screen.getByTestId('color-picker-trigger'));

    expect(screen.getByRole('tab', { name: 'Custom' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('sketch-picker')).toHaveAttribute('data-color', '#ff0000');

    fireEvent.click(screen.getByTestId('sketch-picker'));

    expect(onChange).toHaveBeenCalledWith('rgba(12, 34, 56, 0.5)');
  });

  it('keeps the legacy custom picker behavior when builtin mode is disabled', () => {
    const onChange = jest.fn();
    render(<ColorPicker value='#123456' onChange={onChange} />);

    fireEvent.click(screen.getByTestId('color-picker-trigger'));

    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.getByTestId('sketch-picker')).toHaveAttribute('data-color', '#123456');
    fireEvent.click(screen.getByTestId('sketch-picker'));

    expect(onChange).toHaveBeenCalledWith('rgba(12, 34, 56, 0.5)');
  });

  it('opens the Colors tab for a token and reports the selected token', () => {
    const onChange = jest.fn();
    render(<ColorPicker builtin value='red-9' onChange={onChange} />);

    fireEvent.click(screen.getByTestId('color-picker-trigger'));

    expect(screen.getByRole('tab', { name: 'Colors' })).toHaveAttribute('aria-selected', 'true');
    const selectedColorButton = screen.getByRole('button', { name: 'Red 9' });
    const selectedCircle = selectedColorButton.querySelector('span');
    const unselectedCircle = screen.getByRole('button', { name: 'Red 11' }).querySelector('span');

    expect(selectedColorButton).toHaveClass('cursor-pointer');
    expect(unselectedCircle).toHaveClass('hover:scale-110');
    expect(selectedCircle).toHaveClass('hover:scale-105');
    expect(selectedCircle).toHaveStyle({ width: '32px', height: '32px', position: 'relative' });
    expect(selectedCircle?.querySelector('span')).toHaveStyle({ inset: '2px', border: '2px solid #000' });

    fireEvent.click(screen.getByRole('button', { name: 'Red 11' }));

    expect(onChange).toHaveBeenCalledWith('red-11');
  });

  it('switches from built-in colors to the custom picker and keeps emitting rgba values', () => {
    const onChange = jest.fn();
    render(<ColorPicker builtin value='blue-9' onChange={onChange} />);

    fireEvent.click(screen.getByTestId('color-picker-trigger'));
    fireEvent.click(screen.getByRole('tab', { name: 'Custom' }));

    const sketchPicker = screen.getByTestId('sketch-picker');
    expect(sketchPicker.getAttribute('data-color')).not.toBe('blue-9');
    fireEvent.click(sketchPicker);

    expect(onChange).toHaveBeenCalledWith('rgba(12, 34, 56, 0.5)');
  });

  it('uses a white selection ring for the text token in light mode', () => {
    render(<ColorPicker builtin value='text' />);

    fireEvent.click(screen.getByTestId('color-picker-trigger'));

    const selectedCircle = screen.getByRole('button', { name: 'Text color' }).querySelector('span');
    expect(selectedCircle?.querySelector('span')).toHaveStyle({ border: '2px solid #fff' });
  });

  it('uses a black selection ring for the text token in dark mode', () => {
    render(
      <CommonStateContext.Provider value={{ darkMode: true } as React.ContextType<typeof CommonStateContext>}>
        <ColorPicker builtin value='text' />
      </CommonStateContext.Provider>,
    );

    fireEvent.click(screen.getByTestId('color-picker-trigger'));

    const selectedCircle = screen.getByRole('button', { name: 'Text color' }).querySelector('span');
    expect(selectedCircle?.querySelector('span')).toHaveStyle({ border: '2px solid #000' });
  });
});
