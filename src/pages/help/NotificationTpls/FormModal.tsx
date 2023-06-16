import React, { useEffect } from 'react';
import { Modal, Input, Form, Button, message } from 'antd';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { NotifyTplsType } from './types';
import { putNotifyTpl, postNotifyTpl } from './services';

interface IProps {
  mode: 'post' | 'update';
  data?: NotifyTplsType;
  onOk: () => void;
}

const titleMap = {
  post: '新增通知模板',
  update: '编辑通知模板',
};

function FormModal(props: IProps & ModalWrapProps) {
  const { mode, visible, destroy, onOk, data = {} as NotifyTplsType } = props;
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
      title={titleMap[mode]}
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
          <Input disabled={mode === 'update'} />
        </Form.Item>
        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            onClick={() => {
              form.validateFields().then((values) => {
                mode === 'post'
                  ? postNotifyTpl(values).then(() => {
                      message.success('新增成功');
                      onOk();
                      destroy();
                    })
                  : putNotifyTpl({
                      ...values,
                      hide_contact: values.hide_contact ? 1 : 0,
                      hide_channel: values.hide_channel ? 1 : 0,
                    }).then((res) => {
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
