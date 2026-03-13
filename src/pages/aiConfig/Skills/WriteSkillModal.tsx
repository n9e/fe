import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Space, message } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
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
      const metadataList = data.metadata
        ? Object.entries(data.metadata).map(([key, value]) => ({ key, value }))
        : [];
      form.setFieldsValue({ ...data, metadata_list: metadataList });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, data]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Convert metadata_list array to Record<string, string>
      const metadataList: { key: string; value: string }[] = values.metadata_list || [];
      const metadata: Record<string, string> = {};
      metadataList.forEach((item: { key: string; value: string }) => {
        if (item.key) {
          metadata[item.key] = item.value || '';
        }
      });

      const payload = {
        ...values,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      };
      delete payload.metadata_list;

      if (isEdit && data) {
        await updateAISkill(data.id, payload);
      } else {
        await addAISkill(payload);
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
        <Form.Item name='license' label={t('skill.license')}>
          <Input placeholder={t('skill.license_placeholder')} />
        </Form.Item>
        <Form.Item name='compatibility' label={t('skill.compatibility')}>
          <Input placeholder={t('skill.compatibility_placeholder')} />
        </Form.Item>
        <Form.Item name='allowed_tools' label={t('skill.allowed_tools')}>
          <Input placeholder={t('skill.allowed_tools_placeholder')} />
        </Form.Item>

        {/* Metadata key-value pairs */}
        <Form.Item label={t('skill.metadata')}>
          <Form.List name='metadata_list'>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align='baseline'>
                    <Form.Item {...restField} name={[name, 'key']} rules={[{ required: true, message: '' }]} style={{ marginBottom: 0 }}>
                      <Input placeholder={t('skill.metadata_key')} style={{ width: 200 }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'value']} style={{ marginBottom: 0 }}>
                      <Input placeholder={t('skill.metadata_value')} style={{ width: 300 }} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                  {t('skill.add_metadata')}
                </Button>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    </Modal>
  );
}
