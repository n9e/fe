import React, { useEffect, useState } from 'react';
import { Drawer, Form, Input, Select, Switch, Space, Button, Tag, Tooltip, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { AIAgent, addAgent, updateAgent } from './services';
import { getLLMConfigs, AILLMConfig } from '../LLMConfigs/services';

interface Props {
  visible: boolean;
  data?: AIAgent;
  onClose: () => void;
  onOk: () => void;
}

export default function AgentDrawer({ visible, data, onClose, onOk }: Props) {
  const { t } = useTranslation('aiConfig');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [llmConfigs, setLLMConfigs] = useState<AILLMConfig[]>([]);
  const isEdit = !!data;

  useEffect(() => {
    if (visible) {
      getLLMConfigs().then((configs) => setLLMConfigs(configs));
    }
  }, [visible]);

  useEffect(() => {
    if (visible && data) {
      form.setFieldsValue({
        ...data,
        enabled: data.enabled === 1,
        use_case: data.use_case || undefined,
        llm_config_id: data.llm_config_id || undefined,
      });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({ enabled: true, use_case: 'chat' });
    }
  }, [visible, data]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        name: values.name,
        description: values.description || '',
        use_case: values.use_case || '',
        llm_config_id: values.llm_config_id || 0,
        enabled: values.enabled ? 1 : 0,
      };

      if (isEdit && data) {
        await updateAgent(data.id, payload);
      } else {
        await addAgent(payload);
      }
      message.success(isEdit ? 'Updated' : 'Created');
      onOk();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={isEdit ? t('agent.edit') : t('agent.add')}
      visible={visible}
      onClose={onClose}
      destroyOnClose
      width={600}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Button onClick={onClose}>{t('common:btn.cancel')}</Button>
            <Button type='primary' onClick={handleOk} loading={loading}>
              {t('common:btn.save')}
            </Button>
          </Space>
        </div>
      }
    >
      <Form form={form} layout='vertical'>
        {/* Basic Info */}
        <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 14 }}>{t('agent.basic_info')}</div>
        <Form.Item name='name' label={t('agent.name')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name='description' label={t('agent.description')}>
          <Input.TextArea rows={2} placeholder={t('agent.description_placeholder')} />
        </Form.Item>
        <Form.Item name='use_case' label={t('agent.use_case')} rules={[{ required: true }]}>
          <Select>
            <Select.Option value='chat'>{t('agent.use_case_options.chat')}</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name='enabled' label={t('agent.enabled')} valuePropName='checked'>
          <Switch />
        </Form.Item>

        {/* LLM Configuration - Dropdown */}
        <div style={{ marginBottom: 8, marginTop: 8, fontWeight: 600, fontSize: 14 }}>{t('agent.llm_config')}</div>
        <Form.Item name='llm_config_id' label={t('agent.llm_select')} rules={[{ required: true, message: t('agent.llm_select_required') }]}>
          <Select placeholder={t('agent.llm_select_placeholder')} allowClear showSearch optionFilterProp='children'>
            {llmConfigs
              .filter((c) => c.enabled === 1)
              .map((config) => (
                <Select.Option key={config.id} value={config.id}>
                  {config.name} ({t(`llm.api_type_options.${config.api_type}` as any)} / {config.model})
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        {/* Phase 2: Skill / MCP / IM references */}
        <div style={{ marginBottom: 8, marginTop: 16, fontWeight: 600, fontSize: 14 }}>
          {t('agent.extensions')}
          <Tag style={{ marginLeft: 8 }}>{t('agent.coming_soon')}</Tag>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Tooltip title={t('agent.coming_soon')}>
            <Button disabled style={{ flex: 1 }}>
              + Skill
            </Button>
          </Tooltip>
          <Tooltip title={t('agent.coming_soon')}>
            <Button disabled style={{ flex: 1 }}>
              + MCP
            </Button>
          </Tooltip>
          <Tooltip title={t('agent.coming_soon')}>
            <Button disabled style={{ flex: 1 }}>
              + IM
            </Button>
          </Tooltip>
        </div>
      </Form>
    </Drawer>
  );
}
