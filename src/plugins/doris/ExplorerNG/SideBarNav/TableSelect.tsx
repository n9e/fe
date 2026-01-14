import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { DatasourceCateEnum } from '@/utils/constant';
import { OutlinedSelect } from '@/components/OutlinedSelect';

import { NAME_SPACE } from '../../constants';
import { getDorisTables } from '../../services';

interface Props {
  datasourceValue: number;
  database?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export default function TableSelect(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
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
    <OutlinedSelect
      label={t('query.table')}
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
