import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Modal, Button, Form, Input } from 'antd';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';

interface IProps {
  title: React.ReactNode;
  onOk: (data: string) => void;
}

function Import(props: IProps & ModalWrapProps) {
  const { t } = useTranslation();
  const { visible, destroy, title } = props;
  const [form] = Form.useForm();

  return (
    <Modal
      title={title}
      visible={visible}
      onCancel={() => {
        destroy();
      }}
      footer={[
        <Button
          type='primary'
          key='import'
          onClick={() => {
            form.validateFields().then((vals) => {
              props.onOk(vals.value);
              destroy();
            });
          }}
        >
          {t('common:btn.import')}
        </Button>,
      ]}
    >
      <Form form={form}>
        <Form.Item name='value'>
          <Input.TextArea rows={15} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC(Import);
