import React, { useContext, useEffect, useId, useRef, useState } from 'react';
import { Button, Checkbox, Empty, Select, Spin, Tooltip, message } from 'antd';
import DisabledContext from 'antd/es/config-provider/DisabledContext';
import { ExportOutlined, ReloadOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import DataSourceSelectOption from './DataSourceSelectOption';
import DataSourceSelectTag from './DataSourceSelectTag';
import { getDataSourceSelectOptions } from './model';
import type { DataSourceSelectProps, DataSourceSelectSource, DataSourceSelectValue } from './types';

import './style.less';

export default function DataSourceSelect<T = unknown>(props: DataSourceSelectProps<T>) {
  const {
    sources,
    types = [],
    id,
    label,
    className,
    placeholder,
    disabled: customDisabled,
    loading = false,
    refreshing = false,
    error,
    allowClear = true,
    onRefresh,
    onAdd,
  } = props;
  const formDisabled = useContext(DisabledContext);
  const disabled = Boolean(customDisabled || formDisabled);
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const { t } = useTranslation('dataSourceSelectionSelect');
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<Error>();
  const previousRefreshErrorRef = useRef<Error>();
  const [adding, setAdding] = useState(false);
  const isRefreshing = refreshing || internalRefreshing;
  const loadError = error || (refreshError ? t('refreshFailed') : undefined);
  const selectedValues = props.value === undefined ? [] : Array.isArray(props.value) ? props.value : [props.value];
  const typeByValue = new Map(types.map((type) => [type.value, type]));
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const options = getDataSourceSelectOptions(sources, selectedValues, !loading && !isRefreshing && !loadError).map((option) => {
    const type = option.source ? typeByValue.get(option.source.type) : undefined;
    const icon = option.source?.icon ?? type?.icon;
    const typeLabel = option.source?.typeLabel ?? type?.label ?? option.source?.type;
    const name = option.source?.name ?? `ID: ${String(option.value)}`;
    const status = option.deleted ? t('deletedSource') : option.source && option.disabled ? t('disabledSource') : '';

    return {
      key: `${typeof option.value}:${String(option.value)}`,
      value: option.value,
      disabled: option.disabled,
      title: status ? `${name} · ${status}` : name,
      searchText: [name, String(option.value), option.source?.type, typeof typeLabel === 'string' ? typeLabel : ''].join(' ').toLocaleLowerCase(),
      label: <DataSourceSelectOption option={option} icon={icon} typeLabel={typeLabel} />,
      selectedLabel: <DataSourceSelectOption option={option} icon={icon} compact />,
    };
  });
  const selectableValues = new Set(options.filter((option) => !option.disabled).map((option) => option.value));
  const selectedValueSet = new Set(selectedValues);
  const selectedSelectableCount = [...selectableValues].filter((value) => selectedValueSet.has(value)).length;
  const selectAllDisabled = disabled || loading || isRefreshing || Boolean(loadError) || selectableValues.size === 0;

  // 新失败可能与父组件 finally 结束 loading 同批发生，后续外部恢复才清除该错误。
  useEffect(() => {
    if (refreshError && previousRefreshErrorRef.current === refreshError && !loading && !refreshing && !error) setRefreshError(undefined);
    previousRefreshErrorRef.current = refreshError;
  }, [refreshError, sources, loading, refreshing, error]);

  const handleChange = (nextValue: DataSourceSelectValue | DataSourceSelectValue[] | undefined) => {
    if (disabled || loading) return;
    if (props.mode === 'multiple') {
      const values = Array.isArray(nextValue) ? nextValue : [];
      const selectedSources = values.map((value) => sourceById.get(value)).filter((source): source is DataSourceSelectSource<T> => source !== undefined);
      props.onChange?.(values, selectedSources);
    } else {
      const value = Array.isArray(nextValue) ? nextValue[0] : nextValue;
      props.onChange?.(value, value === undefined ? undefined : sourceById.get(value));
    }
  };

  const handleRefresh = async () => {
    if (!onRefresh || disabled || loading || isRefreshing) return;
    setRefreshError(undefined);
    setInternalRefreshing(true);
    try {
      await onRefresh();
    } catch {
      setRefreshError(new Error(t('refreshFailed')));
      message.error(t('refreshFailed'));
    } finally {
      setInternalRefreshing(false);
    }
  };

  const handleAdd = async () => {
    if (!onAdd || disabled || adding) return;
    setAdding(true);
    try {
      await onAdd();
    } catch {
      message.error(t('addFailed'));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={classNames('data-source-selection-select-box', className)}>
      {label || onRefresh || onAdd ? (
        <div className='data-source-selection-select-toolbar'>
          {label ? (
            <label className='data-source-selection-select-label' htmlFor={controlId}>
              {label}
            </label>
          ) : null}
          {onRefresh || onAdd ? (
            <div className='data-source-selection-select-actions'>
              {onRefresh ? (
                <Tooltip title={t('refresh')} overlayClassName='data-source-selection-select-tooltip-box'>
                  <Button
                    size='small'
                    aria-label={t('refresh')}
                    icon={<ReloadOutlined />}
                    loading={isRefreshing}
                    disabled={disabled || loading || isRefreshing}
                    onClick={handleRefresh}
                  >
                    {t('refreshAction')}
                  </Button>
                </Tooltip>
              ) : null}
              {onAdd ? (
                <Tooltip title={t('add')} overlayClassName='data-source-selection-select-tooltip-box'>
                  <Button size='small' aria-label={t('add')} icon={<ExportOutlined />} loading={adding} disabled={disabled || adding} onClick={handleAdd}>
                    {t('accessAction')}
                  </Button>
                </Tooltip>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      <Select<DataSourceSelectValue | DataSourceSelectValue[] | undefined>
        id={controlId}
        className='data-source-selection-select-control'
        dropdownClassName='data-source-selection-select-dropdown-box'
        mode={props.mode === 'multiple' ? 'multiple' : undefined}
        maxTagCount='responsive'
        value={props.value}
        onChange={handleChange}
        options={options}
        optionLabelProp='selectedLabel'
        showSearch
        allowClear={allowClear}
        disabled={disabled || loading}
        loading={loading || isRefreshing}
        status={loadError ? 'error' : undefined}
        placeholder={placeholder ?? t('placeholder')}
        aria-label={placeholder ?? t('placeholder')}
        filterOption={(query, option) => Boolean(option?.searchText?.includes(query.trim().toLocaleLowerCase()))}
        listHeight={288}
        listItemHeight={36}
        dropdownRender={(menu) => (
          <>
            {props.mode === 'multiple' && props.showSelectAll ? (
              <div className='data-source-selection-select-all' onMouseDown={(event) => event.preventDefault()}>
                <Checkbox
                  checked={selectableValues.size > 0 && selectedSelectableCount === selectableValues.size}
                  indeterminate={selectedSelectableCount > 0 && selectedSelectableCount < selectableValues.size}
                  disabled={selectAllDisabled}
                  onChange={(event) => {
                    if (selectAllDisabled) return;
                    handleChange(event.target.checked ? [...new Set([...selectedValues, ...selectableValues])] : []);
                  }}
                >
                  {t('selectAll')}
                </Checkbox>
              </div>
            ) : null}
            {loadError ? (
              <div className='data-source-selection-select-feedback' role='alert'>
                {React.isValidElement(loadError) || typeof loadError === 'string' ? loadError : t('loadFailed')}
              </div>
            ) : null}
            {menu}
          </>
        )}
        notFoundContent={loading ? <Spin size='small' /> : loadError ? <></> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('empty')} />}
        tagRender={({ value, label, onClose }) => (
          <DataSourceSelectTag name={sourceById.get(value)?.name ?? `ID: ${String(value)}`} disabled={disabled || loading} onRemove={onClose}>
            {label}
          </DataSourceSelectTag>
        )}
      />
    </div>
  );
}
