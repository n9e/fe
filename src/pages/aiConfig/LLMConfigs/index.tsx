import React, { useState, useEffect } from 'react';
import { Table, Button, Switch, Popconfirm, Space, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ColumnsType } from 'antd/lib/table';
import { AILLMConfig, getLLMConfigs, deleteLLMConfig, updateLLMConfig } from './services';
import LLMConfigDrawer from './LLMConfigDrawer';

export default function LLMConfigList() {
  const { t } = useTranslation('aiConfig');
  const [list, setList] = useState<AILLMConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editData, setEditData] = useState<AILLMConfig | undefined>();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getLLMConfigs();
      setList(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    await deleteLLMConfig(id);
    message.success('Deleted');
    fetchData();
  };

  const handleToggleEnabled = async (record: AILLMConfig) => {
    await updateLLMConfig(record.id, { ...record, enabled: record.enabled === 1 ? 0 : 1 });
    fetchData();
  };

  const columns: ColumnsType<AILLMConfig> = [
    { title: t('llm_config.name'), dataIndex: 'name', key: 'name' },
    { title: t('llm_config.description'), dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: t('llm.api_type'),
      dataIndex: 'api_type',
      key: 'api_type',
      render: (val) => (val ? t(`llm.api_type_options.${val}` as any) : '-'),
    },
    { title: t('llm.model'), dataIndex: 'model', key: 'model' },
    {
      title: t('llm_config.enabled'),
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
          <Popconfirm title={t('llm_config.delete_confirm')} onConfirm={() => handleDelete(record.id)}>
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
          {t('llm_config.add')}
        </Button>
      </div>
      <div className='fc-border' style={{ borderRadius: 'var(--fc-radius-md, 6px)', padding: 16 }}>
        <Table rowKey='id' columns={columns} dataSource={list} loading={loading} pagination={false} />
      </div>
      <LLMConfigDrawer
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
