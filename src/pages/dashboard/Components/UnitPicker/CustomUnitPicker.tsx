import React, { useRef, useState } from 'react';
import { AutoComplete } from 'antd';
import type { AutoCompleteProps } from 'antd';
import i18next from 'i18next';
import { buildUnitOptions, units } from './utils';
import type { UnitOption } from './utils';
import './locale';

interface Props {
  hideOptionLabel?: boolean;
  hideSIOption?: boolean;
  ajustUnitOptions?: (units: UnitOption[]) => UnitOption[];
}

function getDisplayValue(value: unknown, options: UnitOption[]) {
  if (typeof value !== 'string') {
    return value;
  }

  for (const groupOrOption of options) {
    const option = groupOrOption.options?.find((item) => item.value === value) ?? (groupOrOption.value === value ? groupOrOption : undefined);
    const label = option?.cleanLabel ?? option?.label;
    if (typeof label === 'string') {
      return label;
    }
  }

  return value;
}

function hasSelectableUnit(value: string, ...optionLists: UnitOption[][]) {
  const normalizedValue = value.trim().toLocaleLowerCase();
  return optionLists.some((options) =>
    options.some((groupOrOption) => {
      const selectableOptions = groupOrOption.options ?? [groupOrOption];
      return selectableOptions.some((option) =>
        [option.value, option.cleanLabel, option.label].some((candidate) => typeof candidate === 'string' && candidate.trim().toLocaleLowerCase() === normalizedValue),
      );
    }),
  );
}

export default function index(props: AutoCompleteProps & Props) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const isSearchingRef = useRef(false);
  const {
    hideOptionLabel,
    hideSIOption,
    ajustUnitOptions,
    value,
    placeholder,
    onChange,
    onFocus,
    onBlur,
    onSelect,
    onClear,
    onDropdownVisibleChange,
    filterOption,
    ...autoCompleteProps
  } = props;

  const startSearch = (nextValue = '') => {
    isSearchingRef.current = true;
    setSearchValue(nextValue);
    setIsSearching(true);
  };
  const stopSearch = () => {
    isSearchingRef.current = false;
    setIsSearching(false);
  };
  const unitOptions = buildUnitOptions(hideOptionLabel, hideSIOption, ajustUnitOptions);
  // 隐藏的内置选项仍可能存在于旧配置中，展示时回退到完整单位表。
  const visibleDisplayValue = getDisplayValue(value, unitOptions);
  const selectedDisplayValue = visibleDisplayValue === value ? getDisplayValue(value, units) : visibleDisplayValue;
  const customUnit = searchValue.trim();
  const customUnitOptionLabel = customUnit ? i18next.t('unitPicker:useCustomUnit', { unit: customUnit }) : '';
  const options =
    customUnit && !hasSelectableUnit(customUnit, unitOptions, units)
      ? [
          ...unitOptions,
          {
            label: customUnitOptionLabel,
            value: customUnit,
            cleanLabel: customUnit,
            searchText: `${customUnitOptionLabel} ${customUnit}`,
          },
        ]
      : unitOptions;

  return (
    <AutoComplete
      {...autoCompleteProps}
      value={isSearching ? searchValue : selectedDisplayValue}
      placeholder={isSearching && typeof selectedDisplayValue === 'string' ? selectedDisplayValue : placeholder}
      filterOption={
        filterOption ??
        ((inputValue, option) =>
          String(option?.searchText ?? option?.cleanLabel ?? '')
            .toLocaleLowerCase()
            .includes(inputValue.trim().toLocaleLowerCase()))
      }
      onChange={(nextValue) => {
        startSearch(String(nextValue ?? ''));
      }}
      onFocus={(event) => {
        // 聚焦时清空搜索值以展示完整选项；当前值仍通过 placeholder 展示。
        startSearch();
        onFocus?.(event);
      }}
      onBlur={(event) => {
        stopSearch();
        onBlur?.(event);
      }}
      onSelect={(nextValue, option) => {
        stopSearch();
        if (!Object.is(nextValue, value)) {
          onChange?.(nextValue, option);
        }
        onSelect?.(nextValue, option);
      }}
      onClear={() => {
        stopSearch();
        onChange?.(undefined as never, undefined as never);
        onClear?.();
      }}
      onDropdownVisibleChange={(open) => {
        if (open && !isSearchingRef.current) {
          startSearch();
        }
        onDropdownVisibleChange?.(open);
      }}
      options={options}
    />
  );
}
