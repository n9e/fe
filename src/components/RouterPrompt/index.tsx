import React, { useCallback, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useHistory } from 'react-router';
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
}

export default forwardRef(function RouterPrompt(props: Props, ref) {
  const { when, onOK, onCancel, title = 'Unsaved changes', message = 'Are you sure want to leave this page ?', okText, cancelText, footer } = props;
  const history = useHistory();
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    if (when) {
      history.block((prompt) => {
        setCurrentPath(prompt.pathname);
        setShowPrompt(true);
        return 'CUSTOM';
      });
    } else {
      history.block(() => {});
    }

    return () => {
      history.block(() => {});
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
