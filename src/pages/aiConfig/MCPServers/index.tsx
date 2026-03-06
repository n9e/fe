import React, { useState, useEffect } from 'react';
import { Table, Button, Switch, Popconfirm, Space, Modal, Tag, Spin, Tooltip, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ApiOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ColumnsType } from 'antd/lib/table';
import { MCPServer, getMCPServers, deleteMCPServer, updateMCPServer, testMCPServer, getMCPServerTools } from './services';
import AddServerModal from './AddServerModal';

export default function MCPServerList() {
  const { t } = useTranslation('aiConfig');
  const [list, setList] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editData, setEditData] = useState<MCPServer | undefined>();
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; duration_ms?: number; error?: string; tool_count?: number } | null>(null);
  const [tools, setTools] = useState<{ name: string; description: string }[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getMCPServers();
      setList(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    await deleteMCPServer(id);
    message.success('Deleted');
    fetchData();
  };

  const handleTest = async (record: MCPServer) => {
    setTestLoading(true);
    setTestResult(null);
    setTools([]);
    setTestModalVisible(true);
    try {
      const result = await testMCPServer(record.id);
      setTestResult(result);
      if (result.success) {
        try {
          const toolsList = await getMCPServerTools(record.id);
          setTools(toolsList);
        } catch {}
      }
    } catch (err: any) {
      setTestResult({ success: false, error: err.message || 'Test failed' });
    } finally {
      setTestLoading(false);
    }
  };

  const handleToggleEnabled = async (record: MCPServer) => {
    await updateMCPServer(record.id, { ...record, enabled: record.enabled === 1 ? 0 : 1 });
    fetchData();
  };

  const columns: ColumnsType<MCPServer> = [
    { title: t('mcp.name'), dataIndex: 'name', key: 'name' },
    {
      title: t('mcp.url'),
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
    },
    {
      title: t('mcp.enabled'),
      dataIndex: 'enabled',
      key: 'enabled',
      render: (val, record) => <Switch size='small' checked={val === 1} onChange={() => handleToggleEnabled(record)} />,
    },
    {
      title: '',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title={t('mcp.test')}>
            <ApiOutlined onClick={() => handleTest(record)} />
          </Tooltip>
          <EditOutlined
            onClick={() => {
              setEditData(record);
              setModalVisible(true);
            }}
          />
          <Popconfirm title={t('mcp.delete_confirm')} onConfirm={() => handleDelete(record.id)}>
            <DeleteOutlined style={{ color: '#ff4d4f' }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={() => {
            setEditData(undefined);
            setModalVisible(true);
          }}
        >
          {t('mcp.add')}
        </Button>
      </div>
      <div className='fc-border' style={{ borderRadius: 'var(--fc-radius-md, 6px)', padding: 16 }}>
        <Table rowKey='id' columns={columns} dataSource={list} loading={loading} pagination={false} />
      </div>
      <AddServerModal
        visible={modalVisible}
        data={editData}
        onClose={() => setModalVisible(false)}
        onOk={() => {
          setModalVisible(false);
          fetchData();
        }}
      />
      <Modal title={t('mcp.test')} visible={testModalVisible} onCancel={() => setTestModalVisible(false)} footer={null} width={640}>
        {testLoading ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin />
          </div>
        ) : (
          testResult && (
            <div>
              <Space style={{ marginBottom: 16 }}>
                {testResult.success ? <Tag color='success'>{t('mcp.test_success')}</Tag> : <Tag color='error'>{t('mcp.test_failed')}</Tag>}
                {testResult.duration_ms != null && <span>{testResult.duration_ms}ms</span>}
              </Space>
              {testResult.error && <div style={{ color: '#ff4d4f', marginBottom: 16 }}>{testResult.error}</div>}
              {tools.length > 0 && (
                <>
                  <div style={{ fontWeight: 500, marginBottom: 8 }}>
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
                  />
                </>
              )}
            </div>
          )
        )}
      </Modal>
    </>
  );
}
