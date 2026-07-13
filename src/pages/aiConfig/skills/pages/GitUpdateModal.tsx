import React from 'react';
import { Modal, Form, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { NS } from '../constants';
import { getItem, gitUpdate } from '../services';
import { GitInstallPayload, GitInfo, SkillAuthValues } from '../types';
import GitForm from './GitForm';
import { confirmAbortOngoingRequest, isAbortError, showGitOperationError } from './gitErrorModal';

interface Props {
  id?: number;
  gitInfo?: GitInfo;
  defaultAuth?: SkillAuthValues;
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
}

export default function GitUpdateModal(props: Props) {
  const { t } = useTranslation(NS);
  const { id, gitInfo, defaultAuth, visible, onCancel, onOk } = props;
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);
  const controllerRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    if (!visible) {
      return;
    }
    form.resetFields();
    if (gitInfo) {
      form.setFieldsValue({
        git_url: gitInfo.url,
        git_ref_type: gitInfo.ref_type,
        git_ref: gitInfo.ref,
      });
    }
    if (defaultAuth) {
      form.setFieldsValue({
        user_group_ids: defaultAuth.user_group_ids,
        private: defaultAuth.private,
      });
    }
  }, [visible, gitInfo, defaultAuth, form]);

  const closeModal = React.useCallback(() => {
    form.resetFields();
    setSubmitting(false);
    controllerRef.current = null;
    onCancel();
  }, [form, onCancel]);

  const handleCancel = () => {
    if (submitting) {
      confirmAbortOngoingRequest({
        title: t('git.abort_confirm_title'),
        content: t('git.abort_confirm_content'),
        okText: t('git.abort_confirm_ok'),
        cancelText: t('git.abort_confirm_cancel'),
        onAbort: () => {
          controllerRef.current?.abort();
          closeModal();
        },
        onClose: () => {
          closeModal();
        },
      });
      return;
    }
    closeModal();
  };

  const handleSubmit = async () => {
    if (!id) return;
    let values: Pick<GitInstallPayload, 'git_ref_type' | 'git_ref' | 'user_group_ids' | 'private'>;
    try {
      values = (await form.validateFields(['git_ref_type', 'git_ref', 'user_group_ids', 'private'])) as Pick<
        GitInstallPayload,
        'git_ref_type' | 'git_ref' | 'user_group_ids' | 'private'
      >;
    } catch {
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setSubmitting(true);
    try {
      await gitUpdate(
        id,
        {
          git_ref_type: values.git_ref_type,
          git_ref: values.git_ref,
          user_group_ids: values.user_group_ids,
          private: values.private,
        },
        { silence: true, signal: controller.signal },
      );
      try {
        const detail = await getItem(id);
        const updatedAt = detail.updated_at ? moment.unix(detail.updated_at).format('YYYY-MM-DD HH:mm:ss') : '-';
        const commit = detail.git_info?.current_commit || '-';
        Modal.success({
          title: t('git.update_success_title'),
          content: (
            <div>
              <div className='flex items-baseline gap-2'>
                <span className='inline-block w-[5em] whitespace-nowrap text-right'>{t('git.meta_update_at')}:</span>
                <span className='flex-1'>{updatedAt}</span>
              </div>
              <div className='flex items-baseline gap-2'>
                <span className='inline-block w-[5em] whitespace-nowrap text-right'>Commit:</span>
                <span className='break-all flex-1'>{commit}</span>
              </div>
            </div>
          ),
        });
      } catch {
        Modal.success({ title: t('git.update_success_title') });
      }
      form.resetFields();
      controllerRef.current = null;
      onOk();
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }
      showGitOperationError(t('git.error_update_title'), error, t('git.error_default_msg'));
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
      setSubmitting(false);
    }
  };

  return (
    <Modal
      width={640}
      visible={visible}
      onCancel={handleCancel}
      maskClosable={false}
      keyboard
      destroyOnClose
      title={
        <div className='flex flex-col gap-1'>
          <span>{t('git.update_title')}</span>
          <span className='text-soft text-sm font-normal'>{t('git.update_subtitle')}</span>
        </div>
      }
      footer={
        <Space>
          <Button onClick={handleCancel}>{t('common:btn.cancel')}</Button>
          <Button type='primary' icon={<ReloadOutlined />} loading={submitting} onClick={handleSubmit}>
            {t('git.update_btn')}
          </Button>
        </Space>
      }
    >
      <GitForm
        form={form}
        mode='update'
        disabledFields={['git_url']}
        currentRefHint={
          gitInfo
            ? {
                ref_type: gitInfo.ref_type,
                ref: gitInfo.ref,
              }
            : undefined
        }
      />
    </Modal>
  );
}
