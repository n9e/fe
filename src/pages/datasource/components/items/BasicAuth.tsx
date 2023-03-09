import React from 'react';
import { Input, Form, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';

export default function BasicAuth() {
  const { t } = useTranslation('datasourceManage');
  return (
    <>
      <div className='page-title'>{t('form.auth')}</div>
      <Row gutter={16}>
        <Col flex={'1'}>
          <Form.Item label={t('form.username')} name={['auth', 'basic_auth_user']}>
            <Input autoComplete='off' />
          </Form.Item>
        </Col>
        <Col flex={'1'}>
          <Form.Item label={t('form.password')} name={['auth', 'basic_auth_password']}>
            <Input.Password autoComplete='new-password' />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
