import React, { useEffect } from 'react';
import { Modal, Input, Form, Button, message } from 'antd';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { NotifyTplsType } from './types';
import { putNotifyTpl } from './services';

interface IProps {
  data: NotifyTplsType;
  onOk: () => void;
}

function FormModal(props: IProps & ModalWrapProps) {
  const { visible, destroy, onOk, data } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      ...data,
      hide_contact: data.hide_contact === 1,
      hide_channel: data.hide_channel === 1,
    });
  }, []);

  return (
    <Modal
      className='dashboard-import-modal'
      title='编辑通知模板'
      visible={visible}
      onCancel={() => {
        destroy();
      }}
      footer={null}
    >
      <Form layout='vertical' form={form}>
        <Form.Item name='id' hidden>
          <div />
        </Form.Item>
        <Form.Item name='content' hidden>
          <div />
        </Form.Item>
        <Form.Item
          label='名称'
          name='name'
          rules={[
            {
              required: true,
              message: '请输入名称',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label='标识' name='channel'>
          <Input disabled />
        </Form.Item>
        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            onClick={() => {
              form.validateFields().then((values) => {
                putNotifyTpl({
                  ...values,
                  hide_contact: values.hide_contact ? 1 : 0,
                  hide_channel: values.hide_channel ? 1 : 0,
                }).then(() => {
                  message.success('保存成功');
                  onOk();
                  destroy();
                });
              });
            }}
          >
            保存
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC<IProps>(FormModal);
