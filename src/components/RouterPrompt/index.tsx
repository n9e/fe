import React, { useCallback, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useHistory } from 'react-router-dom';
import { Location } from 'history';
import { Modal } from 'antd';

interface Props {
  when: boolean;
  title?: string;
  onOK?: () => boolean | Promise<boolean>;
  onCancel?: () => boolean | Promise<boolean>;
  okText?: string;
  cancelText?: string;
  footer?: React.ReactNode;
  message?: React.ReactNode;
  validator?: (prompt: Location) => boolean; // 自定义校验器
}

export default forwardRef(function RouterPrompt(props: Props, ref) {
  const { when, onOK, onCancel, title = 'Unsaved changes', message = 'Are you sure want to leave this page ?', okText, cancelText, footer, validator } = props;
  const history = useHistory();
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (when) {
        event.preventDefault();
        event.returnValue = message; // 兼容旧版浏览器
      }
    };

    if (when) {
      history.block((prompt) => {
        if (validator && validator(prompt)) {
          return undefined;
        }
        setCurrentPath(prompt.pathname);
        setShowPrompt(true);
        return 'CUSTOM';
      });
    } else {
      history.block(() => {});
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      history.block(() => {});
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [history, when]);

  const redirect = useCallback(() => {
    history.block(() => {});
    history.push(currentPath);
  }, [currentPath, history]);

  const handleOK = useCallback(async () => {
    if (onOK) {
      const canRoute = await Promise.resolve(onOK());
      if (canRoute) {
        redirect();
      }
    } else {
      redirect();
    }
  }, [currentPath, history, onOK]);

  const handleCancel = useCallback(async () => {
    if (onCancel) {
      const canRoute = await Promise.resolve(onCancel());
      if (canRoute) {
        redirect();
      }
    }
    setShowPrompt(false);
  }, [currentPath, history, onCancel]);

  useImperativeHandle(
    ref,
    () => {
      return {
        redirect: redirect,
        hidePrompt: () => setShowPrompt(false),
      };
    },
    [currentPath],
  );

  return showPrompt ? (
    <Modal title={title} visible={showPrompt} onOk={handleOK} okText={okText} onCancel={handleCancel} cancelText={cancelText} closable={true} footer={footer}>
      {message}
    </Modal>
  ) : null;
});
