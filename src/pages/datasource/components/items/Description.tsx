import React from 'react';
import { Input, Form } from 'antd';
import { useTranslation } from 'react-i18next';

const FormItem = Form.Item;

export default function Description() {
  const { t } = useTranslation('datasourceManage');
  return (
    <div>
      <div className='page-title' style={{ marginTop: '8px' }}>
        {t('form.description')}
      </div>
      <FormItem name='description' rules={[]}>
        <Input.TextArea rows={4} showCount maxLength={500} />
      </FormItem>
    </div>
  );
}
