import React, { useEffect } from 'react';
import { Modal, Input, Form, Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { NotifyTplsType } from './types';
import { putNotifyTpl, postNotifyTpl } from './services';

interface IProps {
  mode: 'post' | 'update';
  data?: NotifyTplsType;
  onOk: () => void;
}

function FormModal(props: IProps & ModalWrapProps) {
  const { t } = useTranslation('notificationTpls');
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
      title={t(`${mode}_title`)}
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
          label={t('name')}
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
          label={t('channel')}
          name='channel'
          rules={[
            {
              required: true,
            },
          ]}
        >
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
                      message.success(t('common:success.add'));
                      onOk();
                      destroy();
                    })
                  : putNotifyTpl({
                      ...values,
                      hide_contact: values.hide_contact ? 1 : 0,
                      hide_channel: values.hide_channel ? 1 : 0,
                    }).then((res) => {
                      message.success(t('common:success.save'));
                      onOk();
                      destroy();
                    });
              });
            }}
          >
            {t('common:btn.save')}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC<IProps>(FormModal);
