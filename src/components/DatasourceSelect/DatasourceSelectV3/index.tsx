import React, { useContext } from 'react';
import { WarningOutlined } from '@ant-design/icons';
import { Select, Space, Tag } from 'antd';
import { SelectProps } from 'antd/lib/select';
import classNames from 'classnames';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { Cate, getCateDisplayLabel } from '@/components/AdvancedWrap/utils';

import EmptyDatasourcePopover from '../EmptyDatasourcePopover';

import './style.less';

interface DatasourceItem {
  id: number | string;
  name: string;
  plugin_type: string;
  plugin_type_name?: string;
  is_default?: boolean;
  identifier?: string;
  weight?: number;
}

interface Props {
  type?: 'metric' | 'logging';
  datasourceList?: DatasourceItem[];
  datasourceCateList?: Cate[];
  ajustDatasourceList?: (list: DatasourceItem[]) => DatasourceItem[];
  onChange?: (value: string | number | Array<string | number>, datasourceCate: string) => void;
  onClear?: () => void;
  additionalOptions?: SelectProps['options'];
  filterKey?: string;
  showHost?: boolean;
  renderOptionIcon?: (item: DatasourceItem) => React.ReactNode;
  isOptionDisabled?: (item: DatasourceItem) => boolean;
  renderOptionExtra?: (item: DatasourceItem) => React.ReactNode;
  showEmptyDatasourcePopover?: boolean;
}

type DatasourceValue = string | number;

function getRawValue(value: DatasourceValue | { value: DatasourceValue }): DatasourceValue {
  return typeof value === 'object' ? value.value : value;
}

export default function index(props: SelectProps & Props) {
  const {
    type,
    datasourceList: providedDatasourceList,
    datasourceCateList,
    ajustDatasourceList,
    onChange,
    onClear,
    additionalOptions,
    filterKey,
    showHost,
    renderOptionIcon,
    isOptionDisabled,
    renderOptionExtra,
    showEmptyDatasourcePopover = true,
    className,
  } = props;
  const { t, i18n } = useTranslation('datasourceSelect');
  const { datasourceList: contextDatasourceList = [], datasourceCateOptions = [], isPlus } = useContext(CommonStateContext);
  const resolvedDatasourceList: DatasourceItem[] = providedDatasourceList ?? contextDatasourceList;
  const resolvedDatasourceCateList = datasourceCateList ?? datasourceCateOptions;
  const currentDatasourceList = (ajustDatasourceList ? ajustDatasourceList(resolvedDatasourceList) : resolvedDatasourceList).filter((item) => {
    if (!filterKey) {
      return true;
    }
    const datasourceCate = _.find(resolvedDatasourceCateList, { value: item.plugin_type });
    const supported = (datasourceCate as any)?.[filterKey];
    return isPlus ? supported : supported && !datasourceCate?.alertPro;
  });
  const orderedDatasourceList = providedDatasourceList ? currentDatasourceList : _.orderBy(currentDatasourceList, ['is_default', 'plugin_type', 'weight'], ['desc', 'asc', 'asc']);
  const additionalOptionValues = (additionalOptions ?? [])
    .map((option) => option?.value)
    .filter((value): value is DatasourceValue => typeof value === 'string' || typeof value === 'number');
  // additionalOptions 中的伪值（如 mixed）并非数据源，回填时保留其原有展示。
  const preservedOptionValues = new Set<DatasourceValue>([...additionalOptionValues, ...(showHost ? [-999] : [])]);
  const normalizeSelectedValue = (value: SelectProps['value']) => {
    if (value == null) return undefined;

    const normalizeValue = (item: DatasourceValue | { value: DatasourceValue }) => {
      const rawValue = getRawValue(item);
      // 业务过滤仅影响下拉可选项，不能将原始数据源列表中仍存在的数据源标记为已删除。
      const exists = _.some(resolvedDatasourceList, { id: rawValue }) || preservedOptionValues.has(rawValue);

      return exists
        ? { value: rawValue }
        : {
            value: rawValue,
            label: (
              <span className='n9e-datasource-select-v3-deleted-value'>
                <WarningOutlined />
                id: {rawValue} {t('deleted')}
              </span>
            ),
          };
    };

    return Array.isArray(value) ? value.map(normalizeValue) : normalizeValue(value);
  };

  const select = (
    <Select
      className={classNames('n9e-datasource-select-v3', className)}
      dropdownMatchSelectWidth={false}
      {..._.omit(props, [
        'type',
        'datasourceList',
        'datasourceCateList',
        'ajustDatasourceList',
        'additionalOptions',
        'filterKey',
        'showHost',
        'renderOptionIcon',
        'isOptionDisabled',
        'renderOptionExtra',
        'showEmptyDatasourcePopover',
        'className',
        'value',
        'defaultValue',
        'labelInValue',
      ])}
      showSearch
      labelInValue
      optionLabelProp='optionLabel'
      value={normalizeSelectedValue(props.value)}
      defaultValue={normalizeSelectedValue(props.defaultValue)}
      filterOption={(inputValue, option) => {
        // 根据空格分词进行过滤，取交集
        const keywords = _.filter(_.split(inputValue, ' '), (kw) => kw) as string[];
        return _.every(keywords, (kw) => _.includes(_.toLower(option?.filter), _.toLower(kw)));
      }}
      options={[
        ...(additionalOptions ?? []),
        ...(showHost
          ? [
              {
                filter: 'host',
                label: (
                  <Space>
                    <img src='/image/logos/host.png' alt='Host' height={16} />
                    Host
                  </Space>
                ),
                optionLabel: (
                  <Space>
                    <img src='/image/logos/host.png' alt='Host' height={16} />
                    Host
                  </Space>
                ),
                value: -999,
              },
            ]
          : []),
        ..._.map(orderedDatasourceList, (item) => {
          const datasourceCate = _.find(resolvedDatasourceCateList, { value: item.plugin_type });
          const displayLabel = getCateDisplayLabel(datasourceCate, i18n.language) || item.plugin_type_name || item.plugin_type;
          const optionIcon = renderOptionIcon?.(item) ?? (datasourceCate?.logo ? <img src={datasourceCate.logo} alt={displayLabel} height={16} className='shrink-0' /> : null);
          return {
            filter: [item.plugin_type, item.plugin_type_name, displayLabel, item.name].filter(Boolean).join(' '),
            originLabel: item.name,
            optionLabel: (
              <div className='flex items-center gap-2 overflow-hidden'>
                {optionIcon}
                <span className='truncate'>{item.name}</span>
              </div>
            ),
            label: (
              <div className='flex items-center gap-2 justify-between'>
                <Space>
                  {optionIcon}
                  {item.name}
                </Space>
                <Space size={4}>
                  {item.is_default && <Tag className='n9e-datasource-select-v3-default-tag'>default</Tag>}
                  <span
                    style={{
                      color: 'var(--fc-text-4)',
                    }}
                  >
                    {displayLabel}
                  </span>
                  {renderOptionExtra?.(item)}
                </Space>
              </div>
            ),
            value: item.id,
            disabled: isOptionDisabled?.(item),
          };
        }),
      ]}
      onChange={(value) => {
        if (onChange) {
          const selectedValue = Array.isArray(value) ? value.map(getRawValue) : getRawValue(value);
          const curValue = Array.isArray(selectedValue) ? _.last(selectedValue) : selectedValue;
          const curCate = _.find(currentDatasourceList, { id: curValue })?.plugin_type;
          onChange(selectedValue, curCate ?? (selectedValue === 'mixed' ? 'mixed' : ''));
        }
      }}
      onClear={onClear}
      allowClear={!!onClear}
    />
  );

  if (!showEmptyDatasourcePopover) return select;

  return (
    <EmptyDatasourcePopover type={type} datasourceList={currentDatasourceList}>
      {select}
    </EmptyDatasourcePopover>
  );
}
