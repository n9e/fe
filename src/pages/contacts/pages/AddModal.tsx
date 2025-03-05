import React from 'react';
import { Modal, Form, Input, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';

import { ContactType } from '../types';
import { NS } from '../constants';

interface IProps {
  idents: string[];
  onOk: (values: ContactType) => void;
}

function AddModal(props: ModalWrapProps & IProps) {
  const { t } = useTranslation(NS);
  const { visible, destroy, idents, onOk } = props;
  const [form] = Form.useForm();

  return (
    <Modal
      title={t('add_title')}
      visible={visible}
      onCancel={destroy}
      onOk={() => {
        form.validateFields().then((values) => {
          const hide = !values.enabled;
          props.onOk({
            ..._.omit(values, 'enabled'),
            hide,
          } as ContactType);
          destroy();
        });
      }}
    >
      <Form layout='vertical' form={form}>
        <Form.Item
          label={t('common:table.name')}
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
          label={t('common:table.ident')}
          name='ident'
          rules={[
            {
              required: true,
            },
            {
              pattern: /^[a-zA-Z0-9_-]+$/,
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
        <Form.Item label={t('common:table.enabled')} name='enabled' valuePropName='checked' initialValue={true}>
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
