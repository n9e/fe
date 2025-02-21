import React from 'react';
import _ from 'lodash';
import { Form, Button, Space, message } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { useTranslation } from 'react-i18next';

import { CN, NS } from '../../../constants';
import { putItem, Item } from '../../../services';
import ContentKeyFormModal from './ContentKeyFormModal';
import ContentItem from './ContentItem';

interface Props {
  form: FormInstance<any>;
  item?: Item & {
    notify_channel_request_type?: string;
  };
}

export default function FormCpt(props: Props) {
  const { t } = useTranslation(NS);
  const { form, item } = props;

  return (
    <>
      <div className={`${CN}-main-content-wrapper`}>
        <Form form={form} layout='vertical'>
          <Form.List name='content'>
            {(fields, { add, remove }) => (
              <div className={`${CN}-main-content`}>
                {fields.map((field) => {
                  return <ContentItem key={field.key} field={field} remove={remove} notify_channel_request_type={item?.notify_channel_request_type} />;
                })}
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
                if (item) {
                  putItem({
                    ..._.omit(item, ['notify_channel_request_type']),
                    content: _.fromPairs(_.map(values.content, (item) => [item.key, item.value])),
                  }).then(() => {
                    message.success(t('common:success.save'));
                  });
                }
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
