import React, { useState, useEffect } from 'react';
import { Select, Space, Tag, Spin } from 'antd';
import { SelectProps } from 'antd/lib/select';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';

import { getDatasourceBriefList, DatasourceItem } from '@/services/common';
import { Cate } from '@/components/AdvancedWrap/utils';

import './style.less';

interface Props {
  datasourceCateList: Cate[];
  ajustDatasourceList?: (list: DatasourceItem[]) => DatasourceItem[];
  onChange?: (value: string | number, datasourceCate: string) => void;
  onClear?: () => void;
}

export default function index(props: SelectProps & Props) {
  const { datasourceCateList, ajustDatasourceList, onChange, onClear } = props;
  const [fetching, setFetching] = useState(false);
  const [datasourceList, setDatasourceList] = useState<DatasourceItem[]>([]);
  const fetcher = (query?: string) => {
    return getDatasourceBriefList(query, 'datasource_select_signal_key')
      .then((list) => {
        setDatasourceList(list);
      })
      .catch(() => {
        setDatasourceList([]);
      });
  };

  const { run: debounceFetcher } = useDebounceFn(
    (value: string) => {
      setFetching(true);
      fetcher(value).finally(() => {
        setFetching(false);
      });
    },
    { wait: 200 },
  );

  useEffect(() => {
    fetcher();
  }, []);

  const currentDatasourceList = ajustDatasourceList ? ajustDatasourceList(datasourceList) : datasourceList;

  return (
    <Select
      className='n9e-datasource-select-v3'
      dropdownMatchSelectWidth={false}
      {..._.omit(props, ['datasourceCateList', 'ajustDatasourceList'])}
      showSearch
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size='small' /> : null}
      optionLabelProp='optionLabel'
      options={_.map(_.orderBy(currentDatasourceList, ['is_default', 'plugin_type'], ['desc', 'asc']), (item) => {
        const datasourceCate = _.find(datasourceCateList, { value: item.plugin_type });
        return {
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
          const curCate = _.find(datasourceList, { id: value })?.plugin_type;
          if (!curCate) {
            return;
          }
          onChange(value, curCate);
        }
      }}
      onClear={onClear}
      allowClear={!!onClear}
      onDropdownVisibleChange={(visible) => {
        if (!visible) {
          // 关闭下拉时重置数据源列表
          setDatasourceList(datasourceList);
        }
      }}
    />
  );
}
