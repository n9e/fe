import React from 'react';
import { Input, Form, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';

const FormItem = Form.Item;

export default function HTTP() {
  const { t } = useTranslation('datasourceManage');
  return (
    <div>
      <div className='page-title'>HTTP</div>
      <FormItem label='URL' name={['http', 'url']} rules={[{ required: true }]}>
        <Input placeholder='http://localhost:9090' />
      </FormItem>
      <FormItem label={t('form.timeout')} name={['http', 'timeout']} rules={[{ type: 'number', min: 0 }]} initialValue={10000}>
        <InputNumber style={{ width: '100%' }} controls={false} />
      </FormItem>
    </div>
  );
}
