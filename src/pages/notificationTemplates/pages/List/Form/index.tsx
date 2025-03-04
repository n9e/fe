import React from 'react';
import _ from 'lodash';
import { Form, Button, Space, message } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { useTranslation } from 'react-i18next';

import { CN, NS } from '../../../constants';
import { putItem, Item } from '../../../services';
import ContentKeyFormModal from './ContentKeyFormModal';
import ContentItem from './ContentItem';
import PreviewModal from './PreviewModal';

interface Props {
  form: FormInstance<any>;
  item?: Item & {
    notify_channel_request_type?: string;
  };
  contentRef: React.MutableRefObject<
    | {
        key: string;
        value?: string;
      }[]
    | undefined
  >;
}

export default function FormCpt(props: Props) {
  const { t } = useTranslation(NS);
  const { form, item, contentRef } = props;
  const [previewModalVisible, setPreviewModalVisible] = React.useState(false);
  const content = Form.useWatch(['content'], form);

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
                {item?.notify_channel_request_type !== 'smtp' && (
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
                )}
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
                    contentRef.current = values.content;
                    message.success(t('common:success.save'));
                  });
                }
              });
            }}
          >
            {t('common:btn.save')}
          </Button>
          <Button
            onClick={() => {
              setPreviewModalVisible(true);
            }}
          >
            {t('content.preview')}
          </Button>
        </Space>
      </div>
      <PreviewModal
        visible={previewModalVisible}
        setVisible={setPreviewModalVisible}
        content={_.fromPairs(_.map(content, (item) => [item.key, item.value]))}
        notify_channel_request_type={item?.notify_channel_request_type}
      />
    </>
  );
}
