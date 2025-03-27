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
  index: number;
  form: any;
}

const { Option } = Select;

const TagItem = ({ field, remove, form, fields, index }: Itag) => {
  const { t } = useTranslation('alertSubscribes');
  const { busiGroups } = useContext(CommonStateContext);
  const [valuePlaceholder, setValuePlaceholder] = useState<string>('');
  const [funcCur, setfuncCur] = useState('==');
  const funcChange = (val) => {
    let text = t('tag.value.equal_placeholder');
    if (val === 'in' || val === 'not in') {
      text = t('tag.value.include_placeholder');
    } else if (val === '=~' || val === '!~') {
      text = t('tag.value.regex_placeholder');
    }
    setfuncCur(val);
    setValuePlaceholder(text);
  };

  useEffect(() => {
    const tags = form.getFieldValue('busi_groups');
    funcChange(tags[field.name].func);
  }, []);

  return (
    <div className='filter-settings-row'>
      {fields.length > 1 && (
        <div className='filter-settings-row-connector'>
          {fields.length - 1 !== index && <div className='filter-settings-row-connector-line' />}
          <div className='filter-settings-row-connector-text-container'>
            <div className='filter-settings-row-connector-text'>{t('and')}</div>
          </div>
        </div>
      )}
      <div className='filter-settings-row-content' style={{ marginTop: 0 }}>
        <Row gutter={10} className='mb2'>
          <Col flex='auto'>
            <Row gutter={10}>
              <Form.Item style={{ marginBottom: 0 }} name={[field.name, 'key']} hidden>
                <Input />
              </Form.Item>
              <Col span={5}>
                <Input disabled value={t('group.key.placeholder') as string} />
              </Col>
              <Col span={4}>
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
                <Form.Item style={{ marginBottom: 0 }} name={[field.name, 'value']} rules={[{ required: true, message: t('group.value.required') }]}>
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
            </Row>
          </Col>
          <Col flex='32px'>
            <MinusCircleOutlined style={{ lineHeight: '32px' }} onClick={() => remove(field.name)} />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default TagItem;
