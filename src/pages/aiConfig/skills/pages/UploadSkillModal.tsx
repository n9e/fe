import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

import { NS } from '../constants';

interface Props {
  title: string;
  visible: boolean;
  onCancel: () => void;
  onSubmit: (file: File) => Promise<void> | void;
}

export default function UploadSkillModal(props: Props) {
  const { t } = useTranslation(NS);
  const { title, visible, onCancel, onSubmit } = props;
  const [submitting, setSubmitting] = React.useState(false);

  return (
    <Modal
      title={
        <div className='flex items-center gap-4'>
          <span>{title}</span>
          <span className='text-soft'>{t('upload_modal_subtitle')}</span>
        </div>
      }
      visible={visible}
      onCancel={() => {
        if (submitting) {
          return;
        }
        onCancel();
      }}
      footer={null}
      width={980}
      destroyOnClose
      maskClosable={!submitting}
      keyboard={!submitting}
    >
      <Upload.Dragger
        accept='.zip,.tgz,application/gzip,application/x-gzip'
        showUploadList={false}
        multiple={false}
        disabled={submitting}
        beforeUpload={async (file) => {
          setSubmitting(true);
          try {
            await onSubmit(file as File);
            onCancel();
          } catch (_error) {
            // Keep modal open so users can retry after a failed upload.
          } finally {
            setSubmitting(false);
          }
          return Upload.LIST_IGNORE;
        }}
      >
        <p className='ant-upload-drag-icon'>
          <InboxOutlined />
        </p>
        <p className='ant-upload-text'>{t('upload_modal_dragger')}</p>
      </Upload.Dragger>

      <div className='mt-6'>
        <div className='text-l1'>{t('upload_modal_requirements')}</div>
        <ul className='mt-3 pl-5'>
          <li className='text-soft'>{t('upload_modal_requirement_1')}</li>
        </ul>
      </div>
    </Modal>
  );
}
