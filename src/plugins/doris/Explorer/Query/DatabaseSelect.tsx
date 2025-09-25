import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import _ from 'lodash';

import { DatasourceCateEnum } from '@/utils/constant';

import { getDorisDatabases } from '../../services';

interface Props {
  datasourceValue: number;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export default function DatabaseSelect(props: Props) {
  const { datasourceValue, value, onChange, disabled } = props;
  const [databases, setDatabases] = useState<string[]>([]);

  useEffect(() => {
    if (datasourceValue) {
      getDorisDatabases({ cate: DatasourceCateEnum.doris, datasource_id: datasourceValue })
        .then((res) => {
          setDatabases(res);
        })
        .catch(() => {
          setDatabases([]);
        });
    }
  }, [datasourceValue]);

  return (
    <Select
      showSearch
      optionFilterProp='label'
      options={_.map(databases, (item) => {
        return { label: item, value: item };
      })}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
