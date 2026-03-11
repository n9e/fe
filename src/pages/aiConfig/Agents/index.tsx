import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Switch, Popconfirm, Space, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ColumnsType } from 'antd/lib/table';
import { AIAgent, getAgents, deleteAgent, updateAgent } from './services';
import { getLLMConfigs, AILLMConfig } from '../LLMConfigs/services';
import AgentDrawer from './AgentDrawer';

export default function AgentList() {
  const { t } = useTranslation('aiConfig');
  const [list, setList] = useState<AIAgent[]>([]);
  const [llmConfigs, setLLMConfigs] = useState<AILLMConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editData, setEditData] = useState<AIAgent | undefined>();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [agents, configs] = await Promise.all([getAgents(), getLLMConfigs()]);
      setList(agents);
      setLLMConfigs(configs);
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

  const getLLMConfigName = (agent: AIAgent) => {
    if (agent.llm_config_id) {
      const config = llmConfigs.find((c) => c.id === agent.llm_config_id);
      return config ? config.name : '-';
    }
    return '-';
  };

  const columns: ColumnsType<AIAgent> = [
    { title: t('agent.name'), dataIndex: 'name', key: 'name' },
    { title: t('agent.description'), dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: t('agent.llm_config'),
      key: 'llm_config',
      render: (_, record) => getLLMConfigName(record),
    },
    {
      title: t('agent.use_case'),
      dataIndex: 'use_case',
      key: 'use_case',
      render: (val) => (val ? t(`agent.use_case_options.${val}` as any) : '-'),
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
      <div className='fc-border' style={{ borderRadius: 'var(--fc-radius-md, 6px)', padding: 16 }}>
        <Table rowKey='id' columns={columns} dataSource={list} loading={loading} pagination={false} />
      </div>
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
