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
import React, { useState } from 'react';
import _ from 'lodash';
import { Form, Input, Button, Radio, Tooltip, Space } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { OutlinedSelect } from '@/components/OutlinedSelect';

import './style.less';

export default function Demo() {
  const [value, setValue] = useState<string>('1');
  const [form] = Form.useForm();
  return (
    <div
      style={{
        padding: 100,
        background: 'var(--fc-fill-2)',
        width: 500,
      }}
    >
      <p>Outlined Select</p>
      <OutlinedSelect
        label='数据源'
        options={[
          { label: 'Doris', value: '1' },
          { label: 'Prometheus', value: '2' },
          { label: 'Elasticsearch', value: '3' },
          { label: 'MySQL', value: '4' },
          { label: 'PostgreSQL', value: '5' },
          { label: 'SQL Server', value: '6' },
          { label: 'Oracle', value: '7' },
          { label: 'MongoDB', value: '8' },
          { label: 'Redis', value: '9' },
        ]}
        value={value}
        onChange={(value) => {
          setValue(value);
        }}
        allowClear
      />
      <br />
      <br />
      <br />

      <p>Outlined Select with different size</p>
      <OutlinedSelect
        label='数据源'
        options={[
          { label: 'Doris', value: '1' },
          { label: 'Prometheus', value: '2' },
          { label: 'Elasticsearch', value: '3' },
          { label: 'MySQL', value: '4' },
          { label: 'PostgreSQL', value: '5' },
          { label: 'SQL Server', value: '6' },
          { label: 'Oracle', value: '7' },
          { label: 'MongoDB', value: '8' },
          { label: 'Redis', value: '9' },
        ]}
        value={value}
        onChange={(value) => {
          setValue(value);
        }}
        size='small'
        allowClear
      />
      <br />
      <br />
      <br />
      <OutlinedSelect
        label='数据源'
        options={[
          { label: 'Doris', value: '1' },
          { label: 'Prometheus', value: '2' },
          { label: 'Elasticsearch', value: '3' },
          { label: 'MySQL', value: '4' },
          { label: 'PostgreSQL', value: '5' },
          { label: 'SQL Server', value: '6' },
          { label: 'Oracle', value: '7' },
          { label: 'MongoDB', value: '8' },
          { label: 'Redis', value: '9' },
        ]}
        value={value}
        onChange={(value) => {
          setValue(value);
        }}
        size='large'
      />
      <br />
      <br />
      <br />
      <p>Outlined Select with disable</p>
      <OutlinedSelect
        label={<Space>数据源</Space>}
        options={[
          { label: 'Doris', value: '1' },
          { label: 'Prometheus', value: '2' },
          { label: 'Elasticsearch', value: '3' },
          { label: 'MySQL', value: '4' },
          { label: 'PostgreSQL', value: '5' },
          { label: 'SQL Server', value: '6' },
          { label: 'Oracle', value: '7' },
          { label: 'MongoDB', value: '8' },
          { label: 'Redis', value: '9' },
        ]}
        disabled
        value={value}
        onChange={(value) => {
          setValue(value);
        }}
        allowClear
      />
      <br />
      <br />
      <br />
      <p>Outlined Select with suffix</p>
      <OutlinedSelect
        label={<Space>数据源</Space>}
        options={[
          { label: 'Doris', value: '1' },
          { label: 'Prometheus', value: '2' },
          { label: 'Elasticsearch', value: '3' },
          { label: 'MySQL', value: '4' },
          { label: 'PostgreSQL', value: '5' },
          { label: 'SQL Server', value: '6' },
          { label: 'Oracle', value: '7' },
          { label: 'MongoDB', value: '8' },
          { label: 'Redis', value: '9' },
        ]}
        value={value}
        onChange={(value) => {
          setValue(value);
        }}
        allowClear
        suffix={
          <Tooltip title='数据源的描述'>
            <Button icon={<QuestionCircleOutlined />} />
          </Tooltip>
        }
      />
      <br />
      <br />
      <br />
      <p>Outlined Select with required</p>
      <OutlinedSelect
        label='数据源'
        required
        options={[
          { label: 'Doris', value: '1' },
          { label: 'Prometheus', value: '2' },
          { label: 'Elasticsearch', value: '3' },
          { label: 'MySQL', value: '4' },
          { label: 'PostgreSQL', value: '5' },
          { label: 'SQL Server', value: '6' },
          { label: 'Oracle', value: '7' },
          { label: 'MongoDB', value: '8' },
          { label: 'Redis', value: '9' },
        ]}
        value={value}
        onChange={(value) => {
          setValue(value);
        }}
        allowClear
        suffix={
          <Tooltip title='数据源的描述'>
            <QuestionCircleOutlined style={{ marginLeft: 8 }} />
          </Tooltip>
        }
      />
      <br />
      <br />
      <br />
      <p>Outlined Select with error in Form</p>
      <Form form={form}>
        <Form.Item name='datasource' rules={[{ required: true, message: '请选择数据源' }]}>
          <OutlinedSelect
            label='数据源'
            options={[
              { label: 'Doris', value: '1' },
              { label: 'Prometheus', value: '2' },
              { label: 'Elasticsearch', value: '3' },
              { label: 'MySQL', value: '4' },
              { label: 'PostgreSQL', value: '5' },
              { label: 'SQL Server', value: '6' },
              { label: 'Oracle', value: '7' },
              { label: 'MongoDB', value: '8' },
              { label: 'Redis', value: '9' },
            ]}
          />
        </Form.Item>
        <Form.Item name='datasource1' initialValue='1'>
          <Radio.Group>
            <Radio.Button value='1'>Query mode</Radio.Button>
            <Radio.Button value='2'>SQL mode</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <Button
            type='primary'
            onClick={() =>
              form
                .validateFields()
                .then((values) => {
                  console.log(values);
                })
                .catch((error) => {
                  console.log(error);
                })
            }
          >
            提交
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
