import React, { useContext } from 'react';
import { Space, Select } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { getAuthorizedDatasourceCates, Cate } from '@/components/AdvancedWrap';
import { CommonStateContext } from '@/App';

interface IProps {
  datasourceCate?: string;
  onDatasourceCateChange?: (val: string) => void;
  datasourceValue?: number | number[];
  datasourceValueMode?: 'multiple';
  onDatasourceValueChange?: (val: number | number[]) => void;
  defaultDatasourceValue?: number;
  filterCates?: (cates: Cate[]) => Cate[];
}

export default function Pure(props: IProps) {
  const { t } = useTranslation('datasourceSelect');
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const { datasourceCate, onDatasourceCateChange, datasourceValue, datasourceValueMode, onDatasourceValueChange, defaultDatasourceValue } = props;
  let cates = getAuthorizedDatasourceCates();
  cates = props.filterCates ? props.filterCates(cates) : cates;

  return (
    <Space>
      <Select
        allowClear
        placeholder={t('type')}
        dropdownMatchSelectWidth={false}
        style={{ minWidth: 100 }}
        value={datasourceCate}
        onChange={(val) => {
          if (onDatasourceCateChange) onDatasourceCateChange(val);
        }}
      >
        {_.map(cates, (item) => (
          <Select.Option key={item.value} value={item.value}>
            {item.label}
          </Select.Option>
        ))}
      </Select>
      <Select
        allowClear
        placeholder={t('id')}
        style={{ minWidth: 120 }}
        dropdownMatchSelectWidth={false}
        mode={datasourceValueMode}
        value={datasourceValue}
        onChange={(val) => {
          if (onDatasourceValueChange) onDatasourceValueChange(val);
        }}
        maxTagCount='responsive'
      >
        {_.map(datasourceCate ? groupedDatasourceList[datasourceCate] : [], (item) => (
          <Select.Option value={item.id} key={item.id}>
            {item.name}
          </Select.Option>
        ))}
      </Select>
    </Space>
  );
}
