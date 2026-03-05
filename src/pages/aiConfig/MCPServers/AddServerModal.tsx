import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Switch, Button, Space, message } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { MCPServer, addMCPServer, updateMCPServer } from './services';

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
  const isEdit = !!data;

  useEffect(() => {
    if (visible && data) {
      form.setFieldsValue({
        name: data.name,
        url: data.url,
        description: data.description,
        enabled: data.enabled === 1,
        headers: parseKV(data.headers),
        env_vars: parseKV(data.env_vars),
      });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({ enabled: true, headers: [], env_vars: [] });
    }
  }, [visible, data]);

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
        env_vars: serializeKV(values.env_vars || []),
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

  const renderKVList = (name: string, label: string) => (
    <Form.Item label={label}>
      <Form.List name={name}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name: fieldName, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align='baseline'>
                <Form.Item {...restField} name={[fieldName, 'key']} style={{ marginBottom: 0 }}>
                  <Input placeholder={t('mcp.key_placeholder')} style={{ width: 180 }} />
                </Form.Item>
                <Form.Item {...restField} name={[fieldName, 'value']} style={{ marginBottom: 0 }}>
                  <Input placeholder={t('mcp.value_placeholder')} style={{ width: 180 }} />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(fieldName)} />
              </Space>
            ))}
            <Button type='dashed' onClick={() => add({ key: '', value: '' })} icon={<PlusOutlined />} size='small'>
              Add
            </Button>
          </>
        )}
      </Form.List>
    </Form.Item>
  );

  return (
    <Modal
      title={isEdit ? t('mcp.edit') : t('mcp.add')}
      visible={visible}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout='vertical'>
        <Form.Item name='name' label={t('mcp.name')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name='url' label={t('mcp.url')} rules={[{ required: true }]}>
          <Input placeholder='Streamable HTTP/SSE URL' />
        </Form.Item>
        {renderKVList('headers', t('mcp.headers'))}
        {renderKVList('env_vars', t('mcp.env_vars'))}
        <Form.Item name='description' label={t('mcp.description')}>
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name='enabled' label={t('mcp.enabled')} valuePropName='checked'>
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
