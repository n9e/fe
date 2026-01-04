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
import { Form, Row, Col, Button, Radio, Tooltip, Space } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { OutlinedSelect } from '@/components/OutlinedSelect';
import TableColumnSelect from '@/components/TableColumnSelect';
import './style.less';

export default function Demo() {
  const [value, setValue] = useState<string>('1');
  const [form] = Form.useForm();
  const [multiSelectValue, setMultiSelectValue] = useState<string[]>([]);
  return (
    <div
      style={{
        padding: 100,
        background: 'var(--fc-fill-2)',
        width: 1000,
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <p>表格展示列选择，支持排序，只展示下拉内容</p>
          <TableColumnSelect
            options={[
              { label: '列1', value: '1' },
              { label: '列2', value: '2' },
              { label: '列3', value: '3' },
              { label: '列4', value: '4' },
              { label: '列5', value: '5' },
              { label: '列6', value: '6' },
              { label: '列7', value: '7' },
              { label: '列8', value: '8' },
              { label: '列9', value: '9' },
              { label: '列10', value: '10' },
              { label: '列11', value: '11' },
              { label: '列12', value: '12' },
              { label: '列13', value: '13' },
              { label: '列14', value: '14' },
              { label: '列15', value: '15' },
              { label: '列16', value: '16' },
              { label: '列17', value: '17' },
              { label: '列18', value: '18' },
              { label: '列19', value: '19' },
              { label: '列20', value: '20' },
              { label: '列21', value: '21' },
              { label: '列22', value: '22' },
              { label: '列23', value: '23' },
              { label: '列24', value: '24' },
              { label: '列25', value: '25' },
              { label: '列26', value: '26' },
              { label: '列27', value: '27' },
              { label: '列28', value: '28' },
              { label: '列29', value: '29' },
              { label: '列30', value: '30' },
              { label: '列31', value: '31' },
              { label: '列32', value: '32' },
              { label: '列33', value: '33' },
              { label: '列34', value: '34' },
              { label: '列35', value: '35' },
              { label: '列36', value: '36' },
              { label: '列37', value: '37' },
              { label: '列38', value: '38' },
              { label: '列39', value: '39' },
              { label: '列40', value: '40' },
              { label: '列41', value: '41' },
              { label: '列42', value: '42' },
              { label: '列43', value: '43' },
              { label: '列44', value: '44' },
              { label: '列45', value: '45' },
              { label: '列46', value: '46' },
              { label: '列47', value: '47' },
              { label: '列48', value: '48' },
              { label: '列49', value: '49' },
              { label: '列50', value: '50' },
            ]}
            value={multiSelectValue}
            onChange={(value) => {
              setMultiSelectValue(value);
            }}
            sortable={true}
            showDropdown={false}
          />
        </Col>
        <Col span={12}>
          <p>表格展示列选择，支持排序，展示按钮</p>
          <TableColumnSelect
            options={[
              { label: '列1', value: '1' },
              { label: '列2', value: '2' },
              { label: '列3', value: '3' },
              { label: '列4', value: '4' },
              { label: '列5', value: '5' },
              { label: '列6', value: '6' },
              { label: '列7', value: '7' },
              { label: '列8', value: '8' },
              { label: '列9', value: '9' },
              { label: '列10', value: '10' },
              { label: '列11', value: '11' },
              { label: '列12', value: '12' },
              { label: '列13', value: '13' },
              { label: '列14', value: '14' },
              { label: '列15', value: '15' },
              { label: '列16', value: '16' },
              { label: '列17', value: '17' },
              { label: '列18', value: '18' },
              { label: '列19', value: '19' },
              { label: '列20', value: '20' },
              { label: '列21', value: '21' },
              { label: '列22', value: '22' },
              { label: '列23', value: '23' },
              { label: '列24', value: '24' },
              { label: '列25', value: '25' },
              { label: '列26', value: '26' },
              { label: '列27', value: '27' },
              { label: '列28', value: '28' },
              { label: '列29', value: '29' },
              { label: '列30', value: '30' },
              { label: '列31', value: '31' },
              { label: '列32', value: '32' },
              { label: '列33', value: '33' },
              { label: '列34', value: '34' },
              { label: '列35', value: '35' },
              { label: '列36', value: '36' },
              { label: '列37', value: '37' },
              { label: '列38', value: '38' },
              { label: '列39', value: '39' },
              { label: '列40', value: '40' },
              { label: '列41', value: '41' },
              { label: '列42', value: '42' },
              { label: '列43', value: '43' },
              { label: '列44', value: '44' },
              { label: '列45', value: '45' },
              { label: '列46', value: '46' },
              { label: '列47', value: '47' },
              { label: '列48', value: '48' },
              { label: '列49', value: '49' },
              { label: '列50', value: '50' },
            ]}
            value={multiSelectValue}
            onChange={(value) => {
              setMultiSelectValue(value);
            }}
            sortable={true}
          />
        </Col>
      </Row>

      <br />
      <br />
      <br />
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
