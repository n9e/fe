import React from 'react';
import { Input, Form, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';

interface IProps {
  urlExtra?: React.ReactNode;
}

const FormItem = Form.Item;

export default function HTTP(props: IProps) {
  const { t } = useTranslation('datasourceManage');
  const { urlExtra } = props;

  return (
    <div>
      <div className='page-title'>HTTP</div>
      <FormItem
        label='URL'
        name={['http', 'url']}
        rules={[
          { required: true },
          {
            validator: (_, value) => (!value.includes(' ') ? Promise.resolve() : Promise.reject(new Error(t('form.url_no_spaces_msg')))),
          },
        ]}
      >
        <Input placeholder='http://localhost:9090' />
      </FormItem>
      {urlExtra}
      <FormItem label={t('form.timeout')} name={['http', 'timeout']} rules={[{ type: 'number', min: 0 }]} initialValue={10000}>
        <InputNumber style={{ width: '100%' }} controls={false} />
      </FormItem>
    </div>
  );
}
