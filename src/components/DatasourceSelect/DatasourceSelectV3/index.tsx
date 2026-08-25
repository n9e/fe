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
  is_default: boolean;
  identifier?: string;
}

interface Props {
  type?: 'metric' | 'logging';
  datasourceCateList: Cate[];
  ajustDatasourceList?: (list: DatasourceItem[]) => DatasourceItem[];
  onChange?: (value: string | number | Array<string | number>, datasourceCate: string) => void;
  onClear?: () => void;
  additionalOptions?: SelectProps['options'];
  filterKey?: string;
  showHost?: boolean;
}

export default function index(props: SelectProps & Props) {
  const { type, datasourceCateList, ajustDatasourceList, onChange, onClear, additionalOptions, filterKey, showHost, className } = props;
  const { i18n } = useTranslation();
  const { datasourceList, datasourceCateOptions, isPlus } = useContext(CommonStateContext);
  const currentDatasourceList = (ajustDatasourceList ? ajustDatasourceList(datasourceList) : datasourceList).filter((item) => {
    if (!filterKey) {
      return true;
    }
    const datasourceCate = _.find(datasourceCateOptions, { value: item.plugin_type });
    const supported = (datasourceCate as any)?.[filterKey];
    return isPlus ? supported : supported && !datasourceCate?.alertPro;
  });

  return (
    <EmptyDatasourcePopover type={type} datasourceList={currentDatasourceList}>
      <Select
        className={classNames('n9e-datasource-select-v3', className)}
        dropdownMatchSelectWidth={false}
        {..._.omit(props, ['type', 'datasourceCateList', 'ajustDatasourceList', 'additionalOptions', 'filterKey', 'showHost', 'className'])}
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
          ..._.map(_.orderBy(currentDatasourceList, ['is_default', 'plugin_type', 'weight'], ['desc', 'asc', 'asc']), (item) => {
            const datasourceCate = _.find(datasourceCateList, { value: item.plugin_type });
            const displayLabel = getCateDisplayLabel(datasourceCate, i18n.language);
            return {
              filter: [item.plugin_type, displayLabel, item.name].join(' '),
              originLabel: item.name,
              optionLabel: (
                <div>
                  <Space>
                    <img src={datasourceCate?.logo} alt={displayLabel} height={16} />
                    {item.name}
                  </Space>
                </div>
              ),
              label: (
                <div className='flex items-center gap-2 justify-between'>
                  <Space>
                    <img src={datasourceCate?.logo} alt={displayLabel} height={16} />
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
                  </Space>
                </div>
              ),
              value: item.id,
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
    </EmptyDatasourcePopover>
  );
}
