import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Upload, Form, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

import { NS } from '../constants';
import { SkillAuthValues } from '../types';
import { resolveSubmitPrivate } from '../utils/permission';
import SkillAuthFields from './SkillAuthFields';

interface Props {
  title: string;
  visible: boolean;
  showSubtitle?: boolean;
  // 是否展示并校验授权字段。内置(system) skill 的替换不套用管理团队，置 false 隐藏。
  showAuthFields?: boolean;
  // 替换既有 skill 时用它回填当前可见范围与管理团队；新建上传时留空（团队必填、默认仅管理团队可见）。
  defaultAuth?: SkillAuthValues;
  // 仅详情页的非内置 skill 替换允许不选文件，只保存管理团队与可见范围。
  allowEmptyFileSubmit?: boolean;
  onCancel: () => void;
  onSubmit: (file: File | undefined, auth: SkillAuthValues) => Promise<void> | void;
}

const ALLOWED_EXTENSIONS = ['.zip', '.tar.gz'];

function isAllowedFileType(file: File): boolean {
  const name = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export default function UploadSkillModal(props: Props) {
  const { t } = useTranslation(NS);
  const { title, visible, showSubtitle, showAuthFields = true, defaultAuth, allowEmptyFileSubmit = false, onCancel, onSubmit } = props;
  const [submitting, setSubmitting] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File>();
  const [fileError, setFileError] = React.useState<string>();
  const [form] = Form.useForm();

  React.useEffect(() => {
    // showAuthFields=false 时不渲染 Form，避免对未挂载的 form 调用 resetFields/setFieldsValue。
    if (!visible || !showAuthFields) {
      return;
    }
    form.resetFields();
    setSelectedFile(undefined);
    setFileError(undefined);
    if (defaultAuth) {
      form.setFieldsValue({
        user_group_ids: defaultAuth.user_group_ids,
        private: defaultAuth.private,
      });
    }
  }, [visible, showAuthFields, defaultAuth, form]);

  async function submitFile(file: File | undefined, auth: SkillAuthValues) {
    setSubmitting(true);
    try {
      await onSubmit(file, auth);
      setSelectedFile(undefined);
      setFileError(undefined);
      onCancel();
    } catch (_error) {
      // Keep modal open so users can retry after a failed upload.
    } finally {
      setSubmitting(false);
    }
  }

  async function getAuth(): Promise<SkillAuthValues | undefined> {
    if (!showAuthFields) {
      return {};
    }

    try {
      const values = await form.validateFields();
      // 非 admin 未渲染 private 字段：替换既有 skill 时沿用 defaultAuth 里的当前值，
      // 新建上传无 defaultAuth 则默认私有。
      return { user_group_ids: values.user_group_ids, private: resolveSubmitPrivate(values.private, defaultAuth?.private) };
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  async function handleConfirm() {
    if (!selectedFile && !allowEmptyFileSubmit) {
      setFileError(t('upload_modal_file_required'));
      return;
    }
    setFileError(undefined);
    const auth = await getAuth();
    if (!auth) {
      return;
    }
    await submitFile(selectedFile, auth);
  }

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
        setSelectedFile(undefined);
        setFileError(undefined);
        onCancel();
      }}
      onOk={handleConfirm}
      okText={t('common:btn.ok')}
      cancelText={t('common:btn.cancel')}
      confirmLoading={submitting}
      footer={showAuthFields ? undefined : null}
      width={980}
      destroyOnClose
      maskClosable={!submitting}
      keyboard={!submitting}
    >
      {showAuthFields ? (
        <Form form={form} layout='vertical'>
          <SkillAuthFields />
          <Form.Item className='mb-0' validateStatus={fileError ? 'error' : undefined} help={fileError}>
            <Upload.Dragger
              showUploadList={false}
              multiple={false}
              disabled={submitting}
              beforeUpload={async (file) => {
                if (!isAllowedFileType(file)) {
                  message.error(t('upload_modal_invalid_type'));
                  return Upload.LIST_IGNORE;
                }

                // 非内置 skill 先选择文件，待用户确认整个表单后再提交。
                setSelectedFile(file as File);
                setFileError(undefined);
                return Upload.LIST_IGNORE;
              }}
            >
              <p className='ant-upload-drag-icon'>
                <InboxOutlined />
              </p>
              <p className='ant-upload-text'>{t('upload_modal_select_file')}</p>
            </Upload.Dragger>
          </Form.Item>
          {selectedFile && <div className='mt-3 text-soft'>{selectedFile.name}</div>}
        </Form>
      ) : (
        <Upload.Dragger
          showUploadList={false}
          multiple={false}
          disabled={submitting}
          beforeUpload={async (file) => {
            if (!isAllowedFileType(file)) {
              message.error(t('upload_modal_invalid_type'));
              return Upload.LIST_IGNORE;
            }

            // 内置 skill 沿用选择文件后立即上传的交互。
            await submitFile(file as File, {});
            return Upload.LIST_IGNORE;
          }}
        >
          <p className='ant-upload-drag-icon'>
            <InboxOutlined />
          </p>
          <p className='ant-upload-text'>{t('upload_modal_dragger')}</p>
        </Upload.Dragger>
      )}

      <div className='mt-6'>
        <div className='text-l1'>{t('upload_modal_requirements')}</div>
        <ul className='mt-3 pl-5'>
          <li className='text-soft'>{t('upload_modal_requirement_1')}</li>
        </ul>
      </div>
    </Modal>
  );
}
