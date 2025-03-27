import React, { useState, useEffect } from 'react';
import { useDebounceFn } from 'ahooks';
import _ from 'lodash';
import { Form, AutoComplete } from 'antd';
import { useTranslation } from 'react-i18next';
import { getFields } from '@/pages/explorer/Elasticsearch/services';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

interface IProps {
  field?: any;
  preName?: (string | number)[]; // field.name 之前的字段
  midName?: (string | number)[]; // 在 field.name 和 date_field 之间插入的字段
  datasourceValue: number;
  index: string;
  disabled?: boolean;
}

export default function DateField(props: IProps) {
  const { t } = useTranslation('alertRules');
  const { datasourceValue, index, field = {}, preName = [], midName = [], disabled } = props;
  const [fieldsOptions, setFieldsOptions] = useState<any[]>([]);
  const form = Form.useFormInstance();
  const { run } = useDebounceFn(
    () => {
      getFields(datasourceValue, index, 'date').then((res) => {
        setFieldsOptions(
          _.map(res.fields, (item) => {
            return {
              label: item,
              value: item,
            };
          }),
        );
        const formValuesClone = _.cloneDeep(form.getFieldsValue());
        const defaultDateField = _.includes(res.fields, '@timestamp') ? '@timestamp' : res.fields[0];
        _.set(formValuesClone, [...preName, field.name, ...midName, 'date_field'], defaultDateField);
        form.setFieldsValue(formValuesClone);
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
        {...field}
        name={[field.name, ...midName, 'date_field']}
        rules={[
          {
            required: true,
            message: t('datasource:es.date_field_msg'),
          },
        ]}
      >
        <AutoComplete dropdownMatchSelectWidth={false} style={{ width: '100%' }} disabled={disabled} options={fieldsOptions} />
      </Form.Item>
    </InputGroupWithFormItem>
  );
}
