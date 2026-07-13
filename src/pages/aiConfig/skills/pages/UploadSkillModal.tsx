import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Upload, Form, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

import { NS } from '../constants';
import { SkillAuthValues } from '../types';
import SkillAuthFields from './SkillAuthFields';

interface Props {
  title: string;
  visible: boolean;
  showSubtitle?: boolean;
  // 是否展示并校验授权字段。内置(system) skill 的替换不套用授权团队，置 false 隐藏。
  showAuthFields?: boolean;
  // 替换既有 skill 时用它回填当前授权范围与团队；新建上传时留空（团队必填、默认私有）。
  defaultAuth?: SkillAuthValues;
  onCancel: () => void;
  onSubmit: (file: File, auth: SkillAuthValues) => Promise<void> | void;
}

const ALLOWED_EXTENSIONS = ['.zip', '.tar.gz'];

function isAllowedFileType(file: File): boolean {
  const name = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export default function UploadSkillModal(props: Props) {
  const { t } = useTranslation(NS);
  const { title, visible, showSubtitle, showAuthFields = true, defaultAuth, onCancel, onSubmit } = props;
  const [submitting, setSubmitting] = React.useState(false);
  const [form] = Form.useForm();

  React.useEffect(() => {
    // showAuthFields=false 时不渲染 Form，避免对未挂载的 form 调用 resetFields/setFieldsValue。
    if (!visible || !showAuthFields) {
      return;
    }
    form.resetFields();
    if (defaultAuth) {
      form.setFieldsValue({
        user_group_ids: defaultAuth.user_group_ids,
        private: defaultAuth.private,
      });
    }
  }, [visible, showAuthFields, defaultAuth, form]);

  return (
    <Modal
      title={
        <div className='flex items-center gap-4'>
          <span>{title}</span>
          {showSubtitle && <span className='text-soft'>{t('upload_modal_subtitle')}</span>}
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
      {showAuthFields && (
        <Form form={form} layout='vertical'>
          <SkillAuthFields />
        </Form>
      )}

      <Upload.Dragger
        showUploadList={false}
        multiple={false}
        disabled={submitting}
        beforeUpload={async (file) => {
          if (!isAllowedFileType(file)) {
            message.error(t('upload_modal_invalid_type'));
            return Upload.LIST_IGNORE;
          }
          // 先校验授权字段（团队必填），再上传，与在线创建/编辑口径一致。
          let auth: SkillAuthValues = {};
          if (showAuthFields) {
            try {
              const values = await form.validateFields();
              auth = { user_group_ids: values.user_group_ids, private: values.private };
            } catch {
              return Upload.LIST_IGNORE;
            }
          }
          setSubmitting(true);
          try {
            await onSubmit(file as File, auth);
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
