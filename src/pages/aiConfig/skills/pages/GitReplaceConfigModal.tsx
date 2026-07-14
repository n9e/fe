import React from 'react';
import { Modal, Form, message } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { NS } from '../constants';
import { gitReplaceConfig } from '../services';
import { GitInstallPayload, GitInfo, SkillAuthValues } from '../types';
import { resolveSubmitPrivate } from '../utils/permission';
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

export default function GitReplaceConfigModal(props: Props) {
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
        git_auth_type: gitInfo.auth_type ?? 'none',
        git_subdir: gitInfo.subdir,
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
    let values: GitInstallPayload;
    try {
      values = (await form.validateFields()) as GitInstallPayload;
    } catch {
      return;
    }

    const payload: Partial<GitInstallPayload> = {
      ..._.pickBy(
        {
          git_url: values.git_url,
          git_ref_type: values.git_ref_type,
          git_ref: values.git_ref,
          git_auth_type: values.git_auth_type,
          git_subdir: values.git_subdir,
          git_token: values.git_token,
        },
        (value) => value !== undefined && value !== '',
      ),
      user_group_ids: values.user_group_ids,
      // 非 admin 未渲染 private 字段（validateFields 不含），沿用 defaultAuth 里的当前值。
      private: resolveSubmitPrivate(values.private, defaultAuth?.private),
    };

    const controller = new AbortController();
    controllerRef.current = controller;
    setSubmitting(true);
    try {
      await gitReplaceConfig(id, payload, { silence: true, signal: controller.signal });
      message.success(t('common:success.modify'));
      form.resetFields();
      controllerRef.current = null;
      onOk();
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }
      showGitOperationError(t('git.error_replace_title'), error, t('git.error_default_msg'));
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
      onOk={handleSubmit}
      okText={t('common:btn.save')}
      cancelText={t('common:btn.cancel')}
      confirmLoading={submitting}
      maskClosable={false}
      keyboard
      destroyOnClose
      title={
        <div className='flex flex-col gap-1'>
          <span>{t('git.modify_title')}</span>
          <span className='text-soft text-sm font-normal'>{t('git.replace_subtitle')}</span>
        </div>
      }
    >
      <GitForm form={form} mode='replace' />
    </Modal>
  );
}
