import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { DatasourceCateEnum } from '@/utils/constant';
import { OutlinedSelect } from '@/components/OutlinedSelect';

import { NAME_SPACE } from '../../constants';
import { getDorisDatabases } from '../../services';

interface Props {
  datasourceValue: number;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function DatabaseSelect(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { datasourceValue, value, onChange, disabled, className } = props;
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
    <OutlinedSelect
      className={className}
      label={t('query.database')}
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
