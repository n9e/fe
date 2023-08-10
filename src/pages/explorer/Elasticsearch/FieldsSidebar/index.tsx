import React, { useState } from 'react';
import { Input } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import FieldsList from './FieldsList';
import { Field, Filter } from '../services';
import './style.less';

interface IProps {
  fields: Field[];
  setFields: (fields: Field[]) => void;
  value: Field[];
  onChange: (value: Field[]) => void;
  fieldConfig?: any;
  params?: any;
  filters?: Filter[];
  onValueFilter?: (Filter) => void;
}

export default function index(props: IProps) {
  const { t } = useTranslation('explorer');
  const { fields, setFields, value, onChange, fieldConfig, params, filters, onValueFilter } = props;
  const [fieldsSearch, setFieldsSearch] = useState('');

  return (
    <div className='discover-sidebar'>
      <div className='discover-sidebar-title'>
        <Input
          placeholder={t('log.search_placeholder')}
          value={fieldsSearch}
          onChange={(e) => {
            setFieldsSearch(e.target.value);
          }}
          allowClear
        />
      </div>
      <div className='discover-sidebar-content'>
        <FieldsList
          style={{ marginBottom: 10 }}
          fieldsSearch={fieldsSearch}
          fields={value}
          type='selected'
          onRemove={(field) => {
            const finded = _.find(value, { name: field });
            setFields(finded ? _.sortBy(_.concat(fields, finded), 'name') : fields);
            onChange(
              _.filter(value, (item) => {
                return item.name !== field;
              }),
            );
          }}
          fieldConfig={fieldConfig}
          params={params}
          filters={filters}
          onValueFilter={onValueFilter}
        />
        <FieldsList
          fields={fields}
          fieldsSearch={fieldsSearch}
          type='available'
          onSelect={(field) => {
            const finded = _.find(fields, { name: field });
            onChange(finded ? _.concat(value, finded) : value);
            setFields(
              _.filter(fields, (item) => {
                return item.name !== field;
              }),
            );
          }}
          fieldConfig={fieldConfig}
          params={params}
          filters={filters}
          onValueFilter={onValueFilter}
        />
      </div>
    </div>
  );
}
