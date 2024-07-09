import React, { useState, useEffect, useContext } from 'react';
import { Select } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { CommonStateContext } from '@/App';
import { getBusiGroups } from './services';
import { getBusinessGroupsOptions } from './utils';

interface Props {
  value?: number | number[];
  onChange?: (value?: number | number[]) => void;
  mode?: 'multiple';
}

export default function BusinessGroupSelect(props: Props) {
  const { t } = useTranslation();
  const { busiGroups } = useContext(CommonStateContext);
  const { value, onChange, mode } = props;
  const [allBusiGroups, setAllBusiGroups] = useState<any[]>([]);

  useEffect(() => {
    getBusiGroups({
      all: true,
    }).then((res) => {
      setAllBusiGroups(res);
    });
  }, []);

  return (
    <Select
      allowClear
      mode={mode}
      placeholder={t('common:business_group')}
      style={{ minWidth: 80 }}
      value={value}
      onChange={onChange}
      dropdownMatchSelectWidth={false}
      showSearch
      optionFilterProp='label'
      options={getBusinessGroupsOptions(busiGroups, allBusiGroups)}
    />
  );
}
