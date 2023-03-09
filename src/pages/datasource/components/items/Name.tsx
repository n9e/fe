import React from 'react';
import { Input, Form } from 'antd';
import { useTranslation } from 'react-i18next';

const FormItem = Form.Item;

export default function Name() {
  const { t } = useTranslation('datasourceManage');
  return (
    <div>
      <div className='page-title'>{t('name')}</div>
      <FormItem
        label={t('form.name')}
        name='name'
        rules={[{ required: true }, { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: t('form.name_msg') }, { min: 3, message: t('form.name_msg2') }]}
      >
        <Input />
      </FormItem>
    </div>
  );
}
