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

/**
 * 简单模式
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Space, Select, InputNumber } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';

interface IProps {
  prefixField?: any;
  fullPrefixName?: (string | number)[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值
  prefixName?: (string | number)[]; // 列表字段名
  queries: any[];
  disabled?: boolean;
}

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');

export default function Builder(props: IProps) {
  const { t } = useTranslation();
  const { prefixField = {}, fullPrefixName = [], prefixName = [], queries, disabled } = props;

  return (
    <div>
      <Form.List {...prefixField} name={[...prefixName, 'expressions']}>
        {(fields, { add, remove }) => (
          <div>
            {fields.map((field) => {
              return (
                <div key={field.key}>
                  <Space align='start'>
                    <Form.Item {...field} name={[field.name, 'ref']}>
                      <Select disabled={disabled}>
                        {_.map(queries, (_query, index) => {
                          return (
                            <Select.Option value={alphabet[index]} key={alphabet[index]}>
                              {alphabet[index]}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'comparisonOperator']}>
                      <Select style={{ width: 64 }} disabled={disabled}>
                        <Select.Option value='=='>==</Select.Option>
                        <Select.Option value='!='>!=</Select.Option>
                        <Select.Option value='>'>{'>'}</Select.Option>
                        <Select.Option value='>='>{'>='}</Select.Option>
                        <Select.Option value='<'>{'<'}</Select.Option>
                        <Select.Option value='<='>{'<='}</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'value']}
                      rules={[
                        {
                          required: true,
                          message: t('db_aliyunSLS:trigger.value_msg'),
                        },
                      ]}
                    >
                      <InputNumber style={{ width: 200 }} disabled={disabled} />
                    </Form.Item>
                    {field.name !== fields.length - 1 && (
                      <Form.Item {...field} name={[0, 'logicalOperator']}>
                        <Select style={{ width: 80 }} disabled={disabled}>
                          <Select.Option value='&&'>AND</Select.Option>
                          <Select.Option value='||'>OR</Select.Option>
                        </Select>
                      </Form.Item>
                    )}
                    <Space
                      style={{
                        height: 32,
                        lineHeight: ' 32px',
                      }}
                    >
                      <PlusCircleOutlined
                        onClick={() => {
                          add({
                            ref: alphabet[fields.length],
                            comparisonOperator: '==',
                          });
                        }}
                      />

                      {fields.length > 1 && (
                        <MinusCircleOutlined
                          onClick={() => {
                            remove(field.name);
                          }}
                        />
                      )}
                    </Space>
                  </Space>
                </div>
              );
            })}
          </div>
        )}
      </Form.List>
    </div>
  );
}
