import React, { useState } from 'react';
import { Input } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { Field } from '../../../services';
import FieldsItem from './FieldsItem';

interface Props {
  fields: Field[];
  onValueFilter: (parmas: { key: string; value: string; operator: 'and' | 'not' }) => void;
}

export default function index(props: Props) {
  const { t } = useTranslation('explorer');
  const { fields, onValueFilter } = props;
  const [fieldsSearch, setFieldsSearch] = useState('');

  if (_.isEmpty(fields)) return null;

  return (
    <div className='h-full min-h-0'>
      <Input
        placeholder={t('log.search_placeholder')}
        value={fieldsSearch}
        onChange={(e) => {
          setFieldsSearch(e.target.value);
        }}
        allowClear
      />
      <div
        style={{
          height: 'calc(100% - 32px)',
        }}
        className='overflow-y-auto mt-[-1px] n9e-border-antd border-t-0 rounded-bl-sm rounded-br-sm py-2'
      >
        {_.map(
          _.filter(fields, (item) => {
            // 忽略大小写搜索
            if (!fieldsSearch) return true;
            return _.includes(_.lowerCase(item.field), _.lowerCase(fieldsSearch));
          }),
          (item) => {
            return <FieldsItem key={item.field} record={item} onValueFilter={onValueFilter} />;
          },
        )}
      </div>
    </div>
  );
}
