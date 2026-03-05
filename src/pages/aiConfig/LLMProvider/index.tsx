import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Switch, Popconfirm, Space, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ColumnsType } from 'antd/lib/table';
import { LLMProvider, getLLMProviders, deleteLLMProvider, updateLLMProvider } from './services';
import EditModal from './EditModal';

export default function LLMProviderList() {
  const { t } = useTranslation('aiConfig');
  const [list, setList] = useState<LLMProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editData, setEditData] = useState<LLMProvider | undefined>();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getLLMProviders();
      setList(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    await deleteLLMProvider(id);
    message.success('Deleted');
    fetchData();
  };

  const handleToggleEnabled = async (record: LLMProvider) => {
    await updateLLMProvider(record.id, { ...record, enabled: record.enabled === 1 ? 0 : 1 });
    fetchData();
  };

  const columns: ColumnsType<LLMProvider> = [
    { title: t('llm.name'), dataIndex: 'name', key: 'name' },
    {
      title: t('llm.api_type'),
      dataIndex: 'api_type',
      key: 'api_type',
      render: (val) => t(`llm.api_type_options.${val}` as any),
    },
    { title: t('llm.model'), dataIndex: 'model', key: 'model' },
    {
      title: t('llm.is_default'),
      dataIndex: 'is_default',
      key: 'is_default',
      render: (val) => (val === 1 ? <Tag color='blue'>Default</Tag> : null),
    },
    {
      title: t('llm.enabled'),
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
              setModalVisible(true);
            }}
          />
          <Popconfirm title={t('llm.delete_confirm')} onConfirm={() => handleDelete(record.id)}>
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
          {t('llm.add')}
        </Button>
      </div>
      <Table rowKey='id' columns={columns} dataSource={list} loading={loading} pagination={false} />
      <EditModal
        visible={modalVisible}
        data={editData}
        onClose={() => setModalVisible(false)}
        onOk={() => {
          setModalVisible(false);
          fetchData();
        }}
      />
    </>
  );
}
