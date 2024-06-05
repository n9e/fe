/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Space } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { getLabelValues } from '@/services/metricViews';

interface Props {
  datasourceValue: number;
  range: any;
  name: number;
  labels: string[];
  remove: (name: number) => void;
}

const getLabelsOptions = (labels) => {
  return _.map(labels, (label) => {
    return (
      <Select.Option key={label} value={label}>
        {label}
      </Select.Option>
    );
  });
};

export default function Filter(props: Props) {
  const { t } = useTranslation('metricsBuiltin');
  const { datasourceValue, range, name, labels, remove } = props;
  const label = Form.useWatch(['configs', name, 'label']);
  const oper = Form.useWatch(['configs', name, 'oper']);
  const [labelOptions, setLabelOptions] = useState<string[]>([]);

  useEffect(() => {
    if (datasourceValue && range && label) {
      getLabelValues(datasourceValue, label, range).then((res) => {
        setLabelOptions(res);
      });
    }
  }, [datasourceValue, range, label]);

  return (
    <Space>
      <Form.Item name={[name, 'label']} rules={[{ required: true, message: t('filter.filter_label_msg') }]}>
        <Select allowClear showSearch style={{ width: 170 }}>
          {getLabelsOptions(labels)}
        </Select>
      </Form.Item>
      <Form.Item name={[name, 'oper']} rules={[{ required: true, message: t('filter.filter_oper_msg') }]}>
        <Select style={{ width: 60 }}>
          <Select.Option value='='>=</Select.Option>
          <Select.Option value='!='>!=</Select.Option>
          <Select.Option value='=~'>=~</Select.Option>
          <Select.Option value='!~'>!~</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name={[name, 'value']} rules={[{ required: true, message: t('filter.filter_value_msg') }]}>
        {oper === '=~' || oper === '!~' ? (
          <Input style={{ width: 200 }} />
        ) : (
          <Select
            style={{ width: 200 }}
            showSearch
            optionFilterProp='label'
            options={_.map(labelOptions, (item) => {
              return {
                label: item,
                value: item,
              };
            })}
          />
        )}
      </Form.Item>
      <Form.Item>
        <MinusCircleOutlined
          onClick={() => {
            remove(name);
          }}
        />
      </Form.Item>
    </Space>
  );
}
