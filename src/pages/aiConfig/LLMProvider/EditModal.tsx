import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Switch, InputNumber, Collapse, Space, Button, Tag, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { LLMProvider, addLLMProvider, updateLLMProvider, testLLMProvider } from './services';

interface Props {
  visible: boolean;
  data?: LLMProvider;
  onClose: () => void;
  onOk: () => void;
}

export default function EditModal({ visible, data, onClose, onOk }: Props) {
  const { t } = useTranslation('aiConfig');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; duration_ms?: number; error?: string } | null>(null);
  const isEdit = !!data;

  useEffect(() => {
    if (visible && data) {
      let extraConfig = {};
      try {
        extraConfig = data.extra_config ? JSON.parse(data.extra_config) : {};
      } catch {}
      form.setFieldsValue({
        ...data,
        is_default: data.is_default === 1,
        enabled: data.enabled === 1,
        ...extraConfig,
      });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({ enabled: true, api_type: 'openai' });
    }
  }, [visible, data]);

  const handleTest = async () => {
    if (!data) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testLLMProvider(data.id);
      setTestResult(result);
    } catch (err: any) {
      setTestResult({ success: false, error: err.message || 'Test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const { temperature, max_tokens, timeout, ...rest } = values;
      const extraConfig: Record<string, any> = {};
      if (temperature !== undefined && temperature !== null) extraConfig.temperature = temperature;
      if (max_tokens !== undefined && max_tokens !== null) extraConfig.max_tokens = max_tokens;
      if (timeout !== undefined && timeout !== null) extraConfig.timeout_seconds = timeout;

      const payload = {
        ...rest,
        is_default: values.is_default ? 1 : 0,
        enabled: values.enabled ? 1 : 0,
        extra_config: Object.keys(extraConfig).length > 0 ? JSON.stringify(extraConfig) : '',
      };

      if (isEdit && data) {
        await updateLLMProvider(data.id, payload);
      } else {
        await addLLMProvider(payload);
      }
      message.success(isEdit ? 'Updated' : 'Created');
      onOk();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? t('llm.edit') : t('llm.add')}
      visible={visible}
      onCancel={onClose}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            {isEdit && (
              <Space>
                <Button onClick={handleTest} loading={testing}>
                  {t('llm.test')}
                </Button>
                {testResult &&
                  (testResult.success ? (
                    <Tag color='success'>
                      {t('llm.test_success')} ({testResult.duration_ms}ms)
                    </Tag>
                  ) : (
                    <Tag color='error'>{t('llm.test_failed')}</Tag>
                  ))}
              </Space>
            )}
          </div>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type='primary' onClick={handleOk} loading={loading}>
              OK
            </Button>
          </Space>
        </div>
      }
    >
      <Form form={form} layout='vertical'>
        <Form.Item name='name' label={t('llm.name')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name='api_type' label={t('llm.api_type')} rules={[{ required: true }]}>
          <Select>
            <Select.Option value='openai'>{t('llm.api_type_options.openai')}</Select.Option>
            <Select.Option value='claude'>{t('llm.api_type_options.claude')}</Select.Option>
            <Select.Option value='gemini'>{t('llm.api_type_options.gemini')}</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name='api_url' label={t('llm.api_url')} rules={[{ required: true }]}>
          <Input placeholder='https://api.openai.com/v1' />
        </Form.Item>
        <Form.Item name='api_key' label={t('llm.api_key')} rules={[{ required: !isEdit }]}>
          <Input.Password placeholder={isEdit ? '••••••••' : ''} />
        </Form.Item>
        <Form.Item name='model' label={t('llm.model')} rules={[{ required: true }]}>
          <Input placeholder='gpt-4o' />
        </Form.Item>
        <Space size={24}>
          <Form.Item name='is_default' label={t('llm.is_default')} valuePropName='checked'>
            <Switch />
          </Form.Item>
          <Form.Item name='enabled' label={t('llm.enabled')} valuePropName='checked'>
            <Switch />
          </Form.Item>
        </Space>
        <Collapse ghost>
          <Collapse.Panel header={t('llm.extra_config')} key='extra'>
            <Form.Item name='temperature' label={t('llm.temperature')}>
              <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name='max_tokens' label={t('llm.max_tokens')}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name='timeout' label={t('llm.timeout')}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Collapse.Panel>
        </Collapse>
      </Form>
    </Modal>
  );
}
