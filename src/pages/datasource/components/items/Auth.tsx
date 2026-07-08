import React from 'react';
import { Col, Form, Input, Row } from 'antd';
import { useTranslation } from 'react-i18next';

export default function Auth({ namePrefix, type }) {
  const { t } = useTranslation('datasourceManage');
  return (
    <>
      <div className='page-title'>{t('form.auth')}</div>
      <Row gutter={16}>
        <Col flex={'1'}>
          <Form.Item label='AccessKey ID' name={[...namePrefix, `${type}.access_key_id`]} rules={[{ required: true }]}>
            <Input placeholder={t('form.access_key_id_placeholder')} />
          </Form.Item>
        </Col>
        <Col flex={'1'}>
          <Form.Item label='AccessKey Secret' name={[...namePrefix, `${type}.access_key_secret`]} rules={[{ required: true }]}>
            <Input placeholder={t('form.access_key_secret_placeholder')} />
          </Form.Item>
        </Col>
        <Col>
          <div style={{ width: '30px' }}></div>
        </Col>
      </Row>
    </>
  );
}
