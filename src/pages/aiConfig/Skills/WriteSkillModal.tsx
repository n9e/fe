import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { AISkill, addAISkill, updateAISkill } from './services';

interface Props {
  visible: boolean;
  data?: AISkill;
  onClose: () => void;
  onOk: () => void;
}

export default function WriteSkillModal({ visible, data, onClose, onOk }: Props) {
  const { t } = useTranslation('aiConfig');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEdit = !!data;

  useEffect(() => {
    if (visible && data) {
      form.setFieldsValue(data);
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, data]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (isEdit && data) {
        await updateAISkill(data.id, values);
      } else {
        await addAISkill(values);
      }
      message.success(isEdit ? 'Updated' : 'Created');
      onOk();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? t('skill.edit') : t('skill.write')}
      visible={visible}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnClose
      width={640}
    >
      <Form form={form} layout='vertical'>
        <Form.Item name='name' label={t('skill.name')} rules={[{ required: true }]}>
          <Input placeholder={t('skill.name_placeholder')} disabled={isEdit && data?.is_builtin === 1} />
        </Form.Item>
        <Form.Item name='description' label={t('skill.description')}>
          <Input.TextArea rows={3} placeholder={t('skill.description_placeholder')} />
        </Form.Item>
        <Form.Item name='instructions' label={t('skill.instructions')} rules={[{ required: true }]}>
          <Input.TextArea rows={10} placeholder={t('skill.instructions_placeholder')} style={{ fontFamily: 'Monaco, Menlo, monospace', fontSize: 13 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
