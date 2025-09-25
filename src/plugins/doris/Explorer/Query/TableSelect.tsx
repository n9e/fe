import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import _ from 'lodash';

import { DatasourceCateEnum } from '@/utils/constant';

import { getDorisTables } from '../../services';

interface Props {
  datasourceValue: number;
  database?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export default function TableSelect(props: Props) {
  const { datasourceValue, database, value, onChange, disabled } = props;
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    if (datasourceValue && database) {
      getDorisTables({ cate: DatasourceCateEnum.doris, datasource_id: datasourceValue, query: [database] }).then((res) => {
        setTables(res);
      });
    }
  }, [datasourceValue, database]);

  return (
    <Select
      showSearch
      optionFilterProp='label'
      options={_.map(tables, (item) => {
        return { label: item, value: item };
      })}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
