import React from 'react';
import { Row, Col, Form, Input, InputNumber, Select } from 'antd';
import { useTranslation } from 'react-i18next';

export default function index({ prefixField = {}, prefixNameField = [] }: any) {
  const { t } = useTranslation('datasource');
  return (
    <>
      <div style={{ marginBottom: 8 }}>{t('datasource:es.time_label')}</div>
      <Row gutter={10}>
        <Col span={12}>
          <Form.Item
            {...prefixField}
            name={[...prefixNameField, 'query', 'date_field']}
            rules={[
              {
                required: true,
                message: t('datasource:es.date_field_msg'),
              },
            ]}
          >
            <Input placeholder={t('datasource:es.date_field')} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Input.Group>
            <span className='ant-input-group-addon'>{t('datasource:es.interval')}</span>
            <Form.Item {...prefixField} name={[...prefixNameField, 'query', 'interval']} noStyle>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <span className='ant-input-group-addon'>
              <Form.Item {...prefixField} name={[...prefixNameField, 'query', 'interval_unit']} noStyle initialValue='min'>
                <Select>
                  <Select.Option value='second'>{t('common:time.second')}</Select.Option>
                  <Select.Option value='min'>{t('common:time.minute')}</Select.Option>
                  <Select.Option value='hour'>{t('common:time.hour')}</Select.Option>
                </Select>
              </Form.Item>
            </span>
          </Input.Group>
        </Col>
      </Row>
    </>
  );
}
