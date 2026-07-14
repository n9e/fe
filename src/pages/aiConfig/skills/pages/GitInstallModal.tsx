import React from 'react';
import { Modal, Form, message } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { NS } from '../constants';
import { gitInstall } from '../services';
import { GitInstallPayload } from '../types';
import { resolveSubmitPrivate } from '../utils/permission';
import GitForm from './GitForm';
import { confirmAbortOngoingRequest, isAbortError, showGitOperationError } from './gitErrorModal';

interface Props {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
}

export default function GitInstallModal(props: Props) {
  const { t } = useTranslation(NS);
  const { visible, onCancel, onOk } = props;
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);
  const controllerRef = React.useRef<AbortController | null>(null);

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
    let values: GitInstallPayload;
    try {
      values = (await form.validateFields()) as GitInstallPayload;
    } catch (error) {
      console.error(error);
      return;
    }

    const payload: GitInstallPayload = {
      ..._.omitBy(values, (v) => v === undefined || v === ''),
      private: resolveSubmitPrivate(values.private),
    } as GitInstallPayload;

    const controller = new AbortController();
    controllerRef.current = controller;
    setSubmitting(true);
    try {
      await gitInstall(payload, { silence: true, signal: controller.signal });
      message.success(t('common:success.add'));
      form.resetFields();
      controllerRef.current = null;
      onOk();
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }
      showGitOperationError(t('git.error_install_title'), error, t('git.error_default_msg'));
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
      okText={t('git.install_submit')}
      cancelText={t('common:btn.cancel')}
      confirmLoading={submitting}
      maskClosable={false}
      keyboard
      destroyOnClose
      title={
        <div className='flex flex-col gap-1'>
          <span>{t('git.install_title')}</span>
          <span className='text-soft text-sm font-normal'>{t('git.install_subtitle')}</span>
        </div>
      }
    >
      <GitForm form={form} mode='install' />
    </Modal>
  );
}
