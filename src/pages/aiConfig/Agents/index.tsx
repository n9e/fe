import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Switch, Popconfirm, Space, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ColumnsType } from 'antd/lib/table';
import { AIAgent, getAgents, deleteAgent, updateAgent } from './services';
import AgentDrawer from './AgentDrawer';

export default function AgentList() {
  const { t } = useTranslation('aiConfig');
  const [list, setList] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editData, setEditData] = useState<AIAgent | undefined>();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAgents();
      setList(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    await deleteAgent(id);
    message.success('Deleted');
    fetchData();
  };

  const handleToggleEnabled = async (record: AIAgent) => {
    await updateAgent(record.id, { ...record, enabled: record.enabled === 1 ? 0 : 1 });
    fetchData();
  };

  const columns: ColumnsType<AIAgent> = [
    { title: t('agent.name'), dataIndex: 'name', key: 'name' },
    { title: t('agent.description'), dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: t('llm.api_type'),
      dataIndex: 'api_type',
      key: 'api_type',
      render: (val) => (val ? t(`llm.api_type_options.${val}` as any) : '-'),
    },
    { title: t('llm.model'), dataIndex: 'model', key: 'model' },
    {
      title: t('agent.is_default'),
      dataIndex: 'is_default',
      key: 'is_default',
      render: (val) => (val === 1 ? <Tag color='blue'>Default</Tag> : null),
    },
    {
      title: t('agent.enabled'),
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
          <EditOutlined
            onClick={() => {
              setEditData(record);
              setDrawerVisible(true);
            }}
          />
          <Popconfirm title={t('agent.delete_confirm')} onConfirm={() => handleDelete(record.id)}>
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
            setDrawerVisible(true);
          }}
        >
          {t('agent.add')}
        </Button>
      </div>
      <Table rowKey='id' columns={columns} dataSource={list} loading={loading} pagination={false} />
      <AgentDrawer
        visible={drawerVisible}
        data={editData}
        onClose={() => setDrawerVisible(false)}
        onOk={() => {
          setDrawerVisible(false);
          fetchData();
        }}
      />
    </>
  );
}
