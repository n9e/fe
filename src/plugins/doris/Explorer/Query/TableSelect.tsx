import React, { useState, useEffect, useRef } from 'react';
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

  const datasourceValueRef = useRef(datasourceValue);
  useEffect(() => {
    datasourceValueRef.current = datasourceValue;
  });

  useEffect(() => {
    if (database) {
      getDorisTables({ cate: DatasourceCateEnum.doris, datasource_id: datasourceValueRef.current, query: [database] }).then((res) => {
        setTables(res);
      });
    }
  }, [database]);

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
