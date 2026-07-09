import React from 'react';
import { Button, Form, Modal, Space, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { NS } from '../constants';
import { postItem, putItem, testConnection, disconnectOAuth } from '../services';
import { adjustSubmitValues, stripOAuthFields } from '../utils/adjustFormValues';
import { MCPTemplate } from '../templates';
import useMcpOAuth from '../useMcpOAuth';
import FormCpt from './Form';
import TemplateGallery from './TemplateGallery';

export type View = 'form' | 'template';

interface Props {
  visible: boolean;
  /** 弹窗打开时的初始视图：'form' 直接进表单，'template' 先进模板画廊 */
  defaultView?: View;
  onOk: () => void;
  onClose: () => void;
}

export default function AddDrawer(props: Props) {
  const { t } = useTranslation(NS);
  const { visible, defaultView = 'form', onOk, onClose } = props;
  const [form] = Form.useForm();

  const [testLoading, setTestLoading] = React.useState(false);
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [view, setView] = React.useState<View>(defaultView);
  // 新增流程里点「连接授权」会先创建服务器拿到 id；创建后保存走更新。
  const [serverId, setServerId] = React.useState<number | undefined>(undefined);

  const oauth = useMcpOAuth(serverId);

  React.useEffect(() => {
    if (visible) {
      setView(defaultView);
    }
  }, [visible, defaultView]);

  const resetState = () => {
    setTestLoading(false);
    setSaveLoading(false);
    setServerId(undefined);
    oauth.setStatus(null);
    form.resetFields();
  };

  const handleClose = () => {
    // 「连接授权」已先创建服务器：即便用户取消，记录也已落库，需刷新列表让其可见可管理
    const created = serverId !== undefined;
    resetState();
    if (created) {
      onOk();
    } else {
      onClose();
    }
  };

  const handleOk = () => {
    resetState();
    onOk();
  };

  // 选中模板后，先重置表单再全量回填模板字段（setFieldsValue 是增量更新，需先 resetFields）
  const applyTemplate = (template: MCPTemplate) => {
    form.resetFields();
    setServerId(undefined);
    oauth.setStatus(null);
    // 未显式声明鉴权方式的模板：带 header 则按 header 模式（否则请求头会被隐藏且无法编辑），否则无认证
    const authMode = template.authMode ?? ((template.values.headers?.length ?? 0) > 0 ? 'header' : 'none');
    form.setFieldsValue({ ...template.values, auth_mode: authMode });
    setView('form');
  };

  // 确保服务器已存在（返回 id）；不存在则先创建。
  const ensureServerId = async (): Promise<number> => {
    if (serverId) return serverId;
    await form.validateFields(['name', 'url', 'auth_mode']);
    const data = stripOAuthFields(adjustSubmitValues(form.getFieldsValue(true)));
    const id = (await postItem(data)) as number;
    setServerId(id);
    return id;
  };

  const handleConnect = async () => {
    try {
      const { ok } = await oauth.connect({
        ensureServerId,
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
    if (!serverId) return;
    disconnectOAuth(serverId).then(() => {
      oauth.refreshStatus(serverId);
      message.success(t('form.oauth_disconnected'));
    });
  };

  const handleTest = () => {
    form.validateFields().then((values) => {
      const isOauth = values.auth_mode === 'oauth';
      if (isOauth && !(serverId && oauth.status?.connected)) {
        message.info(t('form.oauth_test_need_connect'));
        return;
      }
      const data = isOauth ? { id: serverId } : stripOAuthFields(adjustSubmitValues(values));
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
              content: <div>Duration: {res.duration_ms} ms</div>,
            });
          }
        })
        .finally(() => setTestLoading(false));
    });
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const data = stripOAuthFields(adjustSubmitValues(values));
      setSaveLoading(true);
      const req = serverId ? putItem(serverId, { ...data, id: serverId } as any) : postItem(data);
      req.then(() => handleOk()).finally(() => setSaveLoading(false));
    });
  };

  return (
    <Modal
      width={view === 'template' ? 880 : 600}
      title={
        view === 'template' ? (
          t('template.title')
        ) : (
          <>
            {t('form.add_title')}
            <span className='ml-2 text-xs font-normal text-hint'>{t('form.remote_only_note')}</span>
          </>
        )
      }
      visible={visible}
      onCancel={handleClose}
      footer={
        view === 'template' ? (
          <Space>
            <Button onClick={handleClose}>{t('common:btn.cancel')}</Button>
            <Button icon={<ArrowLeftOutlined />} onClick={() => setView('form')}>
              {t('template.manual')}
            </Button>
          </Space>
        ) : (
          <Space>
            <Button onClick={handleClose}>{t('common:btn.cancel')}</Button>
            <Button loading={testLoading} onClick={handleTest}>
              {t('form.test_connection')}
            </Button>
            <Button type='primary' loading={saveLoading} onClick={handleSave}>
              {t('common:btn.save')}
            </Button>
          </Space>
        )
      }
    >
      <div style={{ display: view === 'form' ? 'block' : 'none' }}>
        <FormCpt form={form} oauth={{ status: oauth.status, connecting: oauth.connecting, onConnect: handleConnect, onDisconnect: handleDisconnect }} />
      </div>
      {view === 'template' && <TemplateGallery onSelect={applyTemplate} />}
    </Modal>
  );
}
