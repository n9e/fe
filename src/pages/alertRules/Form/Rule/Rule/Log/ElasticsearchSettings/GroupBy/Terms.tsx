import React, { useState } from 'react';
import { Row, Col, Form, Select, Button, Input, InputNumber, AutoComplete } from 'antd';
import { VerticalRightOutlined, VerticalLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import _ from 'lodash';
import { groupByCates, groupByCatesMap } from './configs';

export default function Terms({ prefixField, fieldsOptions }) {
  const { t } = useTranslation('alertRules');
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <Row gutter={16}>
      <Col flex='auto'>
        <Row gutter={16}>
          <Col span={expanded ? 6 : 12}>
            <Form.Item {...prefixField} name={[prefixField.name, 'cate']} noStyle>
              <Select style={{ width: '100%' }}>
                {groupByCates.map((func) => (
                  <Select.Option key={func} value={func}>
                    {func} ({groupByCatesMap[func]})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={expanded ? 6 : 12}>
            <InputGroupWithFormItem label='Field key' labelWidth={80}>
              <Form.Item {...prefixField} name={[prefixField.name, 'field']} rules={[{ required: true, message: '必须填写 field key' }]}>
                <AutoComplete
                  options={_.filter(fieldsOptions, (item) => {
                    if (search) {
                      return item.value.includes(search);
                    }
                    return true;
                  })}
                  style={{ width: '100%' }}
                  onSearch={setSearch}
                />
              </Form.Item>
            </InputGroupWithFormItem>
          </Col>
          {expanded && (
            <>
              <Col span={6}>
                <Input.Group>
                  <span className='ant-input-group-addon'>{t('datasource:es.terms.size')}</span>
                  <Form.Item {...prefixField} name={[prefixField.name, 'size']} noStyle>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Input.Group>
              </Col>
              <Col span={6}>
                <Input.Group>
                  <span className='ant-input-group-addon'>{t('datasource:es.terms.min_value')}</span>
                  <Form.Item {...prefixField} name={[prefixField.name, 'min_value']} noStyle>
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Input.Group>
              </Col>
            </>
          )}
        </Row>
      </Col>
      <Col flex='88px'>
        <Button
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          {t('datasource:es.terms.more')} {expanded ? <VerticalLeftOutlined /> : <VerticalRightOutlined />}
        </Button>
      </Col>
    </Row>
  );
}
