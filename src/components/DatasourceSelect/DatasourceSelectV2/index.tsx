import React, { useState } from 'react';
import { Select, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { SelectProps } from 'antd/lib/select';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { Cate } from '@/components/AdvancedWrap/utils';

import { ProSvg } from '../DatasourceCateSelect';

interface Props {
  datasourceCateList: Cate[];
  datasourceList: {
    id: string | number;
    name: string;
    plugin_type: string;
  }[];
}

export default function index(props: SelectProps & Props) {
  const { t } = useTranslation('datasourceSelect');
  const { datasourceCateList, datasourceList } = props;
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState({
    cate: undefined,
    searchValue: '',
  });

  return (
    <Select
      dropdownMatchSelectWidth={false}
      {..._.omit(props, ['datasourceCateList', 'datasourceList'])}
      open={open}
      onDropdownVisibleChange={(visible) => {
        setOpen(visible);
      }}
      dropdownRender={(menu) => (
        <div className='p2'>
          <div
            className='n9e-flex n9e-justify-between n9e-gap-1 mb2'
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Select
              style={{ minWidth: 160 }}
              dropdownMatchSelectWidth={false}
              allowClear
              optionLabelProp='label2'
              options={_.map(_.sortBy(datasourceCateList, 'value'), (item) => {
                return {
                  label: (
                    <div className='n9e-flex n9e-justify-between'>
                      <div className='n9e-flex n9e-items-center n9e-gap-1'>
                        <img src={item.logo} alt={item.label} height={16} />
                        {item.label}
                      </div>
                      {item.graphPro && <ProSvg />}
                    </div>
                  ),
                  label2: (
                    <div className='n9e-flex n9e-items-center n9e-gap-1'>
                      <img src={item.logo} alt={item.label} height={16} />
                      {item.label}
                    </div>
                  ),
                  value: item.value,
                };
              })}
              placeholder={t('allCates')}
              value={filter.cate}
              onChange={(val) => setFilter({ ...filter, cate: val })}
            />
            <Input
              prefix={<SearchOutlined />}
              allowClear
              value={filter.searchValue}
              onChange={(e) => {
                setFilter({ ...filter, searchValue: e.target.value });
              }}
            />
          </div>
          {menu}
        </div>
      )}
      options={_.map(
        _.filter(_.sortBy(datasourceList, 'plugin_type'), (item) => {
          return (!filter.cate || item.plugin_type === filter.cate) && (!filter.searchValue || _.includes(item.name, filter.searchValue));
        }),
        (item) => {
          const datasourceCate = _.find(datasourceCateList, { value: item.plugin_type });
          return {
            label: (
              <div className='n9e-flex n9e-items-center n9e-gap-1'>
                <img src={datasourceCate?.logo} alt={datasourceCate?.label} height={16} />
                {item.name}
              </div>
            ),
            value: item.id,
          };
        },
      )}
    />
  );
}
