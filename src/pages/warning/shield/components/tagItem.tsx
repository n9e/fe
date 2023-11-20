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
import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Col, Row } from 'antd';
import { MinusCircleOutlined, CaretDownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
const { Option } = Select;
interface Itag {
  count: number;
  field: any;
  remove: Function;
  form: any;
}

const TagItem: React.FC<Itag> = ({ count, field, remove, form }) => {
  const { t } = useTranslation('alertMutes');
  const [valuePlaceholder, setValuePlaceholder] = useState<string>('');
  const [funcCur, setfuncCur] = useState('==');

  useEffect(() => {
    const tags = form.getFieldValue('tags');
    funcChange(tags[field.name].func);
  }, [field]);

  const funcChange = (val) => {
    let text = '';
    if (val === 'in') {
      text = t('tag.value.placeholder1');
    } else if (val === '=~') {
      text = t('tag.value.placeholder2');
    }
    setfuncCur(val);
    setValuePlaceholder(text);
  };
  return (
    <>
      <Row gutter={[10, 10]} style={{ marginBottom: '10px' }}>
        <Col span={5}>
          <Form.Item style={{ marginBottom: 0 }} name={[field.name, 'key']} fieldKey={[field.name, 'key']} rules={[{ required: true, message: t('tag.key.msg') }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={3}>
          <Form.Item style={{ marginBottom: 0 }} name={[field.name, 'func']} fieldKey={[field.name, 'func']} initialValue='=='>
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
          <Form.Item style={{ marginBottom: 0 }} name={[field.name, 'value']} fieldKey={[field.name, 'value']} rules={[{ required: true, message: t('tag.value.msg') }]}>
            {['not in', 'in'].includes(funcCur) ? (
              <Select mode='tags' open={false} style={{ width: '100%' }} placeholder={t(valuePlaceholder)} tokenSeparators={[' ']}></Select>
            ) : (
              <Input className='ant-input' placeholder={t(valuePlaceholder)} />
            )}
          </Form.Item>
        </Col>
        {count > 1 && (
          <Col>
            <MinusCircleOutlined style={{ marginTop: '8px' }} onClick={() => remove(field.name)} />
          </Col>
        )}
      </Row>
    </>
  );
};

export default TagItem;
