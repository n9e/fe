import React, { useEffect, useState } from 'react';
import { Drawer, Form, Input, Select, Switch, InputNumber, Collapse, Space, Button, Row, Col, Divider, Tag, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { AILLMConfig, addLLMConfig, updateLLMConfig, testLLMConfig } from './services';

interface Props {
  visible: boolean;
  data?: AILLMConfig;
  onClose: () => void;
  onOk: () => void;
}

export default function LLMConfigDrawer({ visible, data, onClose, onOk }: Props) {
  const { t } = useTranslation('aiConfig');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; duration_ms?: number; error?: string } | null>(null);
  const isEdit = !!data;

  useEffect(() => {
    if (visible && data) {
      const extraConfig = data.extra_config || {};
      let customHeadersArr: { name: string; value: string }[] = [];
      if (extraConfig.custom_headers && typeof extraConfig.custom_headers === 'object') {
        customHeadersArr = Object.entries(extraConfig.custom_headers).map(([name, value]) => ({ name, value: value as string }));
      }
      form.setFieldsValue({
        ...data,
        enabled: data.enabled === 1,
        timeout: extraConfig.timeout_seconds,
        skip_tls_verify: !!extraConfig.skip_tls_verify,
        proxy: extraConfig.proxy || '',
        temperature: extraConfig.temperature,
        max_tokens: extraConfig.max_tokens,
        context_length: extraConfig.context_length,
        custom_headers: customHeadersArr.length > 0 ? customHeadersArr : undefined,
        custom_params: extraConfig.custom_params ? JSON.stringify(extraConfig.custom_params, null, 2) : '',
      });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({ enabled: true, api_type: 'openai' });
    }
  }, [visible, data]);

  const buildExtraConfig = (values: any) => {
    const extraConfig: Record<string, any> = {};
    if (values.timeout !== undefined && values.timeout !== null) extraConfig.timeout_seconds = values.timeout;
    if (values.skip_tls_verify) extraConfig.skip_tls_verify = true;
    if (values.proxy) extraConfig.proxy = values.proxy;
    if (values.custom_headers && values.custom_headers.length > 0) {
      const headers: Record<string, string> = {};
      values.custom_headers.forEach((h: { name: string; value: string }) => {
        if (h?.name) headers[h.name] = h.value || '';
      });
      if (Object.keys(headers).length > 0) extraConfig.custom_headers = headers;
    }
    return extraConfig;
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const values = form.getFieldsValue();
      const result = await testLLMConfig({
        api_type: values.api_type,
        api_url: values.api_url,
        api_key: values.api_key,
        model: values.model,
        extra_config: buildExtraConfig(values),
      });
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
      const { temperature, max_tokens, timeout, custom_headers, skip_tls_verify, proxy, context_length, custom_params, ...rest } = values;
      const extraConfig: Record<string, any> = {};
      if (temperature !== undefined && temperature !== null) extraConfig.temperature = temperature;
      if (max_tokens !== undefined && max_tokens !== null) extraConfig.max_tokens = max_tokens;
      if (timeout !== undefined && timeout !== null) extraConfig.timeout_seconds = timeout;
      if (skip_tls_verify) extraConfig.skip_tls_verify = true;
      if (proxy) extraConfig.proxy = proxy;
      if (context_length !== undefined && context_length !== null) extraConfig.context_length = context_length;
      if (custom_headers && custom_headers.length > 0) {
        const headers: Record<string, string> = {};
        custom_headers.forEach((h: { name: string; value: string }) => {
          if (h?.name) headers[h.name] = h.value || '';
        });
        if (Object.keys(headers).length > 0) extraConfig.custom_headers = headers;
      }
      if (custom_params) {
        try {
          extraConfig.custom_params = JSON.parse(custom_params);
        } catch {
          extraConfig.custom_params = custom_params;
        }
      }

      const payload = {
        ...rest,
        enabled: values.enabled ? 1 : 0,
        extra_config: extraConfig,
      };

      if (isEdit && data) {
        await updateLLMConfig(data.id, payload);
      } else {
        await addLLMConfig(payload);
      }
      message.success(isEdit ? 'Updated' : 'Created');
      onOk();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={isEdit ? t('llm_config.edit') : t('llm_config.add')}
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
        <Row gutter={16} align='bottom'>
          <Col flex='auto'>
            <Form.Item name='name' label={t('llm_config.name')} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item name='enabled' label={t('llm_config.enabled')} valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name='description' label={t('llm_config.description')} style={{ marginBottom: 12 }}>
          <Input.TextArea rows={2} placeholder={t('llm_config.description_placeholder')} />
        </Form.Item>

        <Divider style={{ margin: '12px 0 16px' }} />

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='api_type' label={t('llm.api_type')} rules={[{ required: true }]}>
              <Select>
                <Select.Option value='openai'>{t('llm.api_type_options.openai')}</Select.Option>
                <Select.Option value='claude'>{t('llm.api_type_options.claude')}</Select.Option>
                <Select.Option value='gemini'>{t('llm.api_type_options.gemini')}</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='model' label={t('llm.model')} rules={[{ required: true }]}>
              <Input placeholder='gpt-4o' />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name='api_url' label={t('llm.api_url')} rules={[{ required: true }]}>
          <Input placeholder='https://api.openai.com/v1' />
        </Form.Item>
        <Form.Item name='api_key' label={t('llm.api_key')} rules={[{ required: !isEdit }]} style={{ marginBottom: 12 }}>
          <Input.Password placeholder={isEdit ? '••••••••' : ''} />
        </Form.Item>
        <div style={{ marginBottom: 16 }}>
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
        </div>
        <Collapse ghost style={{ marginLeft: -16 }}>
          <Collapse.Panel header={t('llm.extra_config')} key='extra'>
            <Form.Item name='timeout' label={t('llm.timeout')} tooltip={t('llm.timeout_tip')}>
              <InputNumber min={1} style={{ width: '100%' }} placeholder='e.g. 60' />
            </Form.Item>
            <Form.Item name='skip_tls_verify' label={t('llm.skip_tls_verify')} tooltip={t('llm.skip_tls_verify_tip')} valuePropName='checked'>
              <Switch />
            </Form.Item>
            <Form.Item name='proxy' label={t('llm.proxy')} tooltip={t('llm.proxy_tip')}>
              <Input placeholder='http://proxy:8080' />
            </Form.Item>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>{t('llm.custom_headers')}</div>
            <Form.List name='custom_headers'>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align='baseline'>
                      <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true, message: t('llm.header_name') }]} style={{ marginBottom: 0 }}>
                        <Input placeholder={t('llm.header_name')} />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'value']} style={{ marginBottom: 0 }}>
                        <Input placeholder={t('llm.header_value')} />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
                    {t('llm.add_header')}
                  </Button>
                </>
              )}
            </Form.List>
            <Form.Item name='custom_params' label={t('llm.custom_params')} tooltip={t('llm.custom_params_tip')}>
              <Input.TextArea rows={3} placeholder='{"key": "value"}' />
            </Form.Item>
            <Form.Item name='temperature' label={t('llm.temperature')} tooltip={t('llm.temperature_tip')}>
              <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} placeholder='e.g. 0.7' />
            </Form.Item>
            <Form.Item name='max_tokens' label={t('llm.max_tokens')} tooltip={t('llm.max_tokens_tip')}>
              <InputNumber min={1} style={{ width: '100%' }} placeholder='e.g. 4096' />
            </Form.Item>
            <Form.Item name='context_length' label={t('llm.context_length')} tooltip={t('llm.context_length_tip')}>
              <InputNumber min={1} style={{ width: '100%' }} placeholder='e.g. 128000' />
            </Form.Item>
          </Collapse.Panel>
        </Collapse>
      </Form>
    </Drawer>
  );
}
