import React from 'react';
import _ from 'lodash';
import { Form, Button, Space } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { useTranslation } from 'react-i18next';

import { CN, NS } from '../../../constants';
import ContentKeyFormModal from './ContentKeyFormModal';
import ContentItem from './ContentItem';

interface Props {
  form: FormInstance<any>;
  notify_channel_request_type?: string;
}

export default function FormCpt(props: Props) {
  const { t } = useTranslation(NS);
  const { form, notify_channel_request_type } = props;

  return (
    <>
      <div className={`${CN}-main-content-wrapper`}>
        <Form form={form} layout='vertical'>
          <Form.List name='content'>
            {(fields, { add, remove }) => (
              <div className={`${CN}-main-content`}>
                <Button
                  className='mb2'
                  type='dashed'
                  onClick={() => {
                    ContentKeyFormModal({
                      mode: 'add',
                      onOk: (contentKey) => {
                        add({
                          key: contentKey,
                        });
                      },
                    });
                  }}
                >
                  {t('content.add_title')}
                </Button>
                {fields.map((field) => {
                  return <ContentItem key={field.key} field={field} remove={remove} notify_channel_request_type={notify_channel_request_type} />;
                })}
              </div>
            )}
          </Form.List>
        </Form>
      </div>
      <div>
        <Space>
          <Button
            type='primary'
            onClick={() => {
              form.validateFields().then((values) => {
                console.log(values);
              });
            }}
          >
            {t('common:btn.save')}
          </Button>
          <Button>{t('content.preview')}</Button>
        </Space>
      </div>
    </>
  );
}
