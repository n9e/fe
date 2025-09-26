import React from 'react';
import { Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

export default function Textbox() {
  const { t } = useTranslation('dashboard');

  return (
    <Form.Item label={t('var.textbox.defaultValue')} name='defaultValue'>
      <Input />
    </Form.Item>
  );
}
