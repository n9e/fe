import React from 'react';
import { Input, Form, Row, Col, Switch } from 'antd';
import { useTranslation } from 'react-i18next';

interface Props {
  cate: string;
  showAuthEnable?: boolean;
  showTls?: boolean;
}

export default function BasicAuth(props: Props) {
  const { t } = useTranslation('datasourceManage');
  const { cate, showAuthEnable, showTls } = props;
  const authEnable = Form.useWatch(['settings', `${cate}.basic`, `${cate}.auth.enable`]);

  return (
    <>
      <div className='page-title'>{t('form.auth')}</div>
      {showAuthEnable && (
        <div className='mb-2'>
          <span className='mr-2'>{t('auth_enable')}</span>
          <Form.Item name={['settings', `${cate}.basic`, `${cate}.auth.enable`]} initialValue={true} valuePropName='checked' noStyle>
            <Switch size='small' />
          </Form.Item>
        </div>
      )}
      <Form.Item name={['settings', `${cate}.basic`, `${cate}.is_encrypt`]} hidden initialValue={false}>
        <div />
      </Form.Item>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label={t('form.username')} name={['settings', `${cate}.basic`, `${cate}.user`]} rules={[{ required: authEnable }]}>
            <Input autoComplete='off' />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('form.password')} name={['settings', `${cate}.basic`, `${cate}.password`]} rules={[{ required: authEnable }]}>
            <Input.Password autoComplete='new-password' />
          </Form.Item>
        </Col>
      </Row>
      {showTls && (
        <div className='mb-2'>
          <span className='mr-2'>{t('skip_tls_verify')}</span>
          <Form.Item name={['settings', `${cate}.tls`, `${cate}.tls.skip_tls_verify`]} valuePropName='checked' noStyle>
            <Switch size='small' />
          </Form.Item>
        </div>
      )}
    </>
  );
}
