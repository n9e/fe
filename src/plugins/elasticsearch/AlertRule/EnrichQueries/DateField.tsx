import React, { useState, useEffect } from 'react';
import { useDebounceFn } from 'ahooks';
import _ from 'lodash';
import { Form, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { getFields } from '@/pages/explorer/Elasticsearch/services';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

interface IProps {
  prefixField?: any;
  prefixNames?: string[]; // 前缀字段名
  datasourceValue: number;
  index: string;
  disabled?: boolean;
}

export default function DateField(props: IProps) {
  const { t } = useTranslation('alertRules');
  const { datasourceValue, index, prefixField = {}, prefixNames = [], disabled } = props;
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
        name={[prefixField.name, 'date_field']}
        rules={[
          {
            required: true,
            message: t('datasource:es.date_field_msg'),
          },
        ]}
      >
        <Select style={{ width: '100%' }} disabled={disabled}>
          {_.map(fieldsOptions, (item) => {
            return (
              <Select.Option key={item.value} value={item.value}>
                {item.value}
              </Select.Option>
            );
          })}
        </Select>
      </Form.Item>
    </InputGroupWithFormItem>
  );
}
