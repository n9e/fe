import React from 'react';
import { Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

export default function Constant() {
  const { t } = useTranslation('dashboard');

  return (
    <Form.Item label={t('var.constant.definition')} name='definition' tooltip={t('var.constant.defaultValue_tip')} rules={[{ required: true }]}>
      <Input />
    </Form.Item>
  );
}
