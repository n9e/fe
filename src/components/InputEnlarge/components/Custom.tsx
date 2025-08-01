import React from 'react';
import { Form, Input, Space, Tag } from 'antd';
import { useTranslation, Trans } from 'react-i18next';
import Vars from './Vars';

export default function Custom({ vars }: { vars: string[] }) {
  const { t } = useTranslation('inputEnlarge');
  const form = Form.useFormInstance();
  const handleClickVar = (item: string) => {
    const value = form.getFieldValue(['custom', 'url']) || '';
    form.setFields([
      {
        name: ['custom', 'url'],
        value: value + '$' + item,
      },
    ]);
  };
  return (
    <div>
      <Form.Item
        name={['custom', 'url']}
        label={t('请输入地址')}
        initialValue={'$local_url'}
        tooltip={{
          title: <Trans ns='inputEnlarge' i18nKey={'customTip'} components={{ 1: <br />, 2: <span style={{ width: '20px', display: 'inline-block' }} /> }} />,
          overlayStyle: { minWidth: 400 },
        }}
        rules={[{ required: true, message: t('请输入') }]}
      >
        <Input />
      </Form.Item>
      <Vars vars={vars} handleClickVar={handleClickVar} />
    </div>
  );
}
