import React, { useState, useRef } from 'react';
import { Button, Table, Popconfirm, Modal, message, Space } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ColumnsType } from 'antd/lib/table';
import { AISkillFile, uploadAISkillFile, getAISkillFile, deleteAISkillFile } from './services';

interface Props {
  skillId: number;
  files?: AISkillFile[];
  onRefresh?: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function ResourceFiles({ skillId, files, onRefresh }: Props) {
  const { t } = useTranslation('aiConfig');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewName, setPreviewName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await uploadAISkillFile(skillId, formData);
      message.success('Uploaded');
      onRefresh?.();
    } catch {}
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePreview = async (fileId: number, fileName: string) => {
    const data = await getAISkillFile(fileId);
    setPreviewName(fileName);
    setPreviewContent(data?.content || '');
    setPreviewVisible(true);
  };

  const handleDelete = async (fileId: number) => {
    await deleteAISkillFile(fileId);
    message.success('Deleted');
    onRefresh?.();
  };

  const columns: ColumnsType<AISkillFile> = [
    { title: t('skill.file_name'), dataIndex: 'name', key: 'name' },
    { title: t('skill.file_size'), dataIndex: 'size', key: 'size', width: 100, render: (v) => formatSize(v) },
    {
      title: '',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Space>
          <EyeOutlined onClick={() => handlePreview(record.id, record.name)} />
          <Popconfirm title='Delete this file?' onConfirm={() => handleDelete(record.id)}>
            <DeleteOutlined style={{ color: '#ff4d4f' }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong>{t('skill.files')}</strong>
        <Button size='small' icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()}>
          {t('skill.upload_file')}
        </Button>
        <input ref={fileInputRef} type='file' accept='.md,.txt,.json,.yaml,.yml,.csv' style={{ display: 'none' }} onChange={handleUpload} />
      </div>
      <Table rowKey='id' columns={columns} dataSource={files || []} pagination={false} size='small' />
      <Modal title={previewName} visible={previewVisible} onCancel={() => setPreviewVisible(false)} footer={null} width={640}>
        <pre style={{ maxHeight: 400, overflow: 'auto', whiteSpace: 'pre-wrap', fontSize: 13 }}>{previewContent}</pre>
      </Modal>
    </div>
  );
}
