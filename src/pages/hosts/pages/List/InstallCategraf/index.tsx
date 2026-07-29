import React, { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Input, Button, Alert, Space, Tag, Collapse, Form } from 'antd';
import { LoadingOutlined, CheckCircleFilled } from '@ant-design/icons';
import _ from 'lodash';

import { CommonStateContext } from '@/App';

import { NS } from '../../../constants';
import { CategrafInstallMeta } from '../../../services';
import CommandBlock from '../components/CommandBlock';
import { buildInstallCommand, buildManualCommand, isValidServerAddr, normalizeServerAddr } from './buildCommand';
import useTargetArrival from './useTargetArrival';

interface Props {
  meta: CategrafInstallMeta;
  /** detected 表示期间确实有新机器上报，父级据此决定是否刷新列表 */
  onClose: (detected: boolean) => void;
  /** 检测到新机器后展示的追加动作（如「下一步：配置采集」CTA） */
  detectedExtra?: React.ReactNode;
}

export default function InstallCategraf(props: Props) {
  const { meta, onClose, detectedExtra } = props;
  const { t } = useTranslation(NS);
  const { siteInfo } = useContext(CommonStateContext);

  // 输入框存原始字符串，只在拼命令与校验时 normalize，
  // 否则用户刚敲一个字符就被补成 http://x 很难继续输入
  const [addr, setAddr] = useState<string>(() => meta.base_url || normalizeServerAddr(siteInfo?.site_url) || window.location.origin);
  const [authUser, setAuthUser] = useState('');
  const [authPass, setAuthPass] = useState('');

  const { status, newIdents, restart } = useTargetArrival();
  const detected = status === 'detected';

  const addrValid = isValidServerAddr(addr);
  const authFilled = !!_.trim(authUser);
  const command = useMemo(
    () => (addrValid ? buildInstallCommand({ serverAddr: addr, basicAuthUser: authUser, basicAuthPass: authPass }) : ''),
    [addr, authUser, authPass, addrValid],
  );

  return (
    <Modal
      visible
      width={760}
      title={t('install.title')}
      onCancel={() => onClose(detected)}
      footer={
        <Button type='primary' onClick={() => onClose(detected)}>
          {t('install.done')}
        </Button>
      }
    >
      <Form layout='vertical'>
        <Form.Item
          label={t('install.addr_label')}
          extra={t('install.addr_tip')}
          validateStatus={addrValid ? undefined : 'error'}
          help={addrValid ? undefined : t('install.addr_invalid')}
        >
          <Input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder='http://10.1.1.1:17000' />
        </Form.Item>

        {meta.basic_auth && (
          <Form.Item
            label={t('install.basic_auth_label')}
            validateStatus={authFilled ? undefined : 'warning'}
            help={authFilled ? undefined : t('install.basic_auth_tip')}
          >
            <Space>
              <Input value={authUser} onChange={(e) => setAuthUser(e.target.value)} placeholder={t('install.basic_auth_user')} />
              <Input.Password value={authPass} onChange={(e) => setAuthPass(e.target.value)} placeholder={t('install.basic_auth_pass')} />
            </Space>
          </Form.Item>
        )}

        <Form.Item label={t('install.step_run')} className='mb-2'>
          {command ? <CommandBlock command={command} /> : null}
        </Form.Item>

        <div className='mb-3'>
          <Space size={4} wrap>
            <Tag>{t('install.version', { version: meta.version })}</Tag>
            {meta.bundled ? <Tag color='green'>{t('install.bundled_tip')}</Tag> : <Tag color='orange'>{t('install.not_bundled_tip')}</Tag>}
          </Space>
        </div>

        <Collapse ghost className='mb-2'>
          <Collapse.Panel header={t('install.advanced')} key='advanced'>
            <div className='mb-1 opacity-70'>{t('install.manual_cmd_tip')}</div>
            {addrValid ? <CommandBlock command={buildManualCommand({ serverAddr: addr, basicAuthUser: authUser, basicAuthPass: authPass })} /> : null}
            <div className='mt-2 opacity-70'>{t('install.windows_tip')}</div>
          </Collapse.Panel>
        </Collapse>

        <Form.Item label={t('install.step_wait')} className='mb-0'>
          {detected ? (
            <Alert
              type='success'
              showIcon
              icon={<CheckCircleFilled />}
              message={
                _.isEmpty(newIdents)
                  ? t('install.detected_generic')
                  : t('install.detected', { count: newIdents.length, idents: _.join(_.take(newIdents, 3), ', ') })
              }
              description={
                <>
                  <div>{t('install.detected_next')}</div>
                  {detectedExtra ? <div className='mt-2'>{detectedExtra}</div> : null}
                </>
              }
            />
          ) : status === 'timeout' ? (
            <Alert
              type='warning'
              showIcon
              message={t('install.timeout')}
              description={
                <>
                  <div>{t('install.timeout_tip')}</div>
                  <Button size='small' className='mt-2' onClick={restart}>
                    {t('install.retry')}
                  </Button>
                </>
              }
            />
          ) : (
            <Space className='opacity-70'>
              <LoadingOutlined />
              {t('install.waiting')}
            </Space>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
}
