import { Form, Modal, Select } from 'antd';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { Input } from 'antd';

export interface Values {
  id: number;
  dashboard_id: number;
  panel_id: string;
  tags: string[];
  text: string;
  time_start: number;
  time_end: number;
}

interface Props {
  action: 'add' | 'edit';
  visible: boolean;
  onOk: (values: Values) => void;
  onCancel: () => void;
  initialValues: Values;
}

const format = 'YYYY-MM-DD HH:mm:ss';

export default function FormModal(props: Props) {
  const { t } = useTranslation('dashboard');
  const { action, visible, onOk, onCancel, initialValues } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(initialValues);
    }
  }, [visible]);

  return (
    <Modal
      closable={false}
      title={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {t(`annotation.${action}`)}
          <span>
            {moment.unix(initialValues.time_start).format(format)}
            {initialValues.time_start !== initialValues.time_end ? ` - ${moment.unix(initialValues.time_end).format(format)}` : ''}
          </span>
        </div>
      }
      visible={visible}
      onOk={() => {
        form.validateFields().then((values) => {
          onOk(values);
        });
      }}
      onCancel={() => {
        onCancel();
      }}
      destroyOnClose
    >
      <Form layout='vertical' preserve={false} form={form}>
        <Form.Item name='id' hidden>
          <Input />
        </Form.Item>
        <Form.Item name='dashboard_id' hidden>
          <Input />
        </Form.Item>
        <Form.Item name='panel_id' hidden>
          <Input />
        </Form.Item>
        <Form.Item name='time_start' hidden>
          <Input />
        </Form.Item>
        <Form.Item name='time_end' hidden>
          <Input />
        </Form.Item>
        <Form.Item label={t('annotation.description')} name='description' rules={[{ required: true }]}>
          <Input.TextArea />
        </Form.Item>
        <Form.Item label={t('annotation.tags')} name='tags'>
          <Select mode='tags' tokenSeparators={[' ']} open={false} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
