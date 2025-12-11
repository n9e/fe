import React from 'react';
import { Row, Col, Form, Input, InputNumber, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import DateField from '../DateField';

export default function index({ prefixField = {}, prefixNameField = [], datasourceValue }: { prefixField: any; prefixNameField: any[]; datasourceValue: number }) {
  const { t } = useTranslation('datasource');
  const indexType = Form.useWatch(['targets', prefixField.name, 'query', 'index_type']);

  return (
    <>
      <Row gutter={10}>
        <Col span={16}>
          <div style={{ marginBottom: 8 }}>{t('datasource:es.time_label')}</div>
        </Col>
      </Row>

      <Row gutter={10} className='mb-2'>
        {indexType === 'index' && (
          <Col span={8}>
            <Form.Item shouldUpdate noStyle>
              {({ getFieldValue }) => {
                const index = getFieldValue(['targets', ...prefixNameField, 'query', 'index']);
                return <DateField datasourceValue={datasourceValue} index={index} prefixField={prefixField} prefixNames={[...prefixNameField, 'query']} />;
              }}
            </Form.Item>
          </Col>
        )}
        <Col span={8}>
          <Input.Group>
            <span className='ant-input-group-addon'>{t('datasource:es.interval')}</span>
            <Form.Item {...prefixField} name={[...prefixNameField, 'query', 'interval']} noStyle>
              <InputNumber style={{ width: '100%' }} placeholder='auto' />
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
