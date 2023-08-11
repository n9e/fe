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
import React, { useState, useEffect, useContext } from 'react';
import { Form, Input, Select, Col, Row, AutoComplete } from 'antd';
import { MinusCircleOutlined, CaretDownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { CommonStateContext } from '@/App';

interface Itag {
  field: any;
  remove: Function;
  add: Function;
  fields: any[];
  form: any;
}

const { Option } = Select;

const TagItem = ({ field, remove, form }: Itag) => {
  const { t } = useTranslation('alertSubscribes');
  const { busiGroups } = useContext(CommonStateContext);
  const [valuePlaceholder, setValuePlaceholder] = useState<string>('');
  const [funcCur, setfuncCur] = useState('==');
  const funcChange = (val) => {
    let text = '';
    if (val === 'in') {
      text = '可以输入多个值，用回车分割';
    } else if (val === '=~') {
      text = '请输入正则表达式匹配标签value';
    }
    setfuncCur(val);
    setValuePlaceholder(text);
  };

  useEffect(() => {
    const tags = form.getFieldValue('busi_groups');
    funcChange(tags[field.name].func);
  }, []);

  return (
    <>
      <Row gutter={[10, 10]} style={{ marginBottom: '16px' }}>
        <Form.Item style={{ marginBottom: 0 }} name={[field.name, 'key']} rules={[{ required: true, message: t('key不能为空') }]} hidden>
          <Input />
        </Form.Item>
        <Col span={5}>
          <Input disabled value={t('group.key.placeholder') as string} />
        </Col>
        <Col span={3}>
          <Form.Item style={{ marginBottom: 0 }} name={[field.name, 'func']} initialValue='=='>
            <Select suffixIcon={<CaretDownOutlined />} onChange={funcChange}>
              <Option value='=='>==</Option>
              <Option value='=~'>=~</Option>
              <Option value='in'>in</Option>
              <Option value='not in'>not in</Option>
              <Option value='!='>!=</Option>
              <Option value='!~'>!~</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={15}>
          <Form.Item style={{ marginBottom: 0 }} name={[field.name, 'value']} rules={[{ required: true, message: t('value不能为空') }]}>
            {['not in', 'in'].includes(funcCur) ? (
              <Select
                mode='tags'
                style={{ width: '100%' }}
                placeholder={t(valuePlaceholder)}
                tokenSeparators={[' ']}
                options={_.map(busiGroups, (item) => {
                  return {
                    value: item.name,
                    label: item.name,
                  };
                })}
              />
            ) : (
              <AutoComplete
                placeholder={t(valuePlaceholder)}
                options={_.map(busiGroups, (item) => {
                  return {
                    value: item.name,
                    label: item.name,
                  };
                })}
                filterOption={(inputValue, option) => {
                  return option?.value ? String(option?.value).toUpperCase().indexOf(inputValue.toUpperCase()) !== -1 : false;
                }}
              />
            )}
          </Form.Item>
        </Col>
        <Col>
          <MinusCircleOutlined style={{ marginTop: '8px' }} onClick={() => remove(field.name)} />
        </Col>
      </Row>
    </>
  );
};

export default TagItem;
