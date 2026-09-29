import React from 'react';
import { Alert, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { NS } from '../../constants';
import NativeNetworkSettings from './NativeNetworkSettings';

const names = ['request_config', 'mattermostwebhook_request_config'];

/**
 * Mattermost Webhook 媒介只有外观默认值和网络设置：Webhook 地址（一个地址对应一个频道）在通知规则里填。
 * 字段都不设 initialValue，原因见 Jira.tsx。
 */
export default function MattermostWebhook() {
  const { t } = useTranslation(NS);
  const request_type = Form.useWatch('request_type');
  const active = request_type === 'mattermostwebhook';

  return (
    <div style={{ display: active ? 'block' : 'none' }}>
      <Alert className='mb-4' type='info' showIcon message={t('mattermostwebhook_request_config.top_tip')} />
      <Form.Item label={t('mattermostwebhook_request_config.username')} tooltip={t('mattermostwebhook_request_config.username_tip')} name={[...names, 'username']}>
        <Input placeholder='Nightingale' />
      </Form.Item>
      <Form.Item
        label={t('mattermostwebhook_request_config.icon')}
        tooltip={t('mattermostwebhook_request_config.icon_tip')}
        name={[...names, 'icon']}
        rules={[
          {
            validator: (_rule, value?: string) => {
              const v = (value || '').trim();
              // 与后端校验一致：图片地址或 :emoji: 代码
              if (!active || !v || v.includes('{{') || /^https?:\/\//i.test(v) || /^:[a-z0-9_+-]+:$/.test(v)) return Promise.resolve();
              return Promise.reject(new Error(t('mattermostwebhook_request_config.icon_invalid')));
            },
          },
        ]}
      >
        <Input placeholder=':bell:  /  https://example.com/logo.png' />
      </Form.Item>
      <NativeNetworkSettings
        names={names}
        proxyTip={t('mattermostwebhook_request_config.proxy_tip')}
        insecureTip={t('mattermostwebhook_request_config.insecure_skip_verify_tip')}
      />
    </div>
  );
}
