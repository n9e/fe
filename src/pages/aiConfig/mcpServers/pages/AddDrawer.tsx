import React, { useContext } from 'react';
import { Button, Form, Modal, Space, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';

import { NS } from '../constants';
import { postItem, putItem, testConnection, disconnectOAuth } from '../services';
import { adjustSubmitValues, stripOAuthFields } from '../utils/adjustFormValues';
import { MCPTemplate } from '../templates';
import useMcpOAuth from '../useMcpOAuth';
import useUserGroups from '../useUserGroups';
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
  // OAuth 模式下点「保存并授权」会先创建服务器拿到 id（授权回调落 token 需要）；创建后保存走更新。
  const [serverId, setServerId] = React.useState<number | undefined>(undefined);
  // 「保存并授权」进行中：流程内 serverId 会由 undefined 变为已创建的 id，用它锁住底部按钮的形态与 loading
  const [savingAndConnecting, setSavingAndConnecting] = React.useState(false);
  const authMode = Form.useWatch('auth_mode', form) ?? 'none';

  // 「保存并授权」的创建请求可能在弹窗被关闭（resetState）后才返回：用会话代号
  // 识别迟到的响应，避免把 serverId 写回污染下一次新增（那会让保存变成覆盖旧记录）
  const sessionRef = React.useRef(0);

  const oauth = useMcpOAuth(serverId);
  const { myGroupIds } = useUserGroups();
  const { profile } = useContext(CommonStateContext);
  const isAdmin = !!profile.roles?.includes('Admin');

  React.useEffect(() => {
    if (visible) {
      setView(defaultView);
    }
  }, [visible, defaultView]);

  // 新建（尚未落库）时，默认把「授权团队」预选为当前用户所在团队。myGroupIds 异步加载，
  // 故随其到位后补默认；仅在当前为空时填充，避免覆盖用户已选或模板回填。
  React.useEffect(() => {
    if (visible && serverId === undefined && myGroupIds.length > 0) {
      if (!form.getFieldValue('user_group_ids')?.length) {
        form.setFieldsValue({ user_group_ids: myGroupIds });
      }
    }
  }, [visible, serverId, myGroupIds]);

  const resetState = () => {
    sessionRef.current += 1;
    setTestLoading(false);
    setSaveLoading(false);
    setSavingAndConnecting(false);
    setServerId(undefined);
    oauth.cancel();
    oauth.setStatus(null);
    form.resetFields();
  };

  const handleClose = () => {
    // 「保存并授权」是用户显式的创建动作：即便随后取消/未完成授权，记录也已合法落库
    // （连接状态为「未连接」，可在列表/编辑里重新授权），因此关闭时需刷新列表让其可见。
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
    // 中止可能残留的 OAuth 授权（关闭弹窗、清除转圈状态）
    oauth.cancel();
    oauth.setStatus(null);
    // 未显式声明鉴权方式的模板：带 header 则按 header 模式（否则请求头会被隐藏且无法编辑），否则无认证
    const authMode = template.authMode ?? ((template.values.headers?.length ?? 0) > 0 ? 'header' : 'none');
    form.setFieldsValue({ ...template.values, auth_mode: authMode, user_group_ids: myGroupIds });
    setView('form');
  };

  // 「保存并授权」（OAuth 模式下新增的主按钮）：先整表校验，通过后创建服务器并立即发起授权。
  // 授权成功即完成新增并关闭；用户取消/失败则保留已创建记录（未连接状态），可在表单内重试。
  const handleSaveAndConnect = () => {
    form.validateFields().then(async (values) => {
      setSavingAndConnecting(true);
      try {
        const { result } = await oauth.connect({
          ensureServerId: async () => {
            const session = sessionRef.current;
            const id = (await postItem(stripOAuthFields(adjustSubmitValues(values, isAdmin)))) as number;
            if (sessionRef.current === session) {
              setServerId(id);
            } else {
              // 创建在途时弹窗已被关闭（handleClose 彼时读到 serverId 为空，走了不刷新
              // 的 onClose）：不写回 serverId，补一次 onOk 刷新列表让已落库的记录可见
              onOk();
            }
            return id;
          },
          client_id: form.getFieldValue('oauth_client_id'),
          client_secret: form.getFieldValue('oauth_client_secret'),
          scope: form.getFieldValue('oauth_scope'),
        });
        // cancelled（用户关闭授权弹窗）不弹错误提示，仅成功/失败提示
        if (result === 'success') {
          message.success(t('form.oauth_connect_success'));
          handleOk();
        } else if (result === 'failure') {
          message.error(t('form.oauth_connect_failure'));
        }
      } catch (err: any) {
        if (err?.message) message.error(err.message);
      } finally {
        setSavingAndConnecting(false);
      }
    });
  };

  // 已保存后表单内「连接授权/重新授权」按钮的重试路径
  const handleConnect = async () => {
    if (serverId === undefined) return;
    try {
      const { result } = await oauth.connect({
        ensureServerId: async () => serverId,
        client_id: form.getFieldValue('oauth_client_id'),
        client_secret: form.getFieldValue('oauth_client_secret'),
        scope: form.getFieldValue('oauth_scope'),
      });
      if (result === 'success') {
        message.success(t('form.oauth_connect_success'));
      } else if (result === 'failure') {
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
      const data = isOauth ? { id: serverId } : stripOAuthFields(adjustSubmitValues(values, isAdmin));
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
      const data = stripOAuthFields(adjustSubmitValues(values, isAdmin));
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
            {authMode === 'oauth' && (serverId === undefined || savingAndConnecting) ? (
              // OAuth 模式下的新增：创建与授权合并为一个显式动作（Dify 等产品的「Add & Authorize」惯例）
              <Button type='primary' loading={savingAndConnecting} onClick={handleSaveAndConnect}>
                {t('form.save_and_authorize')}
              </Button>
            ) : (
              <Button type='primary' loading={saveLoading} onClick={handleSave}>
                {t('common:btn.save')}
              </Button>
            )}
          </Space>
        )
      }
    >
      <div style={{ display: view === 'form' ? 'block' : 'none' }}>
        {/* 未保存时不展示「连接状态」区块：连接授权由底部「保存并授权」显式完成，避免表单内按钮隐式建库 */}
        <FormCpt
          form={form}
          oauth={serverId !== undefined ? { status: oauth.status, connecting: oauth.connecting, onConnect: handleConnect, onDisconnect: handleDisconnect } : undefined}
        />
      </div>
      {view === 'template' && <TemplateGallery onSelect={applyTemplate} />}
    </Modal>
  );
}
