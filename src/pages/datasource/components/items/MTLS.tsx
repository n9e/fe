import React from 'react';
import { Form, Input } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';

import trimValidator from '../../utils/trimValidator';

interface Props {
  field?: FormListFieldData;
  namePath?: (string | number)[];
  prefixNamePath?: (string | number)[];
}

export default function MTLS(props: Props) {
  const { t } = useTranslation('datasourceManage');
  const { field, namePath = [] } = props;

  return (
    <>
      <Form.Item label={t('mtls.ca_cert')} {...field} name={[...namePath, 'ca_cert']} rules={[trimValidator()]}>
        <Input.TextArea rows={7} placeholder='Begins with -----BEGIN CERTIFICATE-----' />
      </Form.Item>
      <Form.Item label={t('mtls.server_name')} {...field} name={[...namePath, 'server_name']} rules={[trimValidator()]}>
        <Input placeholder='domain.example.com' />
      </Form.Item>
      <Form.Item label={t('mtls.client_cert')} {...field} name={[...namePath, 'client_cert']} rules={[trimValidator()]}>
        <Input.TextArea rows={7} placeholder='Begins with -----BEGIN CERTIFICATE-----' />
      </Form.Item>
      <Form.Item label={t('mtls.client_key')} {...field} name={[...namePath, 'client_key']} rules={[trimValidator()]}>
        <Input.TextArea rows={7} placeholder='Begins with -----BEGIN RSA PRIVATE KEY-----' />
      </Form.Item>
    </>
  );
}
