import React from 'react';
import { Button, Form, Space, Spin, Modal, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';

import { NS } from '../constants';
import { getItem, putItem, testConnection, disconnectOAuth } from '../services';
import { adjustFormValues, adjustSubmitValues, stripOAuthFields } from '../utils/adjustFormValues';
import useMcpOAuth from '../useMcpOAuth';
import FormCpt from './Form';
import ToolsList from './ToolsList';

interface Props {
  id?: number;

  visible: boolean;
  onOk: () => void;
  onClose: () => void;
}

export default function EditDrawer(props: Props) {
  const { t } = useTranslation(NS);
  const { visible, onOk, onClose, id } = props;
  const [form] = Form.useForm();

  const oauth = useMcpOAuth(id);

  const { loading } = useRequest(
    () => {
      if (!id) {
        return Promise.resolve(null);
      }
      return getItem(id);
    },
    {
      refreshDeps: [id],
      onSuccess(data) {
        if (data) {
          form.setFieldsValue(adjustFormValues(data));
        }
      },
    },
  );

  const [testLoading, setTestLoading] = React.useState(false);

  // 关闭时清空表单：oauth_client_id/secret/scope 不在 getItem 返回里，不重置会残留到下一个被编辑的 server
  const handleClose = () => {
    form.resetFields();
    setTestLoading(false);
    oauth.setStatus(null);
    onClose();
  };

  const handleConnect = async () => {
    if (!id) return;
    try {
      const { ok } = await oauth.connect({
        ensureServerId: async () => id,
        client_id: form.getFieldValue('oauth_client_id'),
        client_secret: form.getFieldValue('oauth_client_secret'),
        scope: form.getFieldValue('oauth_scope'),
      });
      if (ok) {
        message.success(t('form.oauth_connect_success'));
      } else {
        message.error(t('form.oauth_connect_failure'));
      }
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    }
  };

  const handleDisconnect = () => {
    if (!id) return;
    disconnectOAuth(id).then(() => {
      oauth.refreshStatus(id);
      message.success(t('form.oauth_disconnected'));
    });
  };

  const handleTest = () => {
    form.validateFields().then((values) => {
      const isOauth = values.auth_mode === 'oauth';
      if (isOauth && !oauth.status?.connected) {
        message.info(t('form.oauth_test_need_connect'));
        return;
      }
      const data = isOauth ? { id } : stripOAuthFields(adjustSubmitValues(values));
      setTestLoading(true);
      testConnection(data)
        .then((res) => {
          if (res.error) {
            Modal.error({
              title: t('form.test_connection_failure'),
              content: (
                <div>
                  <div>Duration: {res.duration_ms} ms</div>
                  <div>Error: {typeof res.error === 'string' ? res.error : JSON.stringify(res.error)}</div>
                </div>
              ),
            });
          } else {
            Modal.success({
              title: t('form.test_connection_success'),
              width: 600,
              content: (
                <div>
                  <div>Duration: {res.duration_ms} ms</div>
                  {id !== undefined && <ToolsList id={id} />}
                </div>
              ),
            });
          }
        })
        .finally(() => {
          setTestLoading(false);
        });
    });
  };

  const handleSave = () => {
    if (!id) return;
    form.validateFields().then((values) => {
      putItem(id, stripOAuthFields(adjustSubmitValues(values)) as any).then(() => {
        form.resetFields();
        oauth.setStatus(null);
        onOk();
      });
    });
  };

  return (
    <Modal
      width={600}
      title={
        <>
          {t('form.edit_title')}
          <span className='ml-2 text-xs font-normal text-hint'>{t('form.remote_only_note')}</span>
        </>
      }
      visible={visible}
      onCancel={handleClose}
      footer={
        <Space>
          <Button onClick={handleClose}>{t('common:btn.cancel')}</Button>
          <Button loading={testLoading} onClick={handleTest}>
            {t('form.test_connection')}
          </Button>
          <Button type='primary' onClick={handleSave}>
            {t('common:btn.save')}
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        <FormCpt form={form} oauth={{ status: oauth.status, connecting: oauth.connecting, onConnect: handleConnect, onDisconnect: handleDisconnect }} />
      </Spin>
    </Modal>
  );
}
