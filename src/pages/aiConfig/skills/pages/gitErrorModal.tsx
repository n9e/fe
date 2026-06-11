import React from 'react';
import { Modal } from 'antd';

function pickErrorMessage(error: unknown): string {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object') {
    const anyError = error as Record<string, any>;
    if (typeof anyError.message === 'string' && anyError.message) {
      return anyError.message;
    }
    if (typeof anyError.name === 'string' && anyError.name) {
      return anyError.name;
    }
  }
  return '';
}

export function showGitOperationError(title: string, error: unknown, fallback: string) {
  const detail = pickErrorMessage(error) || fallback;
  Modal.error({
    title,
    width: 560,
    content: <div className='break-all whitespace-pre-wrap'>{detail}</div>,
  });
}

export function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const anyError = error as Record<string, any>;
  return anyError.name === 'AbortError' || anyError.message === 'AbortError';
}

interface ConfirmCloseOptions {
  title: string;
  content: string;
  okText: string;
  cancelText: string;
  onAbort: () => void;
  onClose: () => void;
}

export function confirmAbortOngoingRequest(options: ConfirmCloseOptions) {
  Modal.confirm({
    title: options.title,
    content: options.content,
    okText: options.okText,
    okButtonProps: { danger: true },
    cancelText: options.cancelText,
    onOk: options.onAbort,
    onCancel: options.onClose,
  });
}

export default showGitOperationError;
