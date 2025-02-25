import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { getESIndexPatterns } from '@/pages/log/IndexPatterns/services';

interface Props {
  field: any;
  datasourceValue: number;
  name?: string[]; // 订阅规则里在 field.name 和 index_pattern 之间插入的字段
}

export default function IndexPatternsSelect(props: Props) {
  const { t } = useTranslation();
  const { field, datasourceValue, name = [] } = props;
  const [indexPatterns, setIndexPatterns] = useState<any[]>([]);

  useEffect(() => {
    if (datasourceValue) {
      getESIndexPatterns(datasourceValue).then((res) => {
        setIndexPatterns(res);
      });
    }
  }, [datasourceValue]);

  return (
    <Form.Item
      {...field}
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
