import React, { useContext } from 'react';
import { Select, Space, Tag } from 'antd';
import { SelectProps } from 'antd/lib/select';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { Cate } from '@/components/AdvancedWrap/utils';

import './style.less';

interface DatasourceItem {
  id: number;
  name: string;
  plugin_type: string;
  is_default: boolean;
  identifier?: string;
}

interface Props {
  datasourceCateList: Cate[];
  ajustDatasourceList?: (list: DatasourceItem[]) => DatasourceItem[];
  onChange?: (value: string | number, datasourceCate: string) => void;
  onClear?: () => void;
}

export default function index(props: SelectProps & Props) {
  const { datasourceCateList, ajustDatasourceList, onChange, onClear } = props;
  const { datasourceList } = useContext(CommonStateContext);
  const currentDatasourceList = ajustDatasourceList ? ajustDatasourceList(datasourceList) : datasourceList;

  return (
    <Select
      className='n9e-datasource-select-v3'
      dropdownMatchSelectWidth={false}
      {..._.omit(props, ['datasourceCateList', 'ajustDatasourceList'])}
      showSearch
      optionLabelProp='optionLabel'
      filterOption={(inputValue, option) => {
        // 根据空格分词进行过滤，取交集
        const keywords = _.filter(_.split(inputValue, ' '), (kw) => kw);
        return _.every(keywords, (kw) => _.includes(option?.filter, kw));
      }}
      options={_.map(_.orderBy(currentDatasourceList, ['is_default', 'plugin_type'], ['desc', 'asc']), (item) => {
        const datasourceCate = _.find(datasourceCateList, { value: item.plugin_type });
        return {
          filter: item.plugin_type + item.name,
          originLabel: item.name,
          optionLabel: (
            <div>
              <Space>
                <img src={datasourceCate?.logo} alt={datasourceCate?.label} height={16} />
                {item.name}
              </Space>
            </div>
          ),
          label: (
            <div className='flex items-center gap-2 justify-between'>
              <Space>
                <img src={datasourceCate?.logo} alt={datasourceCate?.label} height={16} />
                {item.name}
                {item.is_default && <Tag color='var(--fc-fill-primary)'>default</Tag>}
              </Space>
              <span
                style={{
                  color: 'var(--fc-text-4)',
                }}
              >
                {datasourceCate?.label}
              </span>
            </div>
          ),
          value: item.id,
        };
      })}
      onChange={(value) => {
        if (onChange) {
          const curCate = _.find(currentDatasourceList, { id: value })?.plugin_type;
          if (!curCate) {
            return;
          }
          onChange(value, curCate);
        }
      }}
      onClear={onClear}
      allowClear={!!onClear}
    />
  );
}
