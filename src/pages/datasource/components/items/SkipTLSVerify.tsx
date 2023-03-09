import React from 'react';
import { Space, Form, Switch } from 'antd';
import { useTranslation } from 'react-i18next';

export default function SkipTLSVerify() {
  const { t } = useTranslation('datasourceManage');
  return (
    <Space className='mb8'>
      <span>{t('form.skip_ssl_verify')}</span>
      <Form.Item name={['http', `tls`, 'skip_tls_verify']} valuePropName='checked' noStyle>
        <Switch />
      </Form.Item>
    </Space>
  );
}
