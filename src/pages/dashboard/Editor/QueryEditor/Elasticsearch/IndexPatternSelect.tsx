import React from 'react';
import { Form, Select } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

interface Props {
  field: any;
  name?: string[]; // 订阅规则里在 field.name 和 index_pattern 之间插入的字段
  indexPatterns: any[];
}

export default function IndexPatternSelect(props: Props) {
  const { t } = useTranslation();
  const { field, name = [], indexPatterns } = props;

  return (
    <Form.Item
      {...field}
      label={t('datasource:es.indexPatterns')}
      name={[field.name, ...name, 'index_pattern']}
      rules={[
        {
          required: true,
          message: t('datasource:es.indexPattern_msg'),
        },
      ]}
    >
      <Select
        options={_.map(indexPatterns, (item) => {
          return {
            label: item.name,
            value: item.id,
          };
        })}
        dropdownMatchSelectWidth={false}
        showSearch
        optionFilterProp='label'
      />
    </Form.Item>
  );
}
