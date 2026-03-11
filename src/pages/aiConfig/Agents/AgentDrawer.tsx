import React, { useEffect, useState } from 'react';
import { Drawer, Form, Input, Select, Switch, Space, Button, Row, Col, Divider, Tooltip, message } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { AIAgent, addAgent, updateAgent } from './services';
import { getLLMConfigs, AILLMConfig } from '../LLMConfigs/services';
import { getAISkills, AISkill } from '../Skills/services';
import { getMCPServers, MCPServer } from '../MCPServers/services';
import LLMConfigDrawer from '../LLMConfigs/LLMConfigDrawer';

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
  const [skills, setSkills] = useState<AISkill[]>([]);
  const [mcpServers, setMCPServers] = useState<MCPServer[]>([]);
  const [llmDrawerVisible, setLLMDrawerVisible] = useState(false);
  const isEdit = !!data;

  useEffect(() => {
    if (visible) {
      getLLMConfigs().then((configs) => setLLMConfigs(configs));
      getAISkills().then((list) => setSkills(list));
      getMCPServers().then((list) => setMCPServers(list));
    }
  }, [visible]);

  useEffect(() => {
    if (visible && data) {
      form.setFieldsValue({
        ...data,
        enabled: data.enabled === 1,
        use_case: data.use_case || undefined,
        llm_config_id: data.llm_config_id || undefined,
        skill_ids: data.skill_ids || [],
        mcp_server_ids: data.mcp_server_ids || [],
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
        skill_ids: values.skill_ids || [],
        mcp_server_ids: values.mcp_server_ids || [],
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
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item name='name' label={t('agent.name')} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name='use_case'
              label={
                <Space size={4}>
                  {t('agent.use_case')}
                  <Tooltip title={t('agent.use_case_tip')}>
                    <QuestionCircleOutlined style={{ color: 'var(--fc-text-4)' }} />
                  </Tooltip>
                </Space>
              }
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value='chat'>{t('agent.use_case_options.chat')}</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name='description' label={t('agent.description')} style={{ marginBottom: 12 }}>
          <Input.TextArea rows={2} placeholder={t('agent.description_placeholder')} />
        </Form.Item>
        <Form.Item name='enabled' label={t('agent.enabled')} valuePropName='checked' style={{ marginBottom: 0 }}>
          <Switch />
        </Form.Item>

        <Divider style={{ margin: '16px 0' }} />

        <Form.Item
          name='llm_config_id'
          label={
            <Space>
              {t('agent.llm_select')}
              <a onClick={() => setLLMDrawerVisible(true)}>{t('agent.llm_add')}</a>
            </Space>
          }
          rules={[{ required: true, message: t('agent.llm_select_required') }]}
        >
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

        <Form.Item
          name='skill_ids'
          label={
            <Space size={4}>
              {t('agent.skill_ids')}
              <Tooltip title={t('agent.skill_ids_tip')}>
                <QuestionCircleOutlined style={{ color: 'var(--fc-text-4)' }} />
              </Tooltip>
            </Space>
          }
        >
          <Select mode='multiple' placeholder={t('agent.skill_select_placeholder')} allowClear showSearch optionFilterProp='children'>
            {skills
              .filter((s) => s.enabled === 1)
              .map((skill) => (
                <Select.Option key={skill.id} value={skill.id}>
                  {skill.name}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item
          name='mcp_server_ids'
          label={
            <Space size={4}>
              {t('agent.mcp_server_ids')}
              <Tooltip title={t('agent.mcp_server_ids_tip')}>
                <QuestionCircleOutlined style={{ color: 'var(--fc-text-4)' }} />
              </Tooltip>
            </Space>
          }
        >
          <Select mode='multiple' placeholder={t('agent.mcp_select_placeholder')} allowClear showSearch optionFilterProp='children'>
            {mcpServers
              .filter((s) => s.enabled === 1)
              .map((server) => (
                <Select.Option key={server.id} value={server.id}>
                  {server.name}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>
      </Form>
      <LLMConfigDrawer
        visible={llmDrawerVisible}
        onClose={() => setLLMDrawerVisible(false)}
        onOk={() => {
          setLLMDrawerVisible(false);
          getLLMConfigs().then((configs) => {
            setLLMConfigs(configs);
            const latest = configs.filter((c) => c.enabled === 1).sort((a, b) => b.id - a.id)[0];
            if (latest) {
              form.setFieldsValue({ llm_config_id: latest.id });
            }
          });
        }}
      />
    </Drawer>
  );
}
