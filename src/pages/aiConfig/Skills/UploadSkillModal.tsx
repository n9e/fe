import React, { useRef, useState } from 'react';
import { Modal, message } from 'antd';
import { FolderAddOutlined, LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { importAISkill } from './services';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ACCEPTED_EXTS = ['md', 'zip', 'skill'];

export default function UploadSkillModal({ visible, onClose, onSuccess }: Props) {
  const { t } = useTranslation('aiConfig');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ACCEPTED_EXTS.includes(ext)) {
      message.error(t('skill.upload_invalid_type'));
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await importAISkill(formData);
      message.success(t('skill.upload_success'));
      onSuccess();
      onClose();
    } catch {
      // request util shows the error toast
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragging) setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleClose = () => {
    if (uploading) return;
    setDragging(false);
    onClose();
  };

  return (
    <Modal title={t('skill.upload_title')} visible={visible} onCancel={handleClose} footer={null} width={560} destroyOnClose maskClosable={!uploading}>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? 'var(--fc-primary-color, #8162dc)' : 'var(--fc-border-color, #e5e7eb)'}`,
          background: dragging ? 'rgba(129, 98, 220, 0.04)' : 'var(--fc-fill-1, #f8fafc)',
          borderRadius: 12,
          padding: '48px 24px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: uploading ? 0.7 : 1,
        }}
      >
        {uploading ? (
          <>
            <LoadingOutlined style={{ fontSize: 32, color: 'var(--fc-primary-color, #8162dc)', marginBottom: 14 }} />
            <div style={{ fontSize: 14, color: 'var(--fc-text-3, #666)', fontWeight: 500 }}>{t('skill.upload_uploading')}</div>
          </>
        ) : (
          <>
            <FolderAddOutlined style={{ fontSize: 36, color: dragging ? 'var(--fc-primary-color, #8162dc)' : 'var(--fc-text-3, #666)', marginBottom: 14, transition: 'color 0.2s' }} />
            <div style={{ fontSize: 14, color: 'var(--fc-text-2, #333)', fontWeight: 500 }}>{dragging ? t('skill.upload_drop_here') : t('skill.upload_drag_or_click')}</div>
          </>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fc-text-1, #1a1a1a)', marginBottom: 10 }}>{t('skill.upload_requirements_title')}</div>
        <ul style={{ fontSize: 13, color: 'var(--fc-text-3, #666)', paddingLeft: 20, margin: 0, lineHeight: 1.9 }}>
          <li>{t('skill.upload_req_zip')}</li>
        </ul>
      </div>

      <input
        ref={inputRef}
        type='file'
        accept='.md,.zip,.skill'
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          if (inputRef.current) inputRef.current.value = '';
        }}
      />
    </Modal>
  );
}
