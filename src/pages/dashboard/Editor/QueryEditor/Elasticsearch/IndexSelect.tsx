import React, { useState, useEffect } from 'react';
import { Form, AutoComplete } from 'antd';
import type { FormListFieldData } from 'antd/lib/form/FormList';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import { getIndices } from '@/services/warning';
import type { ElasticsearchSelectOption } from './types';

interface IProps {
  prefixField?: FormListFieldData;
  prefixName?: string[] | number[];
  cate: string;
  datasourceValue?: number;
  name?: string | string[]; // 可自定义 name 或者 [...prefixName, 'query', 'index']
}

export default function IndexSelect({ prefixField = {}, prefixName = [], cate, datasourceValue, name }: IProps) {
  const [options, setOptions] = useState<ElasticsearchSelectOption[]>([]);
  const [search, setSearch] = useState('');
  const { t } = useTranslation('datasource');
  const restPrefixField = _.omit(prefixField, 'key');

  useEffect(() => {
    if (datasourceValue) {
      getIndices(datasourceValue).then((res) => {
        setOptions(
          _.map(res, (item) => {
            return {
              value: item,
            };
          }),
        );
      });
    }
  }, [cate, datasourceValue]);

  return (
    <Form.Item
      label={t('datasource:es.index')}
      tooltip={<Trans ns='datasource' i18nKey='datasource:es.index_tip' components={{ 1: <br /> }} />}
      {...restPrefixField}
      name={name || [...prefixName, 'query', 'index']}
      rules={[
        {
          required: true,
          message: t('datasource:es.index_msg'),
        },
      ]}
      validateTrigger='onBlur'
    >
      <AutoComplete
        options={_.filter(options, (item) => {
          if (search) {
            return item.value.includes(search);
          }
          return true;
        })}
        onSearch={(val) => {
          setSearch(val);
        }}
      />
    </Form.Item>
  );
}
