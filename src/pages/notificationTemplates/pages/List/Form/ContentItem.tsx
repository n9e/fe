import React from 'react';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { Form } from 'antd';
import { MinusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { CN, NS } from '../../../constants';
import Text from '../Editor/Text';
import HTML from '../Editor/HTML';
import Markdown from '../Editor/Markdown';
import ContentItemKey from './ContentItemKey';

interface Props {
  field: FormListFieldData;
  remove: (name: number) => void;
  notify_channel_request_type?: string;
}

export default function ContentItem(props: Props) {
  const { t } = useTranslation(NS);
  const { field, remove, notify_channel_request_type } = props;
  const fieldKey = Form.useWatch(['content', field.name, 'key']);

  return (
    <div className={`${CN}-main-content-item`}>
      {notify_channel_request_type === 'smtp' ? (
        <>
          {fieldKey === 'content' && (
            <Form.Item {...field} name={[field.name, 'value']}>
              <HTML
                label={
                  <Form.Item {...field} name={[field.name, 'key']}>
                    <ContentItemKey hideEdit />
                  </Form.Item>
                }
              />
            </Form.Item>
          )}
          {fieldKey === 'subject' && (
            <Form.Item {...field} name={[field.name, 'value']}>
              <Text
                label={
                  <Form.Item {...field} name={[field.name, 'key']}>
                    <ContentItemKey hideEdit />
                  </Form.Item>
                }
              />
            </Form.Item>
          )}
        </>
      ) : (
        <Form.Item {...field} name={[field.name, 'value']} rules={[{ required: true, message: t('content.value_msg') }]}>
          <Markdown
            label={
              <Form.Item {...field} name={[field.name, 'key']}>
                <ContentItemKey />
              </Form.Item>
            }
            extra={
              <MinusCircleOutlined
                onClick={() => {
                  remove(field.name);
                }}
              />
            }
          />
        </Form.Item>
      )}
    </div>
  );
}
