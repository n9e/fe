import React from 'react';
import { Modal, Form, Input, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { ChannelType } from '../types';

interface IProps {
  idents: string[];
  onOk: (values: ChannelType) => void;
}

function AddModal(props: ModalWrapProps & IProps) {
  const { t } = useTranslation('notificationSettings');
  const { visible, destroy, idents, onOk } = props;
  const [form] = Form.useForm();

  return (
    <Modal
      title={t('channels.add_title')}
      visible={visible}
      onCancel={destroy}
      onOk={() => {
        form.validateFields().then((values) => {
          onOk(values);
          destroy();
        });
      }}
    >
      <Form layout='vertical' form={form}>
        <Form.Item
          label={t('channels.name')}
          name='name'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t('channels.ident')}
          name='ident'
          rules={[
            {
              required: true,
            },
            {
              pattern: /^[a-zA-Z0-9_-]+$/,
              message: t('channels.ident_msg1'),
            },
            {
              validator: async (_item, value) => {
                if (value && idents.includes(value)) {
                  return Promise.reject(new Error(t('channels.ident_msg2')));
                }
              },
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={t('channels.hide')} name='hide' valuePropName='checked' initialValue={false}>
          <Switch />
        </Form.Item>
        <Form.Item name='built_in' hidden noStyle initialValue={false}>
          <div />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC<IProps>(AddModal);
