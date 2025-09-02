import React from 'react';
import { Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import { deleteAlertEvents } from '@/services/warning';
import { NS as alertCurEventNS } from '@/pages/alertCurEvent/constants';

export default function deleteAlertEventsModal(ids: number[], onSuccess = () => {}, t) {
  Modal.confirm({
    title: t(`${alertCurEventNS}:delete_confirm.title`),
    icon: <ExclamationCircleOutlined />,
    content: t(`${alertCurEventNS}:delete_confirm.content`),
    maskClosable: true,
    okButtonProps: { danger: true },
    zIndex: 1001,
    onOk() {
      return deleteAlertEvents(ids).then((res) => {
        message.success(t('common:success.delete'));
        onSuccess();
      });
    },
    onCancel() {},
  });
}
