/** @jest-environment jsdom */
import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import CustomUnitPicker from './CustomUnitPicker';

jest.mock('antd', () => ({
  AutoComplete: ({ value, placeholder, filterOption, onBlur, onChange, onClear, onDropdownVisibleChange, onFocus, onSelect, options }: any) => {
    const selectableOptions = options?.flatMap((group: any) => group.options ?? [group]) ?? [];
    return (
      <>
        <input data-testid='unit-input' placeholder={placeholder} value={value ?? ''} onBlur={onBlur} onChange={(event) => onChange?.(event.target.value, {})} onFocus={onFocus} />
        <button data-testid='open-options' onClick={() => onDropdownVisibleChange?.(true)}>
          open
        </button>
        <button data-testid='close-options' onClick={() => onDropdownVisibleChange?.(false)}>
          close
        </button>
        {selectableOptions.map((option: any) => (
          <button key={option.value} data-testid={`option-${option.value}`} onClick={() => onSelect?.(option.value, option)}>
            {option.label}
          </button>
        ))}
        <span data-testid='description-filter-result'>{String(filterOption?.('IEC standard', { cleanLabel: 'bytes(IEC)', searchText: 'bytes(IEC) using the IEC standard' }))}</span>
        <span data-testid='label-filter-result'>{String(filterOption?.('IEC standard', { cleanLabel: 'bytes(IEC)' }))}</span>
        <button data-testid='clear' onClick={() => onClear?.()}>
          clear
        </button>
      </>
    );
  },
}));

function ControlledUnitPicker() {
  const [value, setValue] = useState('sishort');
  return (
    <>
      <CustomUnitPicker placeholder='SI short' value={value} onChange={(nextValue) => setValue(String(nextValue))} />
      <span data-testid='selected-unit'>{value}</span>
    </>
  );
}

describe('CustomUnitPicker', () => {
  it('内置单位展示可读名称，打开下拉时清空搜索词并保留自定义输入能力', () => {
    render(<ControlledUnitPicker />);

    const input = screen.getByTestId('unit-input');
    expect(input).toHaveValue('SI short');
    expect(screen.getByTestId('description-filter-result')).toHaveTextContent('true');
    expect(screen.getByTestId('label-filter-result')).toHaveTextContent('false');

    fireEvent.focus(input);
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('placeholder', 'SI short');

    fireEvent.change(input, { target: { value: 'x' } });
    fireEvent.click(screen.getByTestId('close-options'));
    fireEvent.click(screen.getByTestId('open-options'));
    expect(input).toHaveValue('x');
    fireEvent.change(input, { target: { value: 'xx' } });
    fireEvent.change(input, { target: { value: 'xxx' } });
    expect(input).toHaveValue('xxx');

    fireEvent.blur(input);
    expect(input).toHaveValue('SI short');
    expect(screen.getByTestId('selected-unit')).toHaveTextContent('sishort');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'xxx' } });
    fireEvent.click(screen.getByTestId('option-xxx'));
    expect(input).toHaveValue('xxx');
    expect(screen.getByTestId('selected-unit')).toHaveTextContent('xxx');

    fireEvent.click(screen.getByTestId('open-options'));
    expect(input).toHaveValue('');
  });

  it('显式清除时按 Ant Design 语义提交 undefined', () => {
    const onChange = jest.fn();
    render(<CustomUnitPicker value='sishort' onChange={onChange} />);

    fireEvent.click(screen.getByTestId('clear'));

    expect(onChange).toHaveBeenCalledWith(undefined, undefined);
  });

  it('重复选择当前单位时不触发值变更，但仍转发 onSelect', () => {
    const onChange = jest.fn();
    const onSelect = jest.fn();
    render(<CustomUnitPicker value='sishort' onChange={onChange} onSelect={onSelect} />);

    fireEvent.click(screen.getByTestId('option-sishort'));

    expect(onChange).not.toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith('sishort', expect.objectContaining({ value: 'sishort' }));
  });
});
