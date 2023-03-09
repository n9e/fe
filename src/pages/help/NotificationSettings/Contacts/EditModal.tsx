import React from 'react';
import { Modal, Form, Input, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { ChannelType } from '../types';

interface IProps {
  initialValues?: ChannelType;
  onOk: (values: ChannelType) => void;
}

function EditModal(props: ModalWrapProps & IProps) {
  const { t } = useTranslation('notificationSettings');
  const { visible, destroy, initialValues } = props;
  const [form] = Form.useForm();

  return (
    <Modal
      title={t('contacts.edit_title')}
      visible={visible}
      onCancel={destroy}
      onOk={() => {
        form.validateFields().then((values) => {
          props.onOk(values);
          destroy();
        });
      }}
    >
      <Form layout='vertical' form={form} initialValues={initialValues}>
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
          ]}
        >
          <Input disabled={initialValues?.built_in} />
        </Form.Item>
        <Form.Item label={t('channels.hide')} name='hide' valuePropName='checked'>
          <Switch />
        </Form.Item>
        <Form.Item name='built_in' hidden noStyle initialValue={false}>
          <div />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC<IProps>(EditModal);
