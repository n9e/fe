import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Switch, Button, Space, Tag, Spin, Table, message } from 'antd';
import { PlusOutlined, DeleteOutlined, ApiOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { MCPServer, addMCPServer, updateMCPServer, testMCPServer, testMCPServerConfig, getMCPServerTools } from './services';

interface Props {
  visible: boolean;
  data?: MCPServer;
  onClose: () => void;
  onOk: () => void;
}

interface KVPair {
  key: string;
  value: string;
}

function parseKV(jsonStr: string): KVPair[] {
  try {
    const obj = JSON.parse(jsonStr);
    return Object.entries(obj).map(([key, value]) => ({ key, value: String(value) }));
  } catch {
    return [];
  }
}

function serializeKV(pairs: KVPair[]): string {
  const obj: Record<string, string> = {};
  pairs.forEach((p) => {
    if (p.key) obj[p.key] = p.value;
  });
  return Object.keys(obj).length > 0 ? JSON.stringify(obj) : '';
}

export default function AddServerModal({ visible, data, onClose, onOk }: Props) {
  const { t } = useTranslation('aiConfig');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; duration_ms?: number; error?: string } | null>(null);
  const [tools, setTools] = useState<{ name: string; description: string }[]>([]);
  const isEdit = !!data;

  useEffect(() => {
    if (visible && data) {
      form.setFieldsValue({
        name: data.name,
        url: data.url,
        description: data.description,
        enabled: data.enabled === 1,
        headers: parseKV(data.headers),
      });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({ enabled: true, headers: [] });
    }
    if (visible) {
      setTestResult(null);
      setTools([]);
    }
  }, [visible, data]);

  const handleTest = async () => {
    const url = form.getFieldValue('url');
    if (!url) {
      form.validateFields(['url']);
      return;
    }
    setTestLoading(true);
    setTestResult(null);
    setTools([]);
    try {
      let result;
      if (isEdit && data) {
        result = await testMCPServer(data.id);
      } else {
        const headers = serializeKV(form.getFieldValue('headers') || []);
        result = await testMCPServerConfig({ url, headers });
      }
      setTestResult(result);
      if (result.success && isEdit && data) {
        try {
          const toolsList = await getMCPServerTools(data.id);
          setTools(toolsList);
        } catch {}
      }
    } catch (err: any) {
      setTestResult({ success: false, error: err.message || 'Test failed' });
    } finally {
      setTestLoading(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const payload = {
        name: values.name,
        url: values.url,
        description: values.description || '',
        enabled: values.enabled ? 1 : 0,
        headers: serializeKV(values.headers || []),
        env_vars: '',
      };

      if (isEdit && data) {
        await updateMCPServer(data.id, payload);
      } else {
        await addMCPServer(payload);
      }
      message.success(isEdit ? 'Updated' : 'Created');
      onOk();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? t('mcp.edit') : t('mcp.add')}
      visible={visible}
      onCancel={onClose}
      destroyOnClose
      width={640}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div><Button icon={<ApiOutlined />} onClick={handleTest} loading={testLoading}>{t('mcp.test')}</Button></div>
          <Space>
            <Button onClick={onClose}>{t('common:btn.cancel')}</Button>
            <Button type='primary' onClick={handleOk} loading={loading}>{t('common:btn.save')}</Button>
          </Space>
        </div>
      }
    >
      <Form form={form} layout='vertical'>
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item name='name' label={t('mcp.name')} rules={[{ required: true }]} style={{ flex: 1, marginBottom: 16 }}>
            <Input placeholder={t('mcp.name_placeholder')} />
          </Form.Item>
          <Form.Item name='enabled' label={t('mcp.enabled')} valuePropName='checked' style={{ marginBottom: 16 }}>
            <Switch />
          </Form.Item>
        </div>
        <Form.Item name='url' label={t('mcp.url')} rules={[{ required: true }]}>
          <Input placeholder='https://my.mcp.server.com/mcp' />
        </Form.Item>
        <Form.Item label={t('mcp.headers_label')} style={{ marginBottom: 0 }}>
          <div style={{ color: 'var(--fc-text-3)', fontSize: 12, marginBottom: 8 }}>{t('mcp.headers_tip')}</div>
          <Form.List name='headers'>
            {(fields, { add, remove }) => (
              <>
                {fields.length > 0 && (
                  <Space style={{ display: 'flex', marginBottom: 4 }}>
                    <div style={{ width: 200, fontWeight: 500, fontSize: 12 }}>{t('mcp.header_name')}</div>
                    <div style={{ width: 200, fontWeight: 500, fontSize: 12 }}>{t('mcp.header_value')}</div>
                  </Space>
                )}
                {fields.map(({ key, name: fieldName, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align='baseline'>
                    <Form.Item {...restField} name={[fieldName, 'key']} style={{ marginBottom: 0 }}>
                      <Input placeholder='Authorization' style={{ width: 200 }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[fieldName, 'value']} style={{ marginBottom: 0 }}>
                      <Input placeholder='Bearer <token>' style={{ width: 200 }} />
                    </Form.Item>
                    <DeleteOutlined style={{ color: 'var(--fc-text-4)' }} onClick={() => remove(fieldName)} />
                  </Space>
                ))}
                <Button type='dashed' onClick={() => add({ key: '', value: '' })} icon={<PlusOutlined />} size='small'>
                  {t('mcp.add_header')}
                </Button>
              </>
            )}
          </Form.List>
        </Form.Item>
        <Form.Item name='description' label={t('mcp.description')} style={{ marginTop: 16 }}>
          <Input.TextArea rows={2} placeholder={t('mcp.description_placeholder')} />
        </Form.Item>
        <div
          style={{
            marginTop: 12,
            padding: '12px 16px',
            borderRadius: 'var(--fc-radius-md, 6px)',
            background: 'var(--fc-fill-1, #f8fafc)',
            border: '1px solid var(--fc-border-subtle, #f0f0f0)',
            fontSize: 12,
            color: 'var(--fc-text-3)',
            lineHeight: 1.8,
          }}
        >
          <div style={{ fontWeight: 500, color: 'var(--fc-text-2)', marginBottom: 4 }}>{t('mcp.server_requirements_title')}</div>
          {t('mcp.server_requirements_desc')}
        </div>
        {testLoading && (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin />
          </div>
        )}
        {testResult && !testLoading && (
          <div style={{ marginTop: 12 }}>
            <Space style={{ marginBottom: tools.length > 0 ? 12 : 0 }}>
              {testResult.success ? <Tag color='success'>{t('mcp.test_success')}</Tag> : <Tag color='error'>{t('mcp.test_failed')}</Tag>}
              {testResult.duration_ms != null && <span style={{ fontSize: 12, color: 'var(--fc-text-3)' }}>{testResult.duration_ms}ms</span>}
            </Space>
            {testResult.error && <div style={{ color: '#ff4d4f', marginTop: 4, fontSize: 12 }}>{testResult.error}</div>}
            {tools.length > 0 && (
              <>
                <div style={{ fontWeight: 500, marginBottom: 8, fontSize: 12 }}>
                  {t('mcp.tools')} ({tools.length})
                </div>
                <Table
                  size='small'
                  dataSource={tools}
                  columns={[
                    { title: t('mcp.tool_name'), dataIndex: 'name', key: 'name', width: 200 },
                    { title: t('mcp.tool_description'), dataIndex: 'description', key: 'description', ellipsis: true },
                  ]}
                  pagination={false}
                  rowKey='name'
                  scroll={{ y: 200 }}
                />
              </>
            )}
          </div>
        )}
      </Form>
    </Modal>
  );
}
