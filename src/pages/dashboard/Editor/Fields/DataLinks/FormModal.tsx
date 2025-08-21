import React, { useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Form, Modal, Input, Switch } from 'antd';
import _ from 'lodash';

import { LinksItem } from '@/pages/dashboard/types';

export interface ModalState {
  visible: boolean;
  action: 'add' | 'edit';
  fieldName: number;
  data?: LinksItem;
}

interface Props {
  modalState: ModalState;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  onOk: (data: ModalState['data']) => void;
}

export default function FormModal(props: Props) {
  const { t } = useTranslation('dashboard');
  const { modalState, setModalState, onOk } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    if (modalState.visible) {
      form.setFieldsValue(modalState.data);
    } else {
      form.resetFields();
    }
  }, [modalState.visible]);

  return (
    <Modal
      destroyOnClose
      title={t(`panel.options.links.${modalState.action}_btn`)}
      visible={modalState.visible}
      onCancel={() => {
        setModalState({ ...modalState, visible: false });
      }}
      onOk={() => {
        form.validateFields().then((values) => {
          setModalState({ ...modalState, visible: false });
          onOk(values);
        });
      }}
    >
      <Form layout='vertical' form={form}>
        <Form.Item label={t('panel.options.links.title')} name='title' rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label={t('panel.options.links.url')}
          name='url'
          rules={[{ required: true }]}
          tooltip={{
            overlayInnerStyle: { width: 330 },
            title: <Trans ns='dashboard' i18nKey='dashboard:var.help_tip_table_ng' components={{ br: <br /> }} />,
          }}
        >
          <Input />
        </Form.Item>
        <Form.Item label={t('panel.options.links.target_blank')} name='targetBlank' valuePropName='checked'>
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
