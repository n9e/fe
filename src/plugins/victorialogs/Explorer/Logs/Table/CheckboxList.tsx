import React, { useState } from 'react';
import { Checkbox, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { NAME_SPACE } from '../../../constants';

interface Props {
  fields: string[];
  value?: string[];
  onChange?: (value: string[]) => void;
}

export default function CheckboxList(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { fields, value, onChange } = props;
  const [search, setSearch] = useState('');
  const isCheckAll = value === undefined ? true : _.isEqual(_.sortBy(fields), _.sortBy(value));
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onChange?.(fields);
    } else {
      onChange?.([]);
    }
  };
  const handleChange = (e) => {
    const newValue = e.target.checked ? [...(value || []), e.target.value] : _.filter(value, (item) => item !== e.target.value);
    onChange?.(newValue);
  };

  return (
    <div>
      <Input
        prefix={<SearchOutlined />}
        className='mb-2'
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
        allowClear
      />
      <Checkbox checked={isCheckAll} onChange={handleSelectAll}>
        {t('explorer.table_view_settings.check_all')}
      </Checkbox>
      <div
        style={{
          maxHeight: 250,
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
      >
        {_.map(
          _.filter(fields, (item) => {
            if (search) {
              return _.includes(item.toLowerCase(), search.toLowerCase());
            }
            return true;
          }),
          (item) => {
            return (
              <div key={item}>
                <Checkbox value={item} checked={value === undefined ? true : _.includes(value, item)} onChange={handleChange}>
                  {item}
                </Checkbox>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}
