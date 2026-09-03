import React, { useContext } from 'react';
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
  const { i18n } = useTranslation();
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
      ])}
      showSearch
      optionLabelProp='optionLabel'
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
          const curValue = Array.isArray(value) ? _.last(value) : value;
          const curCate = _.find(currentDatasourceList, { id: curValue })?.plugin_type;
          onChange(value, curCate ?? (value === 'mixed' ? 'mixed' : ''));
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
