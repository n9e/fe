import React, { useState, useEffect } from 'react';
import { useDebounceFn } from 'ahooks';
import _ from 'lodash';
import { Form, AutoComplete } from 'antd';
import { useTranslation } from 'react-i18next';
import { getFields } from '@/pages/explorer/Elasticsearch/services';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

interface IProps {
  prefixField?: any;
  prefixNames?: (string | number)[]; // 前缀字段名
  datasourceValue: number;
  index: string;
  disabled?: boolean;
}

export default function DateField(props: IProps) {
  const { t } = useTranslation('alertRules');
  const { datasourceValue, index, prefixField = {}, prefixNames = [prefixField.name], disabled } = props;
  const [fieldsOptions, setFieldsOptions] = useState<any[]>([]);
  const { run } = useDebounceFn(
    () => {
      getFields(datasourceValue, index, 'date').then((res) => {
        setFieldsOptions(
          _.map(res.fields, (item) => {
            return {
              value: item,
            };
          }),
        );
      });
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    if (datasourceValue && index) {
      run();
    }
  }, [datasourceValue, index]);

  return (
    <InputGroupWithFormItem label={t('datasource:es.date_field')} labelWidth={80}>
      <Form.Item
        {...prefixField}
        name={[...prefixNames, 'date_field']}
        rules={[
          {
            required: true,
            message: t('datasource:es.date_field_msg'),
          },
        ]}
      >
        <AutoComplete
          dropdownMatchSelectWidth={false}
          style={{ width: '100%' }}
          disabled={disabled}
          options={_.map(fieldsOptions, (item) => {
            return {
              value: item.value,
            };
          })}
        />
      </Form.Item>
    </InputGroupWithFormItem>
  );
}
