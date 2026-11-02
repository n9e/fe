import React from 'react';
import { Form } from 'antd';
import { useTranslation } from 'react-i18next';

import TrimInput from '@/components/TrimInput';
import { IS_PLUS } from '@/utils/constant';

const FormItem = Form.Item;

export default function Name() {
  const { t } = useTranslation('datasourceManage');
  return (
    <div>
      <div className='page-title'>{t('name')}</div>
      <FormItem label={t('form.name')} name='name' rules={[{ required: true }, { min: 3, message: t('form.name_msg2') }]}>
        <TrimInput />
      </FormItem>
      {IS_PLUS && (
        <FormItem label={t('form.identifier')} name='identifier'>
          <TrimInput />
        </FormItem>
      )}
    </div>
  );
}
