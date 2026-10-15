/** @jest-environment jsdom */
import React, { useState } from 'react';
import i18next from 'i18next';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CustomUnitPicker from './CustomUnitPicker';
import { buildUnitOptions } from './utils';
import en_US from './locale/en_US';
import unitPickerLocales from './locale';

function ControlledUnitPicker({ hideSIOption = false, initialValue = 'sishort', virtual }: { hideSIOption?: boolean; initialValue?: string; virtual?: boolean }) {
  const [value, setValue] = useState(initialValue);
  return (
    <>
      <CustomUnitPicker value={value} onChange={(nextValue) => setValue(String(nextValue))} hideSIOption={hideSIOption} virtual={virtual} />
      <span data-testid='selected-unit'>{value}</span>
    </>
  );
}

describe('CustomUnitPicker 与 AutoComplete 集成', () => {
  beforeAll(async () => {
    await i18next.init({
      lng: 'en_US',
      fallbackLng: 'en_US',
      ns: ['unitPicker'],
      defaultNS: 'unitPicker',
      resources: {
        en_US: { unitPicker: en_US },
      },
      interpolation: { escapeValue: false },
    });
  });

  it.each(Object.entries(unitPickerLocales.unitPicker))('%s 提供带单位插值的自定义选项文案', (_locale, translations) => {
    expect(translations.useCustomUnit).toContain('{{unit}}');
  });

  it('输入自定义单位后显示显式选项，只有选择后才提交', async () => {
    const user = userEvent.setup();
    render(<ControlledUnitPicker />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'xxx');

    expect(input).toHaveValue('xxx');
    expect(screen.getByTestId('selected-unit')).toHaveTextContent('sishort');
    expect(screen.getByRole('option', { name: 'Use this custom unit: xxx' })).toBeInTheDocument();

    await user.tab();
    expect(screen.getByTestId('selected-unit')).toHaveTextContent('sishort');
    expect(input).toHaveValue('SI short');

    await user.click(input);
    await user.type(input, 'xxx');

    await user.click(screen.getByText('Use this custom unit: xxx'));

    expect(input).toHaveValue('xxx');
    expect(screen.getByTestId('selected-unit')).toHaveTextContent('xxx');
  });

  it('可以根据内置单位的描述搜索', async () => {
    const user = userEvent.setup();
    render(<ControlledUnitPicker />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'IEC standard');

    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByRole('option', { name: /pebibitsSec/ })).toBeInTheDocument();
    expect(within(listbox).queryByRole('option', { name: /bytesSI/ })).not.toBeInTheDocument();
  });

  it('已选自定义单位重新聚焦时以 placeholder 显示，并恢复内置选项', async () => {
    const user = userEvent.setup();
    render(<ControlledUnitPicker initialValue='custom-unit' virtual={false} />);

    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('custom-unit');
    await user.click(input);

    expect(input).toHaveValue('');
    expect(document.querySelector('.ant-select-selection-placeholder')).toHaveTextContent('custom-unit');

    const renderedOptions = Array.from(document.querySelectorAll('.ant-select-item-option-content')).map((option) => option.textContent ?? '');
    const builtInOptionCount = buildUnitOptions().reduce((count, groupOrOption) => count + (groupOrOption.options?.length ?? 1), 0);
    expect(renderedOptions).toHaveLength(builtInOptionCount);
    expect(renderedOptions.some((label) => label.startsWith('SI short'))).toBe(true);
    expect(renderedOptions).not.toContain('Use this custom unit: custom-unit');
  });

  it('选择内置单位后立即展示可读名称', async () => {
    const user = userEvent.setup();
    render(<ControlledUnitPicker />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'bytes(SI)');
    expect(screen.queryByText('Use this custom unit: bytes(SI)')).not.toBeInTheDocument();
    await user.click(screen.getByText('bytes(SI)', { selector: '.ant-select-item-option-content > span' }));

    expect(input).toHaveValue('bytes(SI)');
    expect(screen.getByTestId('selected-unit')).toHaveTextContent('bytesSI');
  });

  it('隐藏 SI short 选项，但旧配置仍展示可读名称', async () => {
    const user = userEvent.setup();
    render(<ControlledUnitPicker hideSIOption />);

    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('SI short');
    await user.click(input);

    expect(within(screen.getByRole('listbox')).queryByText('SI short')).not.toBeInTheDocument();
    expect(buildUnitOptions(false, true).find((group) => group.options?.some((option) => option.value === 'sishort'))).toBeUndefined();
  });
});
